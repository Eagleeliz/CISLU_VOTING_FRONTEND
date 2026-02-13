// components/UserLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import UserSideNav from "./UserSideNav";
import Navbar from "../../components/Navbar";

export const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#07090d] text-[#cbd5e1] relative font-sans">
      
      {/* TOP NAVBAR - Fixed at top with high z-index */}
      <Navbar />

      {/* MAIN CONTAINER WITH SIDEBAR AND CONTENT */}
      <div className="flex flex-1 pt-16 lg:pt-20"> {/* pt matches Navbar height */}
        
        {/* DESKTOP SIDEBAR - Fixed below navbar */}
        <aside className="hidden lg:block w-72 fixed left-0 top-16 lg:top-20 bottom-0 z-30 border-r border-white/5 bg-[#0b0e14] overflow-y-auto">
          <UserSideNav />
        </aside>

        {/* MOBILE SIDEBAR DRAWER */}
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md lg:hidden" 
              onClick={() => setSidebarOpen(false)} 
            />

            {/* Sidebar Panel */}
            <aside className="fixed top-0 left-0 z-[1001] w-[80%] max-w-[300px] h-full bg-[#0b0e14] shadow-2xl lg:hidden transform transition-transform duration-300 border-r border-white/10 overflow-y-auto">
              <button 
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 z-[1002] p-2 text-[#64748b] hover:text-[#f97316] transition-colors"
              >
                <X size={24} />
              </button>
              <UserSideNav onNavItemClick={() => setSidebarOpen(false)} />
            </aside>
          </>
        )}

        {/* MAIN CONTENT AREA - Offset for navbar and sidebar */}
        <main className="flex-1 lg:ml-72 w-full min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet /> {/* This renders DashboardHome */}
          </div>
        </main>
      </div>

      {/* MOBILE TRIGGER - Orange Glow */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-[999] p-4 bg-[#f97316] text-white rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-[#f97316]/50 active:scale-90 transition-all"
        >
          <Menu size={24} strokeWidth={3} />
        </button>
      )}
    </div>
  );
};

export default UserLayout;