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
  X
} from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth as any);
  const userRole = user?.role; // Role from the user object

  // Active link helper
  const isActive = (path: string) => location.pathname === path ? "text-red-500 font-bold" : "text-white";

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
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-indigo-950/95 backdrop-blur-md shadow-lg py-2" : "bg-indigo-950 py-4"
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          
          {/* Logo */}
          <Link to="/" className="text-white text-2xl font-black flex items-center gap-2 tracking-tighter">
            CISLU<span className="text-red-500 underline decoration-2 underline-offset-4">VOTE</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8 font-semibold uppercase text-xs tracking-widest">
            <li><Link className={`hover:text-red-500 flex items-center gap-2 transition-colors ${isActive("/")}`} to="/"><Home size={16}/> Home</Link></li>
            <li><Link className={`hover:text-red-500 flex items-center gap-2 transition-colors ${isActive("/about")}`} to="/about"><Info size={16}/> About</Link></li>
            <li><Link className={`hover:text-red-500 flex items-center gap-2 transition-colors ${isActive("/contact")}`} to="/contact"><Phone size={16}/> Contact</Link></li>
          </ul>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center gap-5">
                <Link to="/login" className="text-white font-bold hover:text-red-500 transition-colors flex items-center gap-2 underline underline-offset-4 decoration-transparent hover:decoration-red-500">
                  <LogIn size={18}/> LOGIN
                </Link>
                <Link to="/register" className="bg-red-500 text-white px-6 py-2.5 rounded-xl font-black hover:bg-red-600 transition-all shadow-lg active:scale-95 flex items-center gap-2">
                  <UserPlus size={18}/> REGISTER
                </Link>
              </div>
            ) : (
              /* User Dropdown */
              <div className="relative group">
                <button className="flex items-center gap-3 bg-indigo-900/40 p-1.5 pr-4 rounded-full border border-indigo-800/50 hover:bg-indigo-800/60 transition-all">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center text-white font-black shadow-inner">
                    {user?.fullName?.charAt(0) || user?.studentRegNo?.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-[10px] text-indigo-300 font-bold uppercase leading-none mb-1">Authenticated</p>
                    <p className="text-white text-sm font-bold leading-none capitalize">
                       {user?.fullName?.split(" ")[0] || "Voter"}
                    </p>
                  </div>
                  <ChevronDown className="text-indigo-400 group-hover:rotate-180 transition-transform duration-300" size={16} />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                  <div className="py-2 px-1">
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
                      <p className="text-sm font-black text-gray-900 truncate">{user?.studentRegNo}</p>
                    </div>
                    
                    {userRole === "admin" ? (
                      <Link to="/AdminDashBoard" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors">
                        <UserCheck size={18} /> Admin Panel
                      </Link>
                    ) : (
                      <Link to="/Dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors">
                        <User size={18} /> Voter Dashboard
                      </Link>
                    )}
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut size={18} /> Logout Session
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2 hover:bg-indigo-900 rounded-lg transition-colors">
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-indigo-950 z-[60] flex flex-col p-6 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-black text-white">CISLU<span className="text-red-500">VOTE</span></h1>
            <button onClick={() => setMenuOpen(false)} className="text-white p-2">
              <X size={32} />
            </button>
          </div>

          <div className="flex flex-col gap-4 text-xl text-white font-bold">
            <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center justify-between p-4 bg-indigo-900/30 rounded-2xl border border-indigo-900"><span className="flex items-center gap-3"><Home /> Home</span> <ChevronDown size={20} className="-rotate-90 text-indigo-500" /></Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="flex items-center justify-between p-4 bg-indigo-900/30 rounded-2xl border border-indigo-900"><span className="flex items-center gap-3"><Info /> About</span> <ChevronDown size={20} className="-rotate-90 text-indigo-500" /></Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="flex items-center justify-between p-4 bg-indigo-900/30 rounded-2xl border border-indigo-900"><span className="flex items-center gap-3"><Phone /> Contact</span> <ChevronDown size={20} className="-rotate-90 text-indigo-500" /></Link>
            
            <div className="mt-6 pt-6 border-t border-indigo-900/50">
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-indigo-800 font-black text-sm">LOGIN</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="bg-red-500 text-center py-4 rounded-2xl font-black text-sm">REGISTER</Link>
                </div>
              ) : (
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black border border-red-500/20 underline decoration-red-500 underline-offset-4">
                  <LogOut /> LOGOUT SESSION
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;