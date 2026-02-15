import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCredentials } from "../Features/Auth/AuthSlice";
import type { RootState } from "../app/store";
import { 
  Home, 
  Info, 
  LogOut, 
  User, 
  ChevronDown, 
  UserCheck,
  Menu,
  X,
  Users,
  Vote,
  BarChart3,
  ShieldCheck
} from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth as any);
  const userRole = user?.role;

  const isActive = (path: string) => location.pathname === path;

  // DESKTOP ACTIVE STYLE HELPER
  const linkStyles = (path: string) => `
    relative flex items-center gap-2 transition-all duration-300 py-2 text-[11px] tracking-[0.2em] uppercase
    ${isActive(path) 
      ? "text-white font-black scale-105" 
      : "text-slate-400 hover:text-white font-bold"}
  `;

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
        scrolled ? "bg-indigo-950/95 backdrop-blur-xl shadow-2xl py-2" : "bg-indigo-950 py-5"
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          
          {/* Logo */}
          <Link to="/" className="text-white text-2xl font-black flex items-center gap-2 tracking-tighter group">
            CISLU<span className="text-red-500 underline decoration-4 underline-offset-4 group-hover:bg-red-500 group-hover:text-white transition-all px-1">VOTE</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            <li>
              <Link className={linkStyles("/")} to="/">
                <Home size={14} className={isActive("/") ? "text-red-500" : ""} /> Home
                {isActive("/") && (
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-red-500 rounded-full shadow-[0_0_15px_#ef4444]" />
                )}
              </Link>
            </li>
            
            {isAuthenticated && (
              <>
                <li>
                  <Link className={linkStyles("/Candidates")} to="/Candidates">
                    <Users size={14} className={isActive("/Candidates") ? "text-red-500" : ""} /> Candidates
                    {isActive("/Candidates") && (
                      <span className="absolute -bottom-2 left-0 w-full h-1 bg-red-500 rounded-full shadow-[0_0_15px_#ef4444]" />
                    )}
                  </Link>
                </li>
                <li>
                  <Link className={linkStyles("/voting")} to="/voting">
                    <Vote size={14} className={isActive("/voting") ? "text-red-500" : ""} /> Voting
                    {isActive("/voting") && (
                      <span className="absolute -bottom-2 left-0 w-full h-1 bg-red-500 rounded-full shadow-[0_0_15px_#ef4444]" />
                    )}
                  </Link>
                </li>
                <li>
                  <Link className={linkStyles("/results")} to="/results">
                    <BarChart3 size={14} className={isActive("/results") ? "text-red-500" : ""} /> Results
                    {isActive("/results") && (
                      <span className="absolute -bottom-2 left-0 w-full h-1 bg-red-500 rounded-full shadow-[0_0_15px_#ef4444]" />
                    )}
                  </Link>
                </li>
              </>
            )}

            <li>
              <Link className={linkStyles("/about")} to="/about">
                <Info size={14} className={isActive("/about") ? "text-red-500" : ""} /> About
                {isActive("/about") && (
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-red-500 rounded-full shadow-[0_0_15px_#ef4444]" />
                )}
              </Link>
            </li>
          </ul>

          {/* Desktop Auth Section */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <Link to="/login" className="hidden md:block text-white text-[11px] font-black hover:text-red-500 transition-colors tracking-widest bg-white/5 px-6 py-2.5 rounded-xl border border-white/10 uppercase">
                Login
              </Link>
            ) : (
              <div className="hidden md:flex relative group">
                <button className="flex items-center gap-3 bg-white/5 p-1 pr-4 rounded-full border border-white/10 hover:border-red-500/50 transition-all">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-black shadow-lg">
                    {user?.fullName?.charAt(0) || "V"}
                  </div>
                  <ChevronDown className="text-slate-400 group-hover:rotate-180 transition-transform duration-500" size={14} />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-3 w-60 origin-top-right rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-4 overflow-hidden z-[60]">
                  <div className="bg-slate-50 px-5 py-4 border-b border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified ID</p>
                    <p className="text-xs font-black text-slate-900 truncate">{user?.studentRegNo || 'Member'}</p>
                  </div>
                  <div className="p-2">
                    <Link to={userRole === "admin" ? "/AdminDashBoard" : "/Dashboard"} className="flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
                      {userRole === "admin" ? <UserCheck size={16} /> : <User size={16} />} 
                      {userRole === "admin" ? "ADMIN CONSOLE" : "MY DASHBOARD"}
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-red-600 hover:bg-red-50 rounded-xl transition-all mt-1">
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
        <div className="fixed inset-0 bg-indigo-950 z-[100] flex flex-col p-6 animate-in slide-in-from-right duration-500 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl font-black text-white italic">CISLU<span className="text-red-500">VOTE</span></h1>
            <button onClick={() => setMenuOpen(false)} className="bg-white/10 p-2 rounded-full text-white">
              <X size={20} />
            </button>
          </div>

          {/* PERSONALIZED USER CARD (MOBILE) */}
          {isAuthenticated ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-600/10 rounded-full blur-2xl" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-2xl text-white font-black shadow-xl rotate-3">
                  {user?.fullName?.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Verified Voter</span>
                    <ShieldCheck size={12} className="text-red-500" />
                  </div>
                  <h2 className="text-white text-lg font-black leading-tight mt-1">{user?.fullName}</h2>
                  <p className="text-slate-400 text-xs font-medium tracking-tight mt-0.5">{user?.studentRegNo}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-600/10 border border-red-500/20 rounded-3xl p-6 mb-8 text-center">
              <p className="text-white font-bold text-sm uppercase tracking-widest">Election Portal</p>
            </div>
          )}

          {/* Navigation Links (Mobile) */}
          <div className="flex flex-col gap-2">
            {[
              { path: "/", label: "Home", icon: <Home size={20}/> },
              { path: "/Candidates", label: "Candidates", icon: <Users size={20}/>, auth: true },
              { path: "/voting", label: "Cast Vote", icon: <Vote size={20}/>, auth: true },
              { path: "/results", label: "Live Results", icon: <BarChart3 size={20}/>, auth: true },
              { path: "/about", label: "About Portal", icon: <Info size={20}/> }
            ].map((link) => (
              (!link.auth || isAuthenticated) && (
                <Link 
                  key={link.path}
                  to={link.path} 
                  onClick={() => setMenuOpen(false)} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isActive(link.path) 
                      ? "bg-red-600 border-red-500 text-white" 
                      : "bg-white/5 border-white/5 text-slate-300"
                  }`}
                >
                  <span className="flex items-center gap-4 font-black text-[10px] uppercase tracking-widest">
                    {link.icon} {link.label}
                  </span>
                  {isActive(link.path) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </Link>
              )
            ))}

            {/* DASHBOARD ACCESS (MOBILE) */}
            {isAuthenticated && (
              <Link 
                to={userRole === "admin" ? "/AdminDashBoard" : "/Dashboard"}
                onClick={() => setMenuOpen(false)} 
                className="flex items-center gap-4 p-4 rounded-2xl border bg-white text-indigo-950 font-black text-[10px] uppercase tracking-widest mt-2"
              >
                {userRole === "admin" ? <UserCheck size={20}/> : <User size={20}/>} 
                {userRole === "admin" ? "ADMIN CONSOLE" : "MY DASHBOARD"}
              </Link>
            )}
          </div>

          <div className="mt-auto pt-8">
            {!isAuthenticated ? (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="w-full py-4 rounded-2xl bg-white text-indigo-950 font-black text-center text-xs tracking-widest uppercase">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="w-full py-4 rounded-2xl bg-red-600 text-white font-black text-center text-xs tracking-widest uppercase">Register</Link>
              </div>
            ) : (
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black border border-red-500/20 text-[10px] tracking-widest uppercase">
                <LogOut size={18} /> Logout Session
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;