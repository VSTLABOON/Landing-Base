import { useState } from 'react';
import {
  Truck,
  Plus,
  Trash2,
  Phone,
  Activity,
  MapPin,
  X,
  Check,
  Bike,
  Car,
  AlertCircle
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { toast } from '../../store/toastStore';
import { CARD } from './components/config/SharedUI';

interface Repartidor {
  id: string;
  nombre: string;
  telefono: string;
  vehiculo: 'moto' | 'auto' | 'bici';
  estatus: 'disponible' | 'en_entrega' | 'inactivo';
  pedidosActivos: number;
}

const INITIAL_DRIVERS: Repartidor[] = [
  { id: '1', nombre: 'Carlos Mendoza', telefono: '+52 81 1234 5678', vehiculo: 'moto', estatus: 'disponible', pedidosActivos: 0 },
  { id: '2', nombre: 'Sofía Martínez', telefono: '+52 81 8765 4321', vehiculo: 'auto', estatus: 'en_entrega', pedidosActivos: 2 },
  { id: '3', nombre: 'Eduardo Gómez', telefono: '+52 81 2468 1357', vehiculo: 'moto', estatus: 'inactivo', pedidosActivos: 0 },
];

export default function AdminRepartidores() {
  const { tenant } = useTenant();
  const tenantColor = tenant.color_primario || '#1a7f5a';

  const [drivers, setDrivers] = useState<Repartidor[]>(INITIAL_DRIVERS);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [newNombre, setNewNombre] = useState('');
  const [newTelefono, setNewTelefono] = useState('');
  const [newVehiculo, setNewVehiculo] = useState<'moto' | 'auto' | 'bici'>('moto');
  const [newEstatus, setNewEstatus] = useState<'disponible' | 'en_entrega' | 'inactivo'>('disponible');

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim() || !newTelefono.trim()) {
      toast.error('Campos incompletos', {
        message: 'Por favor rellena el nombre y teléfono del repartidor.',
      });
      return;
    }

    const newDriver: Repartidor = {
      id: Date.now().toString(),
      nombre: newNombre.trim(),
      telefono: newTelefono.trim(),
      vehiculo: newVehiculo,
      estatus: newEstatus,
      pedidosActivos: 0
    };

    setDrivers([...drivers, newDriver]);
    setShowAddModal(false);
    
    // Reset Form
    setNewNombre('');
    setNewTelefono('');
    setNewVehiculo('moto');
    setNewEstatus('disponible');

    toast.success('Repartidor agregado', {
      message: `${newDriver.nombre} se ha unido al equipo de reparto.`,
    });
  };

  const handleDeleteDriver = (id: string, name: string) => {
    setDrivers(drivers.filter(d => d.id !== id));
    toast.success('Repartidor removido', {
      message: `${name} fue dado de baja del sistema.`,
    });
  };

  const handleToggleStatus = (id: string, currentStatus: Repartidor['estatus']) => {
    const statusMap: Record<Repartidor['estatus'], Repartidor['estatus']> = {
      'disponible': 'en_entrega',
      'en_entrega': 'inactivo',
      'inactivo': 'disponible'
    };
    
    setDrivers(drivers.map(d => {
      if (d.id === id) {
        return { ...d, estatus: statusMap[currentStatus] };
      }
      return d;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Equipo de Repartidores</h1>
          <p className="text-sm text-[var(--color-text-tertiary)]">
            Gestiona los mensajeros, su disponibilidad y vehículos asignados en tiempo real.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: tenantColor, color: '#fff' }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-97 transition-all shadow-sm focus:outline-none"
        >
          <Plus className="w-4 h-4" /> Agregar Repartidor
        </button>
      </div>

      {/* Grid de Repartidores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => {
          const VehicleIcon = driver.vehiculo === 'moto' ? Bike : driver.vehiculo === 'auto' ? Car : Truck;
          const statusColors = {
            disponible: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            en_entrega: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
            inactivo: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
          };
          const statusLabels = {
            disponible: 'Disponible',
            en_entrega: 'En Entrega',
            inactivo: 'Inactivo'
          };

          return (
            <div key={driver.id} className={`${CARD} p-5 space-y-4 relative group`}>
              {/* Botón Eliminar */}
              <button
                type="button"
                onClick={() => handleDeleteDriver(driver.id, driver.nombre)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-200"
                title="Dar de baja"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: `${tenantColor}12`, color: tenantColor }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                >
                  <VehicleIcon size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] leading-tight">{driver.nombre}</h3>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold tracking-wider">
                    {driver.vehiculo === 'moto' ? 'Motocicleta' : driver.vehiculo === 'auto' ? 'Automóvil' : 'Bicicleta'}
                  </span>
                </div>
              </div>

              {/* Stats / Datos de contacto */}
              <div className="space-y-2 text-xs text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
                  <span>{driver.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
                  <span>pedidos asignados: <strong className="text-[var(--color-text-primary)]">{driver.pedidosActivos}</strong></span>
                </div>
              </div>

              {/* Botón de Cambiar Estatus */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-tertiary)]">
                <span className={`text-[10px] font-bold border px-2 py-1 rounded-full ${statusColors[driver.estatus]}`}>
                  {statusLabels[driver.estatus]}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(driver.id, driver.estatus)}
                  className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 font-semibold"
                >
                  Cambiar Estado →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Agregar Repartidor */}
      {showAddModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
          <div className="w-full max-w-md bg-[var(--color-background-primary)] border border-[var(--color-border-secondary)] rounded-2xl shadow-xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-tertiary)]">
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">Nuevo Repartidor</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDriver} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-white/30 dark:border-white/10 rounded-lg text-sm bg-white/50 dark:bg-black/50 text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Ej. Juan Pérez"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Teléfono</label>
                <input
                  type="tel"
                  required
                  value={newTelefono}
                  onChange={(e) => setNewTelefono(e.target.value)}
                  className="w-full px-3 py-2 border border-white/30 dark:border-white/10 rounded-lg text-sm bg-white/50 dark:bg-black/50 text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Ej. +52 81 9999 9999"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Vehículo</label>
                  <select
                    value={newVehiculo}
                    onChange={(e) => setNewVehiculo(e.target.value as any)}
                    className="w-full px-3 py-2 border border-white/30 dark:border-white/10 rounded-lg text-sm bg-white/50 dark:bg-black/50 text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="moto">Motocicleta</option>
                    <option value="auto">Automóvil</option>
                    <option value="bici">Bicicleta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Estado Inicial</label>
                  <select
                    value={newEstatus}
                    onChange={(e) => setNewEstatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-white/30 dark:border-white/10 rounded-lg text-sm bg-white/50 dark:bg-black/50 text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="en_entrega">En entrega</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--color-background-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-tertiary)] active:scale-97 transition-all focus:outline-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: tenantColor }}
                  className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg text-white hover:opacity-90 active:scale-97 transition-all shadow-sm focus:outline-none"
                >
                  Guardar Repartidor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
