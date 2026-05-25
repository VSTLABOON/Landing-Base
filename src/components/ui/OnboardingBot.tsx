import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, Sparkles, AlertTriangle } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import systemPrompt from '../../../docs/agent-prompt.md?raw';
import { useTenant } from '../../context/TenantContext';
import { supabase } from '../../lib/supabaseClient';

// Inicializar SDK
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

interface OnboardingBotProps {
  onClose: () => void;
}

export function OnboardingBot({ onClose }: OnboardingBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Bienvenida. Vi que acabas de entrar a tu panel de control — eso ya es el paso más difícil. ¿Hay algo en lo que quieras arrancar primero, o te cuento por dónde conviene empezar?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  const { tenant } = useTenant();

  // Iniciar la sesión de chat con Gemini, inyectando contexto del tenant
  useEffect(() => {
    async function initChat() {
      if (!genAI || chatSessionRef.current || !tenant?.id) return;

      try {
        // Fetch productos de la tienda para darle contexto
        const { data: productos } = await supabase
          .from('productos')
          .select('nombre, descripcion, precio, disponible')
          .eq('tienda_id', tenant.id);

        const contextInfo = `
---
CONTEXTO EN TIEMPO REAL DEL USUARIO (SISTEMA):
- Nombre de la Tienda: ${tenant.nombre || 'Sin configurar'}
- Color Identificativo: ${tenant.color_primario || 'default'}
- Catálogo de arreglos registrados (${productos?.length || 0}):
${productos?.length ? productos.map(p => `  * ${p.nombre} ($${p.precio}) - ${p.disponible ? 'Activo' : 'Oculto'}`).join('\n') : '  (No hay arreglos registrados aún)'}
---
REGLAS ESTRICTAS DE FORMATO:
1. NUNCA uses asteriscos (**) para negritas ni para listas. 
2. Tu respuesta debe ser 100% texto plano sin formato Markdown.
3. Si necesitas resaltar el nombre de un arreglo, sección o concepto, usa únicamente comillas simples (ejemplo: 'Ramo de Rosas').
---
        `;

        const finalSystemInstruction = systemPrompt + '\n' + contextInfo;

        const model = genAI.getGenerativeModel({ 
          model: 'gemini-flash-latest',
          systemInstruction: finalSystemInstruction,
          generationConfig: {
            temperature: 0.7,
          }
        });
        
        chatSessionRef.current = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: "Hola" }],
            },
            {
              role: "model",
              parts: [{ text: messages[0].text }],
            },
          ]
        });
      } catch (err) {
        console.error("Error inicializando contexto del bot:", err);
      }
    }

    initChat();
  }, [tenant?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      if (chatSessionRef.current) {
        // Enviar mensaje a Gemini
        const result = await chatSessionRef.current.sendMessage(newUserMsg.text);
        const botResponseText = result.response.text();
        
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: botResponseText,
          timestamp: new Date()
        }]);
      } else {
        // Fallback si no hay API Key
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: '¡Hola! Para que pueda pensar y responder inteligentemente usando mi personalidad, necesitas agregar `VITE_GEMINI_API_KEY` en tu archivo `.env.local` y reiniciar.',
            timestamp: new Date()
          }]);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error con Gemini detallado:', error);
      let errorMessage = 'Tuve un pequeño problema técnico procesando eso.';
      
      if (error?.message) {
        errorMessage = `Error de API: ${error.message}`;
      } else if (error?.status) {
        errorMessage = `Error de conexión (Status: ${error.status})`;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: errorMessage,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-[5.5rem] lg:bottom-6 right-4 lg:right-6 z-50 w-[calc(100%-2rem)] sm:w-[380px] max-w-[400px] h-[500px] max-h-[calc(100vh-8rem)] bg-[var(--color-background-primary)] border border-[var(--color-border-secondary)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header del Chat */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-background-secondary)] border-b border-[var(--color-border-secondary)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Tu Asistente</h3>
            <p className="text-[0.65rem] text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold">En línea</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background-tertiary)] rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--color-background-primary)]">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
              <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isBot ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>
              <div className={`px-4 py-2.5 rounded-2xl text-sm ${isBot ? 'bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] rounded-tl-none border border-[var(--color-border-secondary)]' : 'bg-emerald-600 text-white rounded-tr-none'}`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[var(--color-background-secondary)] border border-[var(--color-border-secondary)] rounded-tl-none flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-tertiary)] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-tertiary)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-tertiary)] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Área */}
      <div className="p-3 bg-[var(--color-background-primary)] border-t border-[var(--color-border-secondary)] shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Escribe tu duda aquí..."
            className="w-full h-11 pl-4 pr-12 bg-[var(--color-background-secondary)] border border-[var(--color-border-secondary)] rounded-full text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-1.5 w-8 h-8 flex items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors"
          >
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
        <div className="text-center mt-2 flex items-center justify-center gap-1">
          {!apiKey ? (
            <>
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span className="text-[0.6rem] text-amber-600 font-medium">Falta VITE_GEMINI_API_KEY en .env</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span className="text-[0.6rem] text-[var(--color-text-tertiary)]">Impulsado por Google Gemini 1.5</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
