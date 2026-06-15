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
  deliveryLocation: string | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number | string) => void;
  toggleWishlist: (product: Product) => void;
  setDeliveryLocation: (location: string | null) => void;
  cartCount: number;
  wishlistCount: number;
  isMounted: boolean;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [deliveryLocation, setDeliveryLocation] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsMounted(true);
      try {
        const savedCart = localStorage.getItem("indhulya_cart");
        const savedWishlist = localStorage.getItem("indhulya_wishlist");
        const savedLocation = localStorage.getItem("indhulya_location");
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed) && (parsed.length === 0 || typeof parsed[0] === 'object')) {
            setCart(parsed);
          } else {
            localStorage.removeItem("indhulya_cart");
          }
        }
        if (savedWishlist) {
          const parsed = JSON.parse(savedWishlist);
          if (Array.isArray(parsed) && (parsed.length === 0 || typeof parsed[0] === 'object')) {
            setWishlist(parsed);
          } else {
            localStorage.removeItem("indhulya_wishlist");
          }
        }
        if (savedLocation) {
          setDeliveryLocation(savedLocation);
        }
      } catch (error) {
        console.error("Could not load from localStorage", error);
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("indhulya_cart", JSON.stringify(cart));
      localStorage.setItem("indhulya_wishlist", JSON.stringify(wishlist));
      if (deliveryLocation) {
        localStorage.setItem("indhulya_location", deliveryLocation);
      } else {
        localStorage.removeItem("indhulya_location");
      }
    }
  }, [cart, wishlist, deliveryLocation, isMounted]);

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
      deliveryLocation,
      addToCart,
      removeFromCart,
      toggleWishlist,
      setDeliveryLocation,
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
