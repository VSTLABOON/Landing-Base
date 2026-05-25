import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const CARD = 'relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.37)] transition-colors duration-500 ease-out group';

const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer pointer-events-none transition-none z-0" />
);

export function Accordion({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  id
}: { 
  title: string, 
  icon: any, 
  children: React.ReactNode, 
  defaultOpen?: boolean,
  isOpen?: boolean,
  onToggle?: (open: boolean) => void,
  id?: string
}) {
  const [localIsOpen, setLocalIsOpen] = useState(defaultOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : localIsOpen;
  
  const handleToggle = () => {
    const nextState = !isOpen;
    if (onToggle) {
      onToggle(nextState);
    } else {
      setLocalIsOpen(nextState);
    }
  };

  return (
    <div className={CARD} id={id}>
      <Shimmer />
      <button 
        type="button" 
        onClick={handleToggle} 
        className="relative z-10 w-full flex items-center justify-between p-6 hover:bg-white/10 dark:hover:bg-white/5 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm border border-white/20 dark:border-white/10 flex items-center justify-center text-[var(--color-text-primary)]">
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{title}</h2>
        </div>
        <ChevronDown className={`w-5 h-5 text-[var(--color-text-tertiary)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`relative z-10 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-8 pt-2 border-t border-[var(--color-border-tertiary)]/50">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ColorPickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value?.match(/^#[0-9a-fA-F]{6}$/) ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg border-2 border-[var(--color-border-secondary)] cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 h-10 px-3 bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-lg text-sm font-mono text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all uppercase"
          maxLength={7}
          style={{ fontSize: '16px' }}
        />
      </div>
    </div>
  );
}
