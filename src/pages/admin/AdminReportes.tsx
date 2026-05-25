import { useState } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Percent,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { CARD } from './components/config/SharedUI';

const MOCK_SALES_DATA = [
  { fecha: 'Lunes', ventas: 4200, pedidos: 12 },
  { fecha: 'Martes', ventas: 5100, pedidos: 15 },
  { fecha: 'Miércoles', ventas: 3800, pedidos: 10 },
  { fecha: 'Jueves', ventas: 7200, pedidos: 22 },
  { fecha: 'Viernes', ventas: 8900, pedidos: 25 },
  { fecha: 'Sábado', ventas: 12400, pedidos: 38 },
  { fecha: 'Domingo', ventas: 9800, pedidos: 30 },
];

const MOCK_TOP_PRODUCTS = [
  { name: 'Rosas Rojas (12u)', cantidad: 45 },
  { name: 'Tulipanes Multicolor', cantidad: 32 },
  { name: 'Girasoles Soleados', cantidad: 28 },
  { name: 'Orquídea Elegante', cantidad: 19 },
  { name: 'Arreglo Cumpleaños', cantidad: 15 },
];

export default function AdminReportes() {
  const { tenant } = useTenant();
  const tenantColor = tenant.color_primario || '#1a7f5a';
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Reportes y Estadísticas</h1>
          <p className="text-sm text-[var(--color-text-tertiary)]">
            Analiza las ventas, pedidos y desempeño general de tu florería.
          </p>
        </div>

        {/* Selector de Rango */}
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="appearance-none bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-sm"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="3m">Últimos 3 meses</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none" />
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Ventas Totales',
            value: '$51,400',
            change: '+18.4%',
            icon: DollarSign,
            color: tenantColor,
          },
          {
            title: 'Pedidos Completados',
            value: '152',
            change: '+12.5%',
            icon: ShoppingBag,
            color: tenantColor,
          },
          {
            title: 'Ticket Promedio',
            value: '$338',
            change: '+5.2%',
            icon: TrendingUp,
            color: tenantColor,
          },
          {
            title: 'Tasa de Conversión',
            value: '3.4%',
            change: '+0.8%',
            icon: Percent,
            color: tenantColor,
          },
        ].map((kpi, idx) => (
          <div key={idx} className={`${CARD} p-5 flex items-center justify-between`}>
            <div className="space-y-1.5 min-w-0">
              <span className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider block">
                {kpi.title}
              </span>
              <span className="text-2xl font-bold text-[var(--color-text-primary)] block">
                {kpi.value}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                {kpi.change} <span className="text-[var(--color-text-tertiary)] font-normal">vs. período anterior</span>
              </span>
            </div>
            <div
              style={{ backgroundColor: `${kpi.color}12`, color: kpi.color }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            >
              <kpi.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Curva de Ventas */}
        <div className={`${CARD} p-6 space-y-4`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">Curva de Ingresos</h2>
              <p className="text-xs text-[var(--color-text-tertiary)]">Visualización de ingresos diarios en el rango seleccionado</p>
            </div>
            <Calendar className="w-5 h-5 text-[var(--color-text-tertiary)]" />
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_SALES_DATA}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={tenantColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={tenantColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="fecha"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(20, 20, 20, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
                  }}
                />
                <Area type="monotone" dataKey="ventas" name="Ventas ($)" stroke={tenantColor} strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Productos */}
        <div className={`${CARD} p-6 space-y-4`}>
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">Más Vendidos</h2>
            <p className="text-xs text-[var(--color-text-tertiary)]">Ranking de los arreglos con más volumen de ventas</p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_TOP_PRODUCTS} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-text-tertiary)', fontSize: 10 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={110}
                  tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(20, 20, 20, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="cantidad" name="Vendidos" fill={tenantColor} radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
