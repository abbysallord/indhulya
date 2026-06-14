"use client";
import Image from "next/image";
import { Heart } from "lucide-react";
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

function ProductCardItem({ product }: { product: Product }) {
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
         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" />
        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt={`${product.name} hover`}
            fill
            className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 absolute inset-0"
           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" />
        )}
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold uppercase px-2 py-1 tracking-wider z-10 shadow-sm">
            {product.badge}
          </div>
        )}
        
        {/* Wishlist Button */}
        <motion.button 
          whileTap={{ scale: 0.8 }}
          animate={isWishlisted ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
          onClick={handleWishlist}
          className={`absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 ${
            isWishlisted ? 'opacity-100' : ''
          }`}
        >
          <Heart 
            className={`w-4 h-4 transition-colors duration-300 ${
              isWishlisted ? 'fill-[#5C1218] text-[#5C1218]' : 'text-gray-600 hover:text-black'
            }`} 
          />
        </motion.button>

        {/* Add to Bag Button */}
        <button 
          onClick={handleAdd}
          className={`absolute bottom-0 left-0 w-full py-3 text-xs font-bold tracking-widest uppercase transition-all duration-300 z-10 ${
            isAdded 
              ? 'translate-y-0 bg-[#2b4c3b] text-[#E5B94E]' 
              : 'translate-y-full group-hover:translate-y-0 bg-black text-white hover:bg-[#5C1218]'
          }`}
        >
          {isAdded ? "ADDED ✓" : "ADD TO BAG"}
        </button>
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCardItem key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
