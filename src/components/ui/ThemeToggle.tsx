import { Moon, Sun } from 'lucide-react';
import { useThemeContext } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] transition-colors"
      aria-label="Alternar modo oscuro"
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div className="theme-icon">
        <Sun className="sun w-5 h-5" strokeWidth={1.8} />
        <Moon className="moon w-5 h-5" strokeWidth={1.8} />
      </div>
    </button>
  );
}
