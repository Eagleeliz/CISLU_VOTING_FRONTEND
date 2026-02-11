import { useNavigate } from "react-router-dom";

const LandingPage  = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-700 to-indigo-900 text-white px-6">
      
      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center">
        CISLU Club Voting System
      </h1>

      {/* Footer */}
      <p className="mt-10 text-sm text-gray-300">
        © {new Date().getFullYear()} CISLU Club | All Rights Reserved
      </p>
    </div>
  );
};

export default LandingPage;