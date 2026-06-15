"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type Product = {
  id: number | string;
  name: string;
  price: string | number;
  image: string;
  category?: string;
  originalPrice?: number;
};

type StoreContextType = {
  cart: Product[];
  wishlist: Product[]; // Store full product objects
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number | string) => void;
  toggleWishlist: (product: Product) => void;
  cartCount: number;
  wishlistCount: number;
  isMounted: boolean;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedCart = localStorage.getItem("indhulya_cart");
      const savedWishlist = localStorage.getItem("indhulya_wishlist");
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (error) {
      console.error("Could not load from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("indhulya_cart", JSON.stringify(cart));
      localStorage.setItem("indhulya_wishlist", JSON.stringify(wishlist));
    }
  }, [cart, wishlist, isMounted]);

  const addToCart = (product: Product) => {
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (productId: number | string) => {
    setCart((prev) => prev.filter(p => p.id !== productId));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => 
      prev.some(p => p.id === product.id) 
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  };

  return (
    <StoreContext.Provider value={{
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      toggleWishlist,
      cartCount: cart.length,
      wishlistCount: wishlist.length,
      isMounted
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
