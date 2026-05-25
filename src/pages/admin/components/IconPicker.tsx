import { useState, useMemo } from 'react';
import {
  Heart, Gift, Sparkles, Flower2, Leaf, Sun, Star,
  Cake, Building2, Users, Truck, Clock, Shield, Zap,
  Camera, MapPin, Phone, Mail, CheckCircle, Search, HelpCircle
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  heart: <Heart strokeWidth={1.5} />,
  gift: <Gift strokeWidth={1.5} />,
  sparkles: <Sparkles strokeWidth={1.5} />,
  flower: <Flower2 strokeWidth={1.5} />,
  leaf: <Leaf strokeWidth={1.5} />,
  sun: <Sun strokeWidth={1.5} />,
  star: <Star strokeWidth={1.5} />,
  cake: <Cake strokeWidth={1.5} />,
  building: <Building2 strokeWidth={1.5} />,
  users: <Users strokeWidth={1.5} />,
  truck: <Truck strokeWidth={1.5} />,
  clock: <Clock strokeWidth={1.5} />,
  shield: <Shield strokeWidth={1.5} />,
  zap: <Zap strokeWidth={1.5} />,
  camera: <Camera strokeWidth={1.5} />,
  map: <MapPin strokeWidth={1.5} />,
  phone: <Phone strokeWidth={1.5} />,
  mail: <Mail strokeWidth={1.5} />,
  check: <CheckCircle strokeWidth={1.5} />,
};

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  options?: string[]; // Array of keys from ICON_MAP to show. If undefined, show all.
}

export function IconPicker({ value, onChange, options }: IconPickerProps) {
  const [search, setSearch] = useState('');

  const displayOptions = useMemo(() => {
    const keys = options || Object.keys(ICON_MAP);
    if (!search.trim()) return keys;
    return keys.filter(k => k.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar ícono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-[var(--color-border-secondary)] rounded-lg text-sm bg-[var(--color-background-primary)] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 p-3 bg-white/30 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl max-h-[200px] overflow-y-auto">
        {displayOptions.map(key => {
          const isSelected = value === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              title={key}
              type="button"
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg border transition-all duration-200
                ${isSelected 
                  ? 'bg-emerald-500/10 dark:bg-emerald-400/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'bg-white/40 dark:bg-black/40 border-white/20 dark:border-white/10 text-[var(--color-text-tertiary)] hover:bg-white/60 dark:hover:bg-white/10 hover:border-white/50 dark:hover:border-white/30'
                }
              `}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {ICON_MAP[key] || <HelpCircle className="w-5 h-5 text-[var(--color-text-tertiary)]" />}
              </div>
            </button>
          );
        })}
        {displayOptions.length === 0 && (
          <div className="col-span-full py-4 text-center text-sm text-[var(--color-text-tertiary)]">
            No se encontraron íconos.
          </div>
        )}
      </div>
    </div>
  );
}
