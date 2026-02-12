import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* Navbar Top */}
      <nav className="w-full bg-indigo-950 fixed top-0 left-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          
          {/* Logo */}
          <h1 className="text-white text-2xl font-bold">
            CISLU<span className="text-red-500">Vote</span>
          </h1>

          {/* Desktop Links */}
          <ul className="hidden md:flex gap-8 font-medium">
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
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden text-white text-3xl"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Full Screen Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col px-6 py-6">

          {/* Top Row: Logo + Close Button */}
          <div className="flex justify-between items-center border-b pb-4">
            <h1 className="text-2xl font-bold text-indigo-950">
              CISLU<span className="text-red-500">Vote</span>
            </h1>

            {/* Close Button */}
            <button
              onClick={() => setMenuOpen(false)}
              className="text-3xl font-bold text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Menu Links */}
          <div className="flex flex-col mt-6 gap-6 text-lg font-medium text-indigo-950">

            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="border-b pb-3 hover:text-red-500 transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="border-b pb-3 hover:text-red-500 transition"
            >
              Register
            </Link>

            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="border-b pb-3 hover:text-red-500 transition"
            >
              About
            </Link>

            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="border-b pb-3 hover:text-red-500 transition"
            >
              Contact Us
            </Link>
          </div>

          {/* Button at Bottom */}
          <div className="mt-auto pb-6">
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/register");
              }}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold text-lg hover:bg-orange-600 transition"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;