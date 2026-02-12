import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a1a3f] via-[#0e2a5a] to-[#1a3a6f]">
      {/* Navbar - Fixed at top */}
    <Navbar/>

      {/* Main Hero Content - Pushed down below fixed navbar */}
      <div className="flex flex-col flex-grow justify-center items-center px-4 sm:px-6 md:px-8 text-center pt-20 md:pt-24 relative">
        
        {/* Optional: Overlay pattern for texture */}
        <div className="absolute inset-0 opacity-10" 
             style={{
               backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
               backgroundSize: '30px 30px'
             }}>
        </div>
        
        {/* Content - relative to appear above overlay */}
        <div className="relative z-10">
          {/* Title - Responsive text sizes */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl">
            CISLU Club Voting System
          </h1>

          {/* Subtitle - Responsive */}
          <p className="text-gray-200 max-w-xl mt-4 text-base sm:text-lg md:text-xl px-4">
            Secure, transparent, and easy online voting for Laikipia University students.
          </p>

          {/* Button - Responsive padding and text */}
              <button
  onClick={() => navigate("/login")}
  className="mt-6 sm:mt-8 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-red-500 text-red-500 font-semibold text-base sm:text-lg shadow-lg hover:bg-red-600 transition duration-300 transform hover:scale-105"
>
  Get Started →
</button>

          {/* Footer - Responsive */}
          <p className="mt-12 sm:mt-16 text-xs sm:text-sm text-gray-300 px-4">
            © {new Date().getFullYear()} CISLU Club | All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;