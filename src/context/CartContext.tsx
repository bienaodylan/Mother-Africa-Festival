/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TICKETS, CONFIG } from '../data.ts';

const CART_STORAGE_KEY = 'maf_cart_v2';

export interface CartItem {
  categoryId: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  holderNames: string[];
  selectCategory: (categoryId: string) => void;
  addCategory: (categoryId: string) => void;
  removeCategory: (categoryId: string) => void;
  setCategoryQuantity: (categoryId: string, qty: number) => void;
  incrementCategory: (categoryId: string) => void;
  decrementCategory: (categoryId: string) => void;
  setHolderName: (index: number, name: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalQuantity: number;

  // Rétrocompatibilité pour usage simple
  categoryId: string;
  categoryName: string;
  unitPrice: number;
  quantity: number;
  setQuantity: (qty: number) => void;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultCategory = TICKETS[0];

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          return parsed.items.filter((item: CartItem) =>
            TICKETS.some((t) => t.id === item.categoryId)
          );
        }
      }
    } catch {
      // fallback
    }
    return [{ categoryId: defaultCategory.id, quantity: 1 }];
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

  const totalQuantity = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const totalPrice = items.reduce((acc, curr) => {
    const ticket = TICKETS.find((t) => t.id === curr.categoryId) || defaultCategory;
    return acc + ticket.numericPrice * curr.quantity;
  }, 0);

  // Synchronisation des noms de porteurs quand la quantité totale change
  useEffect(() => {
    setHolderNames((prev) => {
      const next = [...prev];
      while (next.length < totalQuantity) next.push('');
      return next.slice(0, Math.max(1, totalQuantity));
    });
  }, [totalQuantity]);

  // Sauvegarde dans le stockage local
  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          items,
          holderNames
        })
      );
    } catch (err) {
      console.error('Erreur sauvegarde locale panier', err);
    }
  }, [items, holderNames]);

  /**
   * Sélection d'un billet spécifique depuis la page Tarifs :
   * Isole UNIQUEMENT cette catégorie pour une commande ciblée sans encombrement.
   */
  const selectCategory = (newCatId: string) => {
    setItems([{ categoryId: newCatId, quantity: 1 }]);
    setHolderNames(['']);
  };

  /**
   * Ajout d'une autre catégorie à la même commande
   */
  const addCategory = (catId: string) => {
    setItems((prev) => {
      if (prev.some((item) => item.categoryId === catId)) return prev;
      return [...prev, { categoryId: catId, quantity: 1 }];
    });
  };

  /**
   * Retrait d'une catégorie
   */
  const removeCategory = (catId: string) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((item) => item.categoryId !== catId);
    });
  };

  const setCategoryQuantity = (catId: string, qty: number) => {
    const clamped = Math.max(1, Math.min(qty, CONFIG.MAX_PER_ORDER));
    setItems((prev) =>
      prev.map((item) => (item.categoryId === catId ? { ...item, quantity: clamped } : item))
    );
  };

  const incrementCategory = (catId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.categoryId === catId && item.quantity < CONFIG.MAX_PER_ORDER) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
  };

  const decrementCategory = (catId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.categoryId === catId && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      })
    );
  };

  const setHolderName = (index: number, name: string) => {
    setHolderNames((prev) => {
      const next = [...prev];
      next[index] = name;
      return next;
    });
  };

  const clearCart = () => {
    setItems([{ categoryId: defaultCategory.id, quantity: 1 }]);
    setHolderNames(['']);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // noop
    }
  };

  // Rétrocompatibilité
  const firstItem = items[0] || { categoryId: defaultCategory.id, quantity: 1 };
  const firstTicket = TICKETS.find((t) => t.id === firstItem.categoryId) || defaultCategory;

  const setQuantity = (qty: number) => {
    setCategoryQuantity(firstItem.categoryId, qty);
  };

  const incrementQuantity = () => {
    incrementCategory(firstItem.categoryId);
  };

  const decrementQuantity = () => {
    decrementCategory(firstItem.categoryId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        holderNames,
        selectCategory,
        addCategory,
        removeCategory,
        setCategoryQuantity,
        incrementCategory,
        decrementCategory,
        setHolderName,
        clearCart,
        totalPrice,
        totalQuantity,

        categoryId: firstItem.categoryId,
        categoryName: firstTicket.name,
        unitPrice: firstTicket.numericPrice,
        quantity: firstItem.quantity,
        setQuantity,
        incrementQuantity,
        decrementQuantity
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
