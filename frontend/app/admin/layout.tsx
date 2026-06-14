export const metadata = {
  title: "Admin Panel | INDHULYA",
  description: "Secure administration portal for Indhulya.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#E5B94E] selection:text-black font-sans antialiased">
      {children}
    </div>
  );
}
