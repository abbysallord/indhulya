import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import TrustTicker from "@/components/TrustTicker";
import CategoryCircles from "@/components/CategoryCircles";
import ProductGrid from "@/components/ProductGrid";
import PromoBanner from "@/components/PromoBanner";
import CardSlider from "@/components/CardSlider";
import EditorialSection from "@/components/EditorialSection";
import ContactSection from "@/components/ContactSection";
import AIChatbot from "@/components/AIChatbot";
import FlashyShowcase from "@/components/FlashyShowcase";
import Footer from "@/components/Footer";

const topStylesProducts = [
  {
    id: "1",
    name: "Navya One Gram Gold Short Necklace",
    price: 900,
    originalPrice: 1000,
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&h=500&fit=crop",
    badge: "BESTSELLER",
  },
  {
    id: "2",
    name: "Pushpa Floral Kemp Bangles",
    price: 850,
    originalPrice: 950,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&h=500&fit=crop",
  },
  {
    id: "3",
    name: "Divine Lakshmi Heritage Jhumkas",
    price: 999,
    originalPrice: 1100,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&h=500&fit=crop",
    badge: "NEW",
  },
  {
    id: "4",
    name: "Varna Versatile Choker",
    price: 3200,
    originalPrice: 3600,
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&h=500&fit=crop",
  },
];

const fineGoldProducts = [
  {
    id: "5",
    name: "Aavya Gutta Pusalu Necklace",
    price: 2800,
    originalPrice: 3200,
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&h=500&fit=crop",
    badge: "ONE GRAM GOLD",
  },
  {
    id: "6",
    name: "Mayura Peacock Long Haram",
    price: 3500,
    originalPrice: 4000,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&h=500&fit=crop",
  },
  {
    id: "7",
    name: "Lakshmi Mahotsav Antique Kada",
    price: 850,
    originalPrice: 950,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&h=500&fit=crop",
    badge: "HERITAGE",
  },
  {
    id: "8",
    name: "Star-Burst CZ & Kemp Bangles",
    price: 999,
    originalPrice: 1200,
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&h=500&fit=crop",
  },
];

const recipientCards = [
  { id: "c1", title: "For Sister", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&h=500&fit=crop" },
  { id: "c2", title: "For Wife", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&h=500&fit=crop" },
  { id: "c3", title: "For Mother", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&h=500&fit=crop" },
  { id: "c4", title: "For Girlfriend", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&h=500&fit=crop" },
  { id: "c5", title: "For Daughter", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&h=500&fit=crop" },
  { id: "c6", title: "For Friend", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&h=500&fit=crop" },
  { id: "c7", title: "For Bride", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&h=500&fit=crop" },
  { id: "c8", title: "For Bridesmaid", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&h=500&fit=crop" },
  { id: "c9", title: "For Grandmother", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&h=500&fit=crop" },
  { id: "c10", title: "For Aunt", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&h=500&fit=crop" },
  { id: "c11", title: "For Colleague", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&h=500&fit=crop" },
  { id: "c12", title: "For Yourself", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&h=500&fit=crop" },
];

const occasionCards = [
  { id: "o1", title: "Festive Wear", subtitle: "TRADITIONAL", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&h=400&fit=crop" },
  { id: "o2", title: "Temple Visit", subtitle: "HERITAGE", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&h=400&fit=crop" },
  { id: "o3", title: "Everyday", subtitle: "CLASSIC", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&h=400&fit=crop" },
  { id: "o4", title: "Wedding Guest", subtitle: "GLAMOUR", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&h=400&fit=crop" },
  { id: "o5", title: "Engagement", subtitle: "BRIDAL", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&h=400&fit=crop" },
  { id: "o6", title: "Office Wear", subtitle: "SUBTLE", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&h=400&fit=crop" },
  { id: "o7", title: "Party Nights", subtitle: "STATEMENT", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&h=400&fit=crop" },
  { id: "o8", title: "Anniversary", subtitle: "ROMANTIC", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&h=400&fit=crop" },
  { id: "o9", title: "Haldi Ceremony", subtitle: "YELLOW GOLD", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&h=400&fit=crop" },
  { id: "o10", title: "Sangeet", subtitle: "SPARKLE", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&h=400&fit=crop" },
  { id: "o11", title: "Reception", subtitle: "ELEGANT", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&h=400&fit=crop" },
  { id: "o12", title: "Gifting", subtitle: "SURPRISE", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&h=400&fit=crop" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Header />
      
      <main className="flex-1 w-full bg-[#F7F7F7]">
        <HeroCarousel />
        <TrustTicker />
        <div id="categories"><CategoryCircles /></div>
        <div id="bestsellers"><ProductGrid title="Indhulya Top Styles" products={topStylesProducts} viewAllLink="#" /></div>
        <PromoBanner />
        <div id="shop-by-recipient"><CardSlider title="Shop By Recipient" cards={recipientCards} /></div>
        <div id="one-gram-gold"><ProductGrid title="One Gram Gold Collection" products={fineGoldProducts} viewAllLink="#" /></div>
        <FlashyShowcase />
        <div id="occasions"><CardSlider title="For Every Occasion" cards={occasionCards} aspectRatio="square" /></div>
        <div id="editorial"><EditorialSection /></div>
        <div id="contact"><ContactSection /></div>
      </main>

      <Footer />
      <AIChatbot />
    </div>
  );
}
