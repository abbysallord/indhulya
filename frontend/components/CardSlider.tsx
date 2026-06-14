"use client";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useRef } from "react";

type Card = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
};

type CardSliderProps = {
  title: string;
  cards: Card[];
  aspectRatio?: "square" | "portrait";
};

export default function CardSlider({ title, cards, aspectRatio = "portrait" }: CardSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-16 px-4 md:px-8 bg-white max-w-[1440px] mx-auto overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl md:text-4xl font-serif text-black">{title}</h2>
        <div className="flex gap-2">
          <button 
            onClick={scrollLeft}
            className="p-2 border border-black rounded-full hover:bg-black hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <button 
            onClick={scrollRight}
            className="p-2 border border-black rounded-full hover:bg-black hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory"
      >
        {cards.map((card) => (
          <div key={card.id} className="min-w-[70vw] md:min-w-[300px] flex-shrink-0 snap-center group cursor-pointer" onClick={() => alert(`Opening category: ${card.title}`)}>
            <div className={`relative w-full ${aspectRatio === "square" ? "aspect-square" : "aspect-[3/4]"} overflow-hidden mb-4 bg-gray-100`}>
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
            </div>
            <div className="flex flex-col items-center text-center">
              <h3 className="text-lg font-serif mb-1">{card.title}</h3>
              {card.subtitle && (
                <p className="text-xs text-gray-500 uppercase tracking-widest">{card.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
