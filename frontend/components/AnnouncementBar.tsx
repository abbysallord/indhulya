export default function AnnouncementBar() {
  return (
    <div className="w-full bg-[#5C1218] text-[#FAF9F6] py-2 px-4 text-center tracking-wide font-sans flex flex-col md:flex-row justify-center items-center gap-1 md:gap-2">
      <span className="font-semibold uppercase tracking-widest text-[10px] md:text-xs leading-snug">Free Insured Shipping on all Heritage Orders</span>
      <span className="hidden md:inline text-zinc-400 mx-2">|</span>
      <div className="flex items-center justify-center gap-1 mt-0.5 md:mt-0 text-[10px] md:text-xs">
        <span>Offer ends in...</span>
        <span className="text-[#E5B94E] font-bold ml-1 tracking-wider whitespace-nowrap">05 : 43 : 21</span>
      </div>
    </div>
  );
}
