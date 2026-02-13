import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import AdminSideNav from "./AdminSideNav";

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    /* Main Container: True Dark background */
    <div className="flex h-screen bg-[#07090d] text-[#cbd5e1] relative font-sans overflow-hidden">
      
      {/* NOTE: Your Fixed Top Nav should have a z-index of around 40 
         to stay above the sidebar but below the mobile drawer overlay.
      */}

      {/* MOBILE TRIGGER - Action Red Glow */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-[999] p-4 bg-[#dc2626] text-white rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-[#dc2626]/50 active:scale-90 transition-all"
        >
          <Menu size={24} strokeWidth={3} />
        </button>
      )}

      {/* DESKTOP SIDEBAR - Height adjusted for fixed top nav if necessary */}
      <aside className="hidden lg:block w-72 h-full fixed top-0 left-0 z-30 border-r border-white/5 bg-[#0b0e14]">
        {/* If your Nav is fixed at the top, you might want to add pt-20 here */}
        <AdminSideNav />
      </aside>

      {/* MOBILE SIDEBAR DRAWER */}
      {sidebarOpen && (
        <>
          {/* Overlay - z-[1000] ensures it covers the fixed top nav */}
          <div 
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />

          {/* Sidebar Panel - Input/Panel Background */}
          <aside className="fixed top-0 left-0 z-[1001] w-[80%] max-w-[300px] h-full bg-[#0b0e14] shadow-2xl lg:hidden transform transition-transform duration-300 border-r border-white/10">
            <button 
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 z-[1002] p-2 text-[#64748b] hover:text-[#dc2626] transition-colors"
            >
              <X size={24} />
            </button>
            <AdminSideNav onNavItemClick={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:ml-72 bg-[#07090d] min-h-screen">
        {/* SPACER FOR FIXED NAV: 
           This ensures content starts below your fixed top bar. 
           Adjust pt-20 to match your Navbar height.
        */}
        <div className="pb-20 max-w-7xl mx-auto relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};