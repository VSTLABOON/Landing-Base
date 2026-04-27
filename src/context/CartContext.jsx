import { createContext, useState, useContext, useCallback, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const agregarAlCarrito = useCallback((item) => {
    setCart((prevCart) => {
      const yaExiste = prevCart.some((i) => i.id === item.id);
      if (yaExiste) return prevCart;
      return [...prevCart, item];
    });
  }, []);

  const eliminarDelCarrito = useCallback((id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  }, []);

  const calcularTotal = useCallback(() => {
    return cart.reduce((total, item) => {
      const precio = item.precioNum || 0;
      return total + precio;
    }, 0);
  }, [cart]);

  const vaciarCarrito = useCallback(() => {
    setCart([]);
  }, []);

  const abrirCarrito = useCallback(() => setIsCartOpen(true), []);
  const cerrarCarrito = useCallback(() => setIsCartOpen(false), []);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen]);

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        agregarAlCarrito, 
        eliminarDelCarrito, 
        calcularTotal,
        vaciarCarrito,
        isCartOpen,
        abrirCarrito,
        cerrarCarrito
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}
