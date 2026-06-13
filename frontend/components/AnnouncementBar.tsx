export default function AnnouncementBar() {
  return (
    <div className="w-full bg-[#5C1218] text-[#FAF9F6] text-xs py-2.5 px-4 text-center tracking-wide font-sans flex justify-center items-center gap-1">
      <span className="font-semibold uppercase tracking-widest">Free Insured Shipping on all Heritage Orders</span>
      <span className="text-zinc-400 mx-2">|</span>
      <span>Offer ends in...</span>
      <span className="text-[#E5B94E] font-bold ml-1 tracking-wider">05 : 43 : 21</span>
    </div>
  );
}
