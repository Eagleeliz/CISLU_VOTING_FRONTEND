import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCredentials } from "../Features/Auth/AuthSlice";
import type { RootState } from "../app/store";
import { 
  Home, 
  Info, 
  Phone, 
  UserPlus, 
  LogIn, 
  LogOut, 
  User, 
  ChevronDown, 
  UserCheck,
  Menu,
  X,
  Users,
  Vote,
  BarChart3
} from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth as any);
  const userRole = user?.role;

  // ENHANCED Active link helper
  const isActive = (path: string) => location.pathname === path;

  const linkStyles = (path: string) => `
    relative flex items-center gap-2 transition-all duration-300 py-2
    ${isActive(path) 
      ? "text-red-500 font-black scale-105" 
      : "text-slate-300 hover:text-white font-semibold"}
  `;

  // Handle scroll effect for transparency
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(clearCredentials());
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled ? "bg-indigo-950/95 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] py-2" : "bg-indigo-950 py-5"
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          
          {/* Logo */}
          <Link to="/" className="text-white text-2xl font-black flex items-center gap-2 tracking-tighter group">
            CISLU<span className="text-red-500 underline decoration-4 underline-offset-4 group-hover:bg-red-500 group-hover:text-white transition-all px-1">VOTE</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.2em] uppercase">
            <li>
              <Link className={linkStyles("/")} to="/">
                <Home size={14} className={isActive("/") ? "animate-pulse" : ""} /> Home
                {isActive("/") && <span className="absolute -bottom-1 left-0 w-full h-1 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />}
              </Link>
            </li>
            
            {isAuthenticated && (
              <>
                <li>
                  <Link className={linkStyles("/Candidates")} to="/Candidates">
                    <Users size={14} /> Candidates
                    {isActive("/Candidates") && <span className="absolute -bottom-1 left-0 w-full h-1 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />}
                  </Link>
                </li>
                <li>
                  <Link className={linkStyles("/voting")} to="/voting">
                    <Vote size={14} /> Voting
                    {isActive("/voting") && <span className="absolute -bottom-1 left-0 w-full h-1 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />}
                  </Link>
                </li>
                <li>
                  <Link className={linkStyles("/results")} to="/results">
                    <BarChart3 size={14} /> Results
                    {isActive("/results") && <span className="absolute -bottom-1 left-0 w-full h-1 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />}
                  </Link>
                </li>
              </>
            )}

            <li>
              <Link className={linkStyles("/about")} to="/about">
                <Info size={14} /> About
                {isActive("/about") && <span className="absolute -bottom-1 left-0 w-full h-1 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />}
              </Link>
            </li>
          </ul>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center gap-6">
                <Link to="/login" className="text-white text-[11px] font-black hover:text-red-500 transition-colors tracking-widest">
                  LOGIN
                </Link>
                <Link to="/register" className="bg-red-600 text-white px-7 py-3 rounded-full text-[11px] font-black hover:bg-red-700 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all active:scale-95 uppercase tracking-widest">
                  Register Now
                </Link>
              </div>
            ) : (
              <div className="relative group">
                <button className="flex items-center gap-3 bg-white/5 p-1 pr-4 rounded-full border border-white/10 hover:bg-white/10 transition-all">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-black shadow-lg">
                    {user?.fullName?.charAt(0) || "V"}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-[9px] text-red-500 font-black uppercase leading-none mb-1 tracking-tighter">Verified User</p>
                    <p className="text-white text-xs font-bold leading-none truncate max-w-[80px]">
                       {user?.fullName?.split(" ")[0] || "Account"}
                    </p>
                  </div>
                  <ChevronDown className="text-slate-400 group-hover:rotate-180 transition-transform duration-500" size={14} />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-3 w-60 origin-top-right rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] ring-1 ring-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-4 overflow-hidden">
                  <div className="bg-slate-50 px-5 py-4 border-b border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Logged ID</p>
                    <p className="text-xs font-black text-slate-900 truncate">{user?.studentRegNo || 'Member'}</p>
                  </div>
                  <div className="p-2">
                    {userRole === "admin" ? (
                      <Link to="/AdminDashBoard" className="flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
                        <UserCheck size={16} /> ADMIN CONSOLE
                      </Link>
                    ) : (
                      <Link to="/Dashboard" className="flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
                        <User size={16} /> MY DASHBOARD
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-red-600 hover:bg-red-50 rounded-xl transition-all mt-1"
                    >
                      <LogOut size={16} /> TERMINATE SESSION
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2 bg-white/5 rounded-xl border border-white/10">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-indigo-950 z-[100] flex flex-col p-8 animate-in slide-in-from-right duration-500">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-2xl font-black text-white">CISLU<span className="text-red-500">VOTE</span></h1>
            <button onClick={() => setMenuOpen(false)} className="bg-white/5 p-3 rounded-full text-white">
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { path: "/", label: "Home", icon: <Home size={20}/> },
              { path: "/Candidates", label: "Candidates", icon: <Users size={20}/>, auth: true },
              { path: "/voting", label: "Cast Vote", icon: <Vote size={20}/>, auth: true },
              { path: "/results", label: "Results", icon: <BarChart3 size={20}/>, auth: true },
              { path: "/about", label: "About", icon: <Info size={20}/> }
            ].map((link) => (
              (!link.auth || isAuthenticated) && (
                <Link 
                  key={link.path}
                  to={link.path} 
                  onClick={() => setMenuOpen(false)} 
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                    isActive(link.path) 
                      ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20" 
                      : "bg-white/5 border-white/5 text-slate-300"
                  }`}
                >
                  <span className="flex items-center gap-4 font-black text-sm uppercase tracking-widest">
                    {link.icon} {link.label}
                  </span>
                  {isActive(link.path) && <div className="w-2 h-2 bg-white rounded-full animate-ping" />}
                </Link>
              )
            ))}
          </div>

          <div className="mt-auto">
            {!isAuthenticated ? (
              <div className="grid grid-cols-1 gap-3">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="w-full py-5 rounded-2xl bg-white text-indigo-950 font-black text-center text-xs tracking-widest">LOGIN</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="w-full py-5 rounded-2xl bg-red-600 text-white font-black text-center text-xs tracking-widest">CREATE ACCOUNT</Link>
              </div>
            ) : (
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-5 bg-red-500/10 text-red-500 rounded-2xl font-black border border-red-500/20 text-xs tracking-widest">
                <LogOut size={18} /> LOGOUT
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;