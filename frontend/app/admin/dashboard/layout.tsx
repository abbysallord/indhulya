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
    <div className="min-h-screen bg-[#0a0a0a] flex text-white font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl flex flex-col">
        <div className="h-20 flex items-center justify-center border-b border-white/10">
          <h1 className="text-2xl font-serif tracking-widest text-white">INDHULYA</h1>
        </div>

        <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl border border-white/5 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-[#E5B94E]" />
            <span className="font-medium tracking-wide">Overview</span>
          </Link>
          <button className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
            <ShoppingBag className="w-5 h-5 group-hover:text-white transition-colors" />
            <span className="font-medium tracking-wide">Products</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
            <Users className="w-5 h-5 group-hover:text-white transition-colors" />
            <span className="font-medium tracking-wide">Customers</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
            <Settings className="w-5 h-5 group-hover:text-white transition-colors" />
            <span className="font-medium tracking-wide">Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action={logout}>
            <button type="submit" className="flex items-center gap-3 px-4 py-3 w-full text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all group">
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span className="font-medium tracking-wide">Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-20 border-b border-white/10 bg-black/30 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4 w-96 relative group">
            <Search className="w-5 h-5 text-white/40 absolute left-4 group-focus-within:text-[#E5B94E] transition-colors" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#E5B94E]/50 focus:bg-white/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-white/60 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E5B94E] rounded-full border-2 border-[#0a0a0a]"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-white/10 pl-6 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E5B94E] to-yellow-200 flex items-center justify-center text-black font-bold font-serif text-sm">
                AD
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-white/40">Superadmin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-[#E5B94E]/5 blur-[100px] pointer-events-none rounded-full" />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
