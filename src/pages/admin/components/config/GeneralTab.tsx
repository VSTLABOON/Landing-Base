import React, { useState } from 'react';
import { Heart, MapPin, Gift, Globe, Truck, Plus, Trash2 } from 'lucide-react';
import { Accordion } from './SharedUI';

export function GeneralTab({ 
  state, 
  actions,
  tenant
}: { 
  state: any, 
  actions: any,
  tenant: any
}) {
  const { textoNosotros, anioFundacion, firma, mapaUrl, direccion, colonias, metaTitle, zonasEnvio = [], eventoActivo, eventoTitulo, eventoProducto, eventoFechaFin, openAccordions } = state;
  const { setTextoNosotros, setAnioFundacion, setFirma, setMapaUrl, setDireccion, setColonias, setMetaTitle, setZonasEnvio, setEventoActivo, setEventoTitulo, setEventoProducto, setEventoFechaFin, onToggleAccordion } = actions;

  const [seoOpen, setSeoOpen] = useState(true);

  const handleAddZona = () => {
    setZonasEnvio([...zonasEnvio, { nombre: 'Nueva Zona', costo: 50 }]);
  };

  const handleUpdateZona = (index: number, field: 'nombre' | 'costo', value: any) => {
    const updated = [...zonasEnvio];
    updated[index] = { ...updated[index], [field]: value };
    setZonasEnvio(updated);
  };

  const handleRemoveZona = (index: number) => {
    const updated = [...zonasEnvio];
    updated.splice(index, 1);
    setZonasEnvio(updated);
  };

  return (
    <div className="space-y-6">
      <Accordion 
        id="editor-SEO"
        title="Identidad Digital (Pestaña del Navegador)" 
        icon={Globe} 
        isOpen={seoOpen}
        onToggle={setSeoOpen}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Título de pestaña
            </label>
            <input
              id="metaTitle"
              type="text"
              maxLength={60}
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full px-4 py-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" style={{ fontSize: '16px' }}
              placeholder="Ej: Flores del Amor — Tu Florería en Monterrey"
            />
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
              Máximo 60 caracteres. Si se deja vacío, el navegador mostrará por defecto: <strong>{tenant.nombre} — {tenant.ciudad}</strong>.
            </p>
          </div>
        </div>
      </Accordion>
      <Accordion 
        id="editor-Nosotros"
        title="Sobre Nosotros" 
        icon={Heart} 
        isOpen={openAccordions.Nosotros}
        onToggle={(open) => onToggleAccordion('Nosotros', open)}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="textoNosotros" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Historia / Descripción</label>
            <textarea
              id="textoNosotros"
              value={textoNosotros}
              onChange={(e) => setTextoNosotros(e.target.value)}
              className="w-full px-4 py-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all min-h-[100px] leading-relaxed" style={{ fontSize: '16px' }}
              placeholder="Cuenta la historia de tu florería..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="anioFundacion" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Año de fundación</label>
              <input
                id="anioFundacion"
                type="number"
                value={anioFundacion}
                onChange={(e) => setAnioFundacion(parseInt(e.target.value) || 2020)}
                className="w-full px-4 py-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" style={{ fontSize: '16px' }}
              />
            </div>
            <div>
              <label htmlFor="firma" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Firma (Ej. "El equipo de...")</label>
              <input
                id="firma"
                type="text"
                value={firma}
                onChange={(e) => setFirma(e.target.value)}
                className="w-full px-4 py-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" style={{ fontSize: '16px' }}
              />
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion 
        id="editor-Cobertura"
        title="Cobertura" 
        icon={MapPin} 
        isOpen={openAccordions.Cobertura}
        onToggle={(open) => onToggleAccordion('Cobertura', open)}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Dirección Física de la Tienda</label>
            <input
              id="direccion"
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full px-4 py-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" style={{ fontSize: '16px' }}
              placeholder="Ej: Av. Constitución 456, Col. Centro, Monterrey"
            />
          </div>
          <div>
            <label htmlFor="mapaUrl" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Enlace del Mapa (Google Maps URL)</label>
            <input
              id="mapaUrl"
              type="text"
              value={mapaUrl}
              onChange={(e) => setMapaUrl(e.target.value)}
              className="w-full px-4 py-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" style={{ fontSize: '16px' }}
              placeholder="https://maps.app.goo.gl/..."
            />
          </div>
          <div>
            <label htmlFor="colonias" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Colonias de entrega (separadas por coma)</label>
            <textarea
              id="colonias"
              value={colonias}
              onChange={(e) => setColonias(e.target.value)}
              className="w-full px-4 py-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all min-h-[80px] leading-relaxed" style={{ fontSize: '16px' }}
              placeholder="Centro, San Pedro, Cumbres..."
            />
          </div>
        </div>
      </Accordion>

      <Accordion 
        id="editor-ZonasEnvio"
        title="Zonas de Envío" 
        icon={Truck}
        isOpen={openAccordions.ZonasEnvio}
        onToggle={(open) => onToggleAccordion('ZonasEnvio', open)}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Costos de Envío por Zona</h3>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Configura zonas de entrega y sus tarifas correspondientes (MXN).</p>
            </div>
            <button
              type="button"
              onClick={handleAddZona}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Zona
            </button>
          </div>

          {zonasEnvio.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-white/20 dark:border-white/10 rounded-xl bg-white/5">
              <Truck className="w-8 h-8 text-[var(--color-text-tertiary)] mx-auto mb-2 opacity-50" />
              <p className="text-xs text-[var(--color-text-secondary)] font-medium">No tienes zonas de envío configuradas</p>
              <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">Se utilizará el costo de envío general por defecto (${tenant.envio_costo || 0} MXN).</p>
            </div>
          ) : (
            <div className="space-y-3">
              {zonasEnvio.map((zona: any, index: number) => (
                <div key={index} className="flex items-end gap-3 p-3 bg-white/5 border border-white/10 rounded-xl animate-fade-up">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1 font-medium">Nombre de la Zona</label>
                    <input
                      type="text"
                      value={zona.nombre}
                      onChange={(e) => handleUpdateZona(index, 'nombre', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white/10 dark:bg-black/40 border border-white/20 dark:border-white/10 rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      placeholder="Ej: Zona Norte, Cholula..."
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1 font-medium">Costo (MXN)</label>
                    <input
                      type="number"
                      min="0"
                      value={zona.costo}
                      onChange={(e) => handleUpdateZona(index, 'costo', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-white/10 dark:bg-black/40 border border-white/20 dark:border-white/10 rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveZona(index)}
                    className="p-2.5 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors self-end"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Accordion>

      <Accordion title="Evento / Promoción (Banner Superior)" icon={Gift}>
        <div className="flex items-center justify-between mb-4 bg-emerald-500/10 dark:bg-emerald-500/15 backdrop-blur-sm p-4 rounded-xl border border-emerald-500/20 dark:border-emerald-500/15">
          <div>
            <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Activar Banner Promocional</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">Muestra un mensaje especial en la parte superior de tu tienda.</p>
          </div>
          <label htmlFor="eventoActivo" className="relative inline-flex items-center cursor-pointer">
            <input id="eventoActivo" type="checkbox" className="sr-only peer" checked={eventoActivo} onChange={e => setEventoActivo(e.target.checked)} />
            <div className="w-11 h-6 bg-[var(--color-background-tertiary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--color-background-primary)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-background-primary)] after:border-[var(--color-border-secondary)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
        
        <div className={`space-y-4 transition-all duration-300 ${!eventoActivo ? 'opacity-50 pointer-events-none filter grayscale' : ''}`}>
          <div>
            <label htmlFor="eventoTitulo" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Título del anuncio</label>
            <input
              id="eventoTitulo"
              type="text"
              value={eventoTitulo}
              onChange={(e) => setEventoTitulo(e.target.value)}
              className="w-full px-4 py-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" style={{ fontSize: '16px' }}
              placeholder="Ej. ¡Día de las Madres!"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="eventoProducto" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Nombre de producto o promoción</label>
              <input
                id="eventoProducto"
                type="text"
                value={eventoProducto}
                onChange={(e) => setEventoProducto(e.target.value)}
                className="w-full px-4 py-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" style={{ fontSize: '16px' }}
                placeholder="Ej. 20% OFF en Arreglos"
              />
            </div>
            <div>
              <label htmlFor="eventoFechaFin" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Fecha y hora límite</label>
              <input
                id="eventoFechaFin"
                type="datetime-local"
                value={eventoFechaFin}
                onChange={(e) => setEventoFechaFin(e.target.value)}
                className="w-full px-4 py-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" style={{ fontSize: '16px' }}
              />
            </div>
          </div>
        </div>
      </Accordion>
    </div>
  );
}
