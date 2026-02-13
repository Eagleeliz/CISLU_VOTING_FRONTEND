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
  LayoutDashboard 
} from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state with the 'as any' fix for PersistPartial
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth as any);

  // Active link helper
  const isActive = (path: string) => location.pathname === path ? "text-red-500 font-bold" : "text-white";

  // Handle scroll effect
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
        scrolled ? "bg-indigo-950/80 backdrop-blur-md shadow-lg py-2" : "bg-indigo-950 py-4"
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          
          {/* Logo */}
          <Link to="/" className="text-white text-2xl font-bold flex items-center gap-2">
            CISLU<span className="text-red-500">Vote</span>
          </Link>

<<<<<<< HEAD
          {/* Desktop Links */}
          <ul className="hidden md:flex gap-8 font-medium">
            <li>
              <Link className="text-white hover:text-red-500" to="/">
                Home
              </Link>
            </li>
            <li>
              <Link className="text-white hover:text-red-500" to="/login">
                Login
              </Link>
            </li>
            <li>
              <Link className="text-white hover:text-red-500" to="/register">
                Register
              </Link>
            </li>
            <li>
              <Link className="text-white hover:text-red-500" to="/about">
                About
              </Link>
            </li>
            <li>
              <Link className="text-white hover:text-red-500" to="/contact">
                Contact
              </Link>
            </li>
=======
          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8 font-medium">
            <li><Link className={`hover:text-red-500 flex items-center gap-1 ${isActive("/")}`} to="/"><Home size={18}/> Home</Link></li>
            <li><Link className={`hover:text-red-500 flex items-center gap-1 ${isActive("/about")}`} to="/about"><Info size={18}/> About</Link></li>
            <li><Link className={`hover:text-red-500 flex items-center gap-1 ${isActive("/contact")}`} to="/contact"><Phone size={18}/> Contact</Link></li>
>>>>>>> 0738f7b (Added Auth lOgin)
          </ul>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center gap-4">
                <Link to="/login" className="text-white hover:text-red-500 flex items-center gap-1"><LogIn size={18}/> Login</Link>
                <Link to="/register" className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-1">
                  <UserPlus size={18}/> Register
                </Link>
              </div>
            ) : (
              <div className="relative group">
                {/* User Dropdown Trigger */}
                <button className="flex items-center gap-2 bg-indigo-900/50 p-2 rounded-full border border-indigo-800 hover:bg-indigo-800 transition">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                    {user?.fullName?.charAt(0)}
                  </div>
                  <span className="text-white hidden sm:block">Hi, {user?.fullName?.split(" ")[0]}</span>
                  <ChevronDown className="text-gray-400 group-hover:rotate-180 transition-transform" size={16} />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right">
                  <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <LayoutDashboard size={16}/> Dashboard
                  </Link>
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <User size={16}/> Profile
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50">
                    <LogOut size={16}/> Logout
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white text-3xl">
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-indigo-950 z-[60] flex flex-col p-6 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-bold text-white">CISLU<span className="text-red-500">Vote</span></h1>
            <button onClick={() => setMenuOpen(false)} className="text-white text-3xl">✕</button>
          </div>

          <div className="flex flex-col gap-6 text-xl text-white">
            <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 border-b border-indigo-900 pb-4"><Home /> Home</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 border-b border-indigo-900 pb-4"><Info /> About</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 border-b border-indigo-900 pb-4"><Phone /> Contact</Link>
            
            {!isAuthenticated ? (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3"><LogIn /> Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="bg-red-500 text-center py-3 rounded-xl">Get Started</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="flex items-center gap-3 text-red-400"><LogOut /> Logout</button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;