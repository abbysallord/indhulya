import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Bell, Search } from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  if (!token) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] flex text-slate-900 font-sans overflow-hidden">
      {/* Sidebar Navigation - Light Glassmorphism */}
      <aside className="hidden md:flex w-64 border-r border-slate-200 bg-white/70 backdrop-blur-xl flex-col shadow-[4px_0_24px_rgb(0,0,0,0.02)] z-20">
        <div className="h-20 flex items-center justify-center border-b border-slate-200">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">INDHULYA</h1>
        </div>

        <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-slate-100 text-slate-900 rounded-xl border border-slate-200 font-semibold shadow-sm transition-colors">
            <LayoutDashboard className="w-5 h-5 text-slate-900" />
            <span className="tracking-wide">Overview</span>
          </Link>
          <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all group font-medium">
            <ShoppingBag className="w-5 h-5 group-hover:text-slate-900 transition-colors" />
            <span className="tracking-wide">Products</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all group font-medium">
            <Users className="w-5 h-5 group-hover:text-slate-900 transition-colors" />
            <span className="tracking-wide">Customers</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all group font-medium">
            <Settings className="w-5 h-5 group-hover:text-slate-900 transition-colors" />
            <span className="tracking-wide">Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <form action={logout}>
            <button type="submit" className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group font-medium">
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span className="tracking-wide">Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative pb-16 md:pb-0">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-slate-100 to-transparent pointer-events-none" />
        
        {/* Topbar */}
        <header className="h-16 md:h-20 border-b border-slate-200 bg-white/60 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4 w-full md:w-96 relative group mr-4 md:mr-0">
            <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-400 absolute left-3 md:left-4 group-focus-within:text-slate-900 transition-colors" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-white/80 border border-slate-200 shadow-sm rounded-full py-2 md:py-2.5 pl-10 md:pl-12 pr-4 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
            />
          </div>
          <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
            <button className="relative text-slate-500 hover:text-slate-900 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 md:w-2.5 md:h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4 md:pl-6 cursor-pointer">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-md">
                AD
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-900">Admin</p>
                <p className="text-xs text-slate-500 font-medium">Superadmin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0">
          <div className="relative z-10 pb-4">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-50 px-2 shadow-[0_-4px_24px_rgb(0,0,0,0.02)]">
        <Link href="/admin/dashboard" className="flex flex-col items-center p-2 text-[#E5B94E]">
          <LayoutDashboard className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">Overview</span>
        </Link>
        <button className="flex flex-col items-center p-2 text-slate-400 hover:text-slate-900 transition-colors">
          <ShoppingBag className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Products</span>
        </button>
        <button className="flex flex-col items-center p-2 text-slate-400 hover:text-slate-900 transition-colors">
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Customers</span>
        </button>
        <form action={logout}>
          <button type="submit" className="flex flex-col items-center p-2 text-slate-400 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </form>
      </nav>
    </div>
  );
}
