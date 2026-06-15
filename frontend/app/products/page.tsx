"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore, Product } from "@/context/StoreContext";

// Using unique Unsplash IDs for a rich catalog feel
const ALL_PRODUCTS = [
  // Necklaces
  { id: 1, name: "Navya Heritage Short Necklace", category: "Necklaces", price: "₹1,200", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&fit=crop" },
  { id: 5, name: "Aavya Gutta Pusalu", category: "Necklaces", price: "₹2,800", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&fit=crop&crop=top" },
  { id: 11, name: "Classic Gold Chain", category: "Necklaces", price: "₹2,100", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&fit=crop&crop=top" },
  { id: 13, name: "Temple Coin Long Haram", category: "Necklaces", price: "₹3,500", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&fit=crop&crop=faces" },
  
  // Earrings
  { id: 3, name: "Divine Lakshmi Jhumkas", category: "Earrings", price: "₹999", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&fit=crop" },
  { id: 9, name: "Aura Minimalist Studs", category: "Earrings", price: "₹450", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&fit=crop" },
  { id: 14, name: "Kundan Chandbali Drops", category: "Earrings", price: "₹1,150", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&fit=crop" },
  { id: 15, name: "Ruby Embellished Tops", category: "Earrings", price: "₹899", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&fit=crop" },

  // Bangles
  { id: 2, name: "Pushpa Floral Kemp Bangles", category: "Bangles", price: "₹850", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&fit=crop" },
  { id: 7, name: "Lakshmi Mahotsav Kada", category: "Bangles", price: "₹850", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&fit=crop" },
  { id: 8, name: "Star-Burst CZ Bangles", category: "Bangles", price: "₹999", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&fit=crop" },
  { id: 16, name: "Antique Gold Polki Bangles", category: "Bangles", price: "₹1,250", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&fit=crop" },

  // Chokers
  { id: 4, name: "Varna Versatile Choker", category: "Chokers", price: "₹3,200", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&fit=crop&crop=bottom" },
  { id: 17, name: "Emerald Beaded Choker", category: "Chokers", price: "₹2,600", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&fit=crop" },
  { id: 18, name: "Polki Meenakari Choker", category: "Chokers", price: "₹4,100", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&fit=crop" },
  { id: 19, name: "Pearl Drop AD Choker", category: "Chokers", price: "₹2,950", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&fit=crop" },

  // Bridal Sets
  { id: 12, name: "Bridal Complete Set", category: "Bridal Sets", price: "₹15,000", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&fit=crop&crop=faces" },
  { id: 20, name: "South Indian Wedding Set", category: "Bridal Sets", price: "₹18,500", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&fit=crop" },
  { id: 21, name: "Rajputi Royal Collection", category: "Bridal Sets", price: "₹22,000", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&fit=crop" },
  { id: 22, name: "Kundan Grandeur Set", category: "Bridal Sets", price: "₹14,200", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&fit=crop" },

  // Rings
  { id: 23, name: "Solitaire AD Ring", category: "Rings", price: "₹599", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&fit=crop" },
  { id: 24, name: "Antique Temple Ring", category: "Rings", price: "₹750", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&fit=crop" },
  { id: 25, name: "Navratna Statement Ring", category: "Rings", price: "₹1,100", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&fit=crop" },
  { id: 26, name: "Floral Ruby Cocktail Ring", category: "Rings", price: "₹890", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&fit=crop" },

  // Mangalsutras
  { id: 27, name: "Classic Short Mangalsutra", category: "Mangalsutras", price: "₹1,250", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&fit=crop" },
  { id: 28, name: "Diamond Pendant Mangalsutra", category: "Mangalsutras", price: "₹1,850", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&fit=crop" },
  { id: 29, name: "Traditional Long Mangalsutra", category: "Mangalsutras", price: "₹2,400", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&fit=crop" },
  { id: 30, name: "Maharashtrian Vati Mangalsutra", category: "Mangalsutras", price: "₹1,600", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&fit=crop" },

  // Men's
  { id: 31, name: "Gold Plated Rudraksha Chain", category: "Men's", price: "₹1,100", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&fit=crop" },
  { id: 32, name: "Classic Cuban Link Chain", category: "Men's", price: "₹2,200", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&fit=crop" },
  { id: 33, name: "Lion Head Statement Ring", category: "Men's", price: "₹950", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&fit=crop" },
  { id: 34, name: "Sikh Kada Bracelet", category: "Men's", price: "₹850", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&fit=crop" },
];

const CATEGORIES = ["All", "Necklaces", "Earrings", "Bangles", "Chokers", "Bridal Sets", "Rings", "Mangalsutras", "Men's"];

function ProductsContent() {
  const searchParams = useSearchParams();
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  
  const PRODUCTS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // Handle URL params
  useEffect(() => {
    const t = setTimeout(() => {
      const cat = searchParams.get("category");
      const search = searchParams.get("search");
      
      if (cat) {
        setSelectedCategory(cat);
        setSearchQuery("");
      } else if (search) {
        // If it's a category search (like clicking from homepage circles)
        const matchedCategory = CATEGORIES.find(c => c.toLowerCase() === search.toLowerCase());
        if (matchedCategory) {
          setSelectedCategory(matchedCategory);
          setSearchQuery("");
        } else {
          setSearchQuery(search);
          setSelectedCategory("All");
        }
      }
    }, 0);
    return () => clearTimeout(t);
  }, [searchParams]);

  // Handle conflicts: clicking a category clears search, typing a search clears category
  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedCategory("All");
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    let result = [...ALL_PRODUCTS];

    if (selectedCategory !== "All") {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price_asc") {
      result.sort((a, b) => parseInt(a.price.replace(/\D/g,'')) - parseInt(b.price.replace(/\D/g,'')));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => parseInt(b.price.replace(/\D/g,'')) - parseInt(a.price.replace(/\D/g,'')));
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  // Reset pagination when sortBy changes
  useEffect(() => {
    const t = setTimeout(() => setCurrentPage(1), 0);
    return () => clearTimeout(t);
  }, [sortBy]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );
  
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  return (
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-16 pt-32">
        
        {/* Back Navigation */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#5C1218] transition-colors text-sm font-semibold tracking-wide uppercase">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-[#5C1218] mb-4"
          >
            The Collection
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-xl text-sm md:text-base leading-relaxed"
          >
            Explore our curated selection of heritage, everyday, and bridal jewelry. Every piece is crafted with unparalleled devotion to tradition and modern elegance.
          </motion.p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 border-b border-gray-200 pb-8">
          
          <div className="flex flex-wrap items-center gap-2 md:gap-4 justify-center md:justify-start">
            {CATEGORIES.map((cat, idx) => (
              <button 
                key={idx}
                onClick={() => handleCategoryClick(cat)}
                className={`px-6 py-2 rounded-full text-xs font-semibold tracking-widest uppercase transition-all duration-300 ${
                  selectedCategory === cat 
                  ? "bg-[#5C1218] text-white border-transparent shadow-md" 
                  : "bg-transparent text-gray-600 border border-gray-200 hover:border-[#5C1218] hover:text-[#5C1218]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#E5B94E] focus:ring-1 focus:ring-[#E5B94E] transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <div className="relative flex items-center">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent pl-4 pr-10 py-2 border border-gray-200 rounded-full text-xs md:text-sm font-semibold tracking-widest uppercase text-gray-700 hover:border-[#5C1218] focus:outline-none focus:border-[#5C1218] transition-colors cursor-pointer"
              >
                <option value="default">Sort: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <div className="absolute right-4 pointer-events-none">
                 <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx % 4 * 0.1 }}
              key={product.id} 
              className="group cursor-pointer flex flex-col"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority={idx <= 3}
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="absolute top-4 right-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product as Product); }}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:text-[#5C1218] transition-colors" 
                    aria-label="Toggle Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${wishlist.some(p => p.id === product.id) ? 'fill-[#5C1218] text-[#5C1218]' : ''}`} />
                  </button>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product as Product); }}
                    className="w-full py-3 bg-white/95 backdrop-blur-sm text-black font-semibold text-xs tracking-widest uppercase rounded-lg shadow-lg hover:bg-[#5C1218] hover:text-white transition-colors flex items-center justify-center gap-2" 
                    aria-label="Add to Cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col items-center text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">{product.category}</p>
                <h3 className="font-serif text-lg text-gray-900 mb-1 leading-snug group-hover:text-[#5C1218] transition-colors">{product.name}</h3>
                <p className="font-medium text-gray-900">{product.price}</p>
              </div>
            </motion.div>
          ))) : (
            <div className="col-span-full py-20 text-center">
              <h3 className="text-xl text-gray-500 font-serif mb-2">No products found</h3>
              <p className="text-sm text-gray-400">Try adjusting your filters or search query.</p>
              <button 
                onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }} 
                className="mt-6 px-6 py-2 bg-[#5C1218] text-white text-xs tracking-widest uppercase font-semibold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="w-full flex justify-center items-center gap-2 mt-20">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              Prev
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 flex items-center justify-center border text-sm font-semibold transition-colors ${
                  currentPage === page 
                  ? "bg-[#5C1218] text-white border-[#5C1218]" 
                  : "bg-transparent text-gray-600 border-gray-200 hover:border-[#5C1218] hover:text-[#5C1218]"
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              Next
            </button>
          </div>
        )}

      </main>
  );
}

export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB]">
      <Header />
      <Suspense fallback={
        <div className="flex-1 w-full flex items-center justify-center pt-32">
          <div className="w-8 h-8 border-4 border-[#5C1218] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <ProductsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
