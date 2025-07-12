'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  points: number;
  category: string;
  type: string;
  size: string;
  condition: string;
  seller: {
    name: string;
    email: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getTotalPoints: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('rewear-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('rewear-cart');
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('rewear-cart', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      setItems([]);
      localStorage.removeItem('rewear-cart');
    };

    // Listen for custom logout event
    window.addEventListener('user-logout', handleLogout);
    
    return () => {
      window.removeEventListener('user-logout', handleLogout);
    };
  }, []);

  const addToCart = (item: CartItem) => {
    setItems(prev => {
      // Check if item already exists in cart
      const exists = prev.find(cartItem => cartItem.id === item.id);
      if (exists) {
        return prev; // Don't add duplicate
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('rewear-cart');
  };

  const getTotalPoints = () => {
    return items.reduce((total, item) => total + item.points, 0);
  };

  const getItemCount = () => {
    return items.length;
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      clearCart,
      getTotalPoints,
      getItemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 