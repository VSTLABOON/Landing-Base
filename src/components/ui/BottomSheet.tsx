import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { type BottomSheetItem } from './BottomSheetConfig';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: BottomSheetItem[];
  tenantColor: string;
  onItemClick: (item: BottomSheetItem) => void;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  items,
  tenantColor,
  onItemClick
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 55,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(3px)',
            }}
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              // Drag down past 80px to close
              if (info.offset.y > 80) {
                onClose();
              }
            }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 60,
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              background: 'rgba(18, 18, 18, 0.96)',
              backdropFilter: 'blur(16px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
            }}
            className="px-6 pt-2 text-white max-h-[85vh] overflow-y-auto select-none"
          >
            {/* Drag Handle Indicator */}
            <div className="flex justify-center pb-4 pt-1 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors" />
            </div>

            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-white/90 tracking-wide">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 active:scale-95 transition-all focus:outline-none"
              >
                Cerrar
              </button>
            </div>

            {/* Grid Menu */}
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => {
                const isDestructive = item.destructive;
                const activeColor = isDestructive ? '#ef4444' : tenantColor;

                const buttonContent = (
                  <>
                    <item.icon
                      size={22}
                      strokeWidth={2}
                      style={{ color: activeColor }}
                      className="transition-transform duration-200 group-hover:scale-105"
                    />
                    <span
                      style={{ color: isDestructive ? '#ef4444' : 'rgba(255, 255, 255, 0.75)' }}
                      className="text-[12px] font-semibold text-center leading-tight transition-colors group-hover:text-white"
                    >
                      {item.label}
                    </span>
                  </>
                );

                const itemStyle = {
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center' as const,
                  justifyContent: 'center' as const,
                  gap: '8px',
                  width: '100%',
                };

                if (item.path) {
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => {
                        onItemClick(item);
                        onClose();
                      }}
                      style={itemStyle}
                      className="group hover:bg-white/10 hover:border-white/10 transition-all duration-200 active:scale-98"
                    >
                      {buttonContent}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onItemClick(item);
                    }}
                    style={itemStyle}
                    className="group hover:bg-white/10 hover:border-white/10 transition-all duration-200 active:scale-98 focus:outline-none"
                  >
                    {buttonContent}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
