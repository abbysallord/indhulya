"use client";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  badge?: string;
};

type ProductGridProps = {
  title: string;
  products: Product[];
  viewAllLink?: string;
};

function ProductCardItem({ product, priority }: { product: Product; priority?: boolean }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000); // Revert after 2 seconds
  };

  return (
    <div className="group flex flex-col cursor-pointer relative">
      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden w-full mb-4">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={`object-cover transition-all duration-700 ${product.hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-110'}`}
          priority={priority}
         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" />
        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt={`${product.name} hover`}
            fill
            className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 absolute inset-0"
            priority={priority}
           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" />
        )}
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold uppercase px-2 py-1 tracking-wider z-10 shadow-sm">
            {product.badge}
          </div>
        )}
        
        {/* Hover Actions - Standardized with Products Page */}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-300 z-10 pointer-events-none" />
        
        {/* Wishlist Button */}
        <div className="absolute top-4 right-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <motion.button 
            whileTap={{ scale: 0.8 }}
            animate={isWishlisted ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
            onClick={handleWishlist}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:text-[#5C1218] transition-colors"
            aria-label="Toggle Wishlist"
          >
            <Heart 
              className={`w-4 h-4 transition-colors duration-300 ${
                isWishlisted ? 'fill-[#5C1218] text-[#5C1218]' : ''
              }`} 
            />
          </motion.button>
        </div>

        {/* Add to Bag Button */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <button 
            onClick={handleAdd}
            className={`w-full py-3 backdrop-blur-sm font-semibold text-xs tracking-widest uppercase rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2 ${
              isAdded
                ? 'bg-[#2b4c3b] text-[#E5B94E]'
                : 'bg-white/95 text-black hover:bg-[#5C1218] hover:text-white'
            }`}
          >
            {isAdded ? (
              "ADDED ✓"
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col items-center text-center">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 truncate w-full">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-500 line-through">₹{product.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ title, products, viewAllLink }: ProductGridProps) {
  return (
    <section className="w-full py-16 px-4 md:px-8 bg-white max-w-[1440px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h2 className="text-3xl md:text-4xl font-serif text-black">{title}</h2>
        {viewAllLink && (
          <a href={viewAllLink} className="text-xs font-bold tracking-widest uppercase border-b border-black pb-1 hover:text-gray-600 transition-colors">
            VIEW ALL
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, index) => (
          <ProductCardItem key={product.id} product={product} priority={index < 4} />
        ))}
      </div>
    </section>
  );
}
