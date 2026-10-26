/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TICKETS, CONFIG } from '../data.ts';

const CART_STORAGE_KEY = 'maf_cart_v1';

interface CartContextType {
  categoryId: string;
  categoryName: string;
  unitPrice: number;
  quantity: number;
  holderNames: string[];
  selectCategory: (categoryId: string) => void;
  setQuantity: (qty: number) => void;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
  setHolderName: (index: number, name: string) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialisation par défaut : Grand Public, 1 billet
  const defaultCategory = TICKETS[0];

  const [categoryId, setCategoryId] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.categoryId && TICKETS.some((t) => t.id === parsed.categoryId)) {
          return parsed.categoryId;
        }
      }
    } catch {
      // fallback
    }
    return defaultCategory.id;
  });

  const [quantity, setQuantityState] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.quantity === 'number' && parsed.quantity >= 1) {
          return Math.min(parsed.quantity, CONFIG.MAX_PER_ORDER);
        }
      }
    } catch {
      // fallback
    }
    return 1;
  });

  const [holderNames, setHolderNames] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.holderNames)) {
          return parsed.holderNames;
        }
      }
    } catch {
      // fallback
    }
    return [''];
  });

  const activeTicket = TICKETS.find((t) => t.id === categoryId) || defaultCategory;
  const categoryName = activeTicket.name;
  const unitPrice = activeTicket.numericPrice;
  const totalPrice = unitPrice * quantity;

  // Sauvegarde dans le stockage local à chaque modification
  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          categoryId,
          quantity,
          holderNames
        })
      );
    } catch (err) {
      console.error('Erreur de sauvegarde locale du panier', err);
    }
  }, [categoryId, quantity, holderNames]);

  const selectCategory = (newCatId: string) => {
    setCategoryId(newCatId);
  };

  const setQuantity = (qty: number) => {
    const clamped = Math.max(1, Math.min(qty, CONFIG.MAX_PER_ORDER));
    setQuantityState(clamped);
    setHolderNames((prev) => {
      const next = [...prev];
      while (next.length < clamped) next.push('');
      return next.slice(0, clamped);
    });
  };

  const incrementQuantity = () => {
    if (quantity < CONFIG.MAX_PER_ORDER) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const setHolderName = (index: number, name: string) => {
    setHolderNames((prev) => {
      const next = [...prev];
      next[index] = name;
      return next;
    });
  };

  const clearCart = () => {
    setCategoryId(defaultCategory.id);
    setQuantityState(1);
    setHolderNames(['']);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // noop
    }
  };

  return (
    <CartContext.Provider
      value={{
        categoryId,
        categoryName,
        unitPrice,
        quantity,
        holderNames,
        selectCategory,
        setQuantity,
        incrementQuantity,
        decrementQuantity,
        setHolderName,
        clearCart,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé à l’intérieur d’un CartProvider');
  }
  return context;
};
