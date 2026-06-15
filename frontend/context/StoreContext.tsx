"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
    showToast(`Added ${product.name} to your bag`);
  };

  const removeFromCart = (productId: number | string) => {
    setCart((prev) => prev.filter(p => p.id !== productId));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        showToast(`Removed ${product.name} from wishlist`);
        return prev.filter(p => p.id !== product.id);
      } else {
        showToast(`Added ${product.name} to wishlist`);
        return [...prev, product];
      }
    });
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
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-black/95 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl border border-white/10 flex items-center gap-3 w-max max-w-[90vw]"
          >
            <div className="w-2 h-2 rounded-full bg-[#E5B94E]" />
            <p className="text-xs md:text-sm font-semibold tracking-wide truncate">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
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
