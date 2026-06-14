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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-[#E5B94E] selection:text-white font-sans antialiased">
      {children}
    </div>
  );
}
