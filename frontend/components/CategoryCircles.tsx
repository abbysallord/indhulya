import Image from "next/image";
import Link from "next/link";

const categories = [
  { name: "NECKLACES", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=200&h=200&fit=crop" },
  { name: "EARRINGS", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=200&fit=crop" },
  { name: "BRACELETS", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200&h=200&fit=crop" },
  { name: "RINGS", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=200&h=200&fit=crop" },
  { name: "MANGALSUTRAS", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=200&fit=crop" },
  { name: "MEN'S", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200&h=200&fit=crop" },
];

export default function CategoryCircles() {
  return (
    <section className="w-full py-12 px-4 bg-white">
      <div className="max-w-[1440px] mx-auto overflow-x-auto hide-scrollbar snap-x snap-mandatory [mask-image:linear-gradient(to_right,black_85%,transparent)] md:[mask-image:none]">
        <div className="flex justify-start md:justify-center gap-6 md:gap-12 min-w-max px-4">
          {categories.map((cat, idx) => (
            <Link href={`/products?search=${cat.name.toLowerCase()}`} key={idx} className="flex flex-col items-center gap-3 cursor-pointer group snap-start pl-2">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#E5B94E] group-hover:shadow-[0_0_25px_rgba(229,185,78,0.4)] transition-all duration-500 p-1">
                <div className="w-full h-full rounded-full overflow-hidden relative bg-[#E8EAE6]">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                   sizes="(max-width: 768px) 33vw, 15vw" />
                </div>
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase text-black group-hover:text-[#5C1218] transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
