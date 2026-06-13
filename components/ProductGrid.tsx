"use client";
import Image from "next/image";
import { Heart } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage: string;
  badge?: string;
};

type ProductGridProps = {
  title: string;
  products: Product[];
  viewAllLink?: string;
};

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
          <div key={product.id} className="group flex flex-col cursor-pointer relative">
            {/* Image Container */}
            <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden w-full mb-4">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:opacity-0 transition-opacity duration-500"
              />
              <Image
                src={product.hoverImage}
                alt={`${product.name} hover`}
                fill
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 absolute inset-0"
              />
              {/* Badge */}
              {product.badge && (
                <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold uppercase px-2 py-1 tracking-wider">
                  {product.badge}
                </div>
              )}
              {/* Wishlist Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); alert(`Added ${product.name} to wishlist!`); }}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-red-500 z-10"
              >
                <Heart className="w-4 h-4" />
              </button>
              {/* Add to Bag Button (Hover) */}
              <button 
                onClick={(e) => { e.stopPropagation(); alert(`Added ${product.name} to bag!`); }}
                className="absolute bottom-0 left-0 w-full bg-black text-white py-3 text-xs font-bold tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10"
              >
                ADD TO BAG
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
        ))}
      </div>
    </section>
  );
}
