export default function TrustTicker() {
  return (
    <div className="w-full overflow-hidden bg-[#5C1218] text-[#E5B94E] py-3 border-b border-[#70161E] [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]">
      <div className="flex w-max animate-marquee">
        {/* Repeat the text multiple times to ensure it covers ultra-wide screens for a perfect loop */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex shrink-0 items-center gap-8 text-xs font-bold tracking-widest uppercase pr-8">
            <span>★ Authentic 1 Gram Gold</span>
            <span>•</span>
            <span>Handcrafted in India</span>
            <span>•</span>
            <span>Temple Jewelry Experts</span>
            <span>•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
