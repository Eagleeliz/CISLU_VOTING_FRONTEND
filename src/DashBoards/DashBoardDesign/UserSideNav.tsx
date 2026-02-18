import React from "react";
import { NavLink } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  FileText,
  User,
  Activity,
  Eye,
  KeyRound
} from "lucide-react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { clearCredentials } from "../../Features/Auth/AuthSlice";

// --- TYPES & INTERFACES ---
interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  color: string;
}

interface UserSideNavProps {
  onNavItemClick?: () => void;
}

const navItems: NavItem[] = [
  { 
    name: "Dashboard", 
    path: "", 
    icon: <LayoutDashboard size={18} />, 
    color: "text-blue-400" 
  },
  { 
    name: "View Applications", 
    path: "applications", 
    icon: <Eye size={18} />, 
    color: "text-emerald-400" 
  },
  { 
    name: "Profile", 
    path: "profile", 
    icon: <User size={18} />, 
    color: "text-orange-500" 
  },
  { 
    name: "Live Results", 
    path: "results", 
    icon: <Activity size={18} />, 
    color: "text-purple-400" 
  },
  { 
    name: "Password Settings", 
    path: "password", 
    icon: <KeyRound size={18} />, 
    color: "text-purple-400" 
  },
];

export const UserSideNav: React.FC<UserSideNavProps> = ({ onNavItemClick }) => {
  const dispatch = useDispatch();

  const handleLogout = (): void => {
    dispatch(clearCredentials());
    localStorage.removeItem('user');
    toast.error("Session Terminated", {
      style: { background: '#07090d', color: '#ef4444', border: '1px solid #ef444420' }
    });
    onNavItemClick?.();
  };

  return (
    <aside className="h-full w-full flex flex-col bg-[#07090d] text-slate-300 overflow-hidden border-r border-slate-800/50 shadow-2xl">
      
      {/* BRANDING: CISLU VOTE LOGO */}
      <div className="p-8 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#f97316] rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.25)]">
            <span className="text-white font-bold text-lg">CV</span>
          </div>
          <div className="flex flex-col leading-none">
            <h4 className="text-lg font-black text-white tracking-tighter uppercase">
              CISLU<span className="text-[#f97316]">Vote</span>
            </h4>
            <span className="text-[8px] font-mono font-bold text-[#f97316] uppercase tracking-[0.2em] opacity-80">
              User_Portal_v1
            </span>
          </div>
        </div>
      </div>

      {/* NAVIGATION SECTION */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === ""}
            onClick={onNavItemClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all group relative overflow-hidden border font-mono ${
                isActive 
                  ? "bg-[#f97316]/10 border-[#f97316]/40 text-white shadow-[0_0_20px_rgba(249,115,22,0.1)]" 
                  : "border-transparent hover:bg-white/5 text-slate-400 hover:text-slate-100"
              }`
            }
          >
            {/* Active Glow Indicator */}
            <span className="absolute left-0 top-3 bottom-3 w-1 bg-[#f97316] rounded-r-full opacity-0 group-[.active]:opacity-100 transition-opacity" />
            
            <span className={`${item.color} group-hover:scale-110 transition-transform relative z-10`}>
              {item.icon}
            </span>
            
            <span className="text-[10px] uppercase tracking-widest font-black relative z-10">
              {item.name}
            </span>

            {/* Terminal Decoration */}
            <span className="absolute right-4 text-[9px] opacity-0 group-hover:opacity-30 transition-opacity font-mono text-slate-500">
              {`>_0${index + 1}`}
            </span>
          </NavLink>
        ))}

        {/* LOGOUT ACTION - TERMINATE SESSION */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-5 py-4 rounded-xl hover:bg-red-500/10 transition-all w-full text-left group border border-transparent hover:border-red-500/20 mt-6"
        >
          <LogOut size={18} className="text-red-600 group-hover:translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase tracking-widest font-black text-red-600">Terminate_Session</span>
        </button>
      </nav>

      {/* USER STATUS FOOTER */}
      <div className="p-4 bg-black/40 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500 font-mono">Status: Active</span>
          </div>
          <span className="text-[8px] font-mono text-slate-600 uppercase">Node_User</span>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-[#0a0c10] rounded-xl border border-slate-800/50">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#f97316] to-orange-700 flex items-center justify-center text-white font-black text-xs shadow-inner">
            U
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white uppercase leading-none">User_Access</span>
            <span className="text-[8px] font-mono text-[#f97316]/70 mt-1 uppercase">Standard_User</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default UserSideNav;