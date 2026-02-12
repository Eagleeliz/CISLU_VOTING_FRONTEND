import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import img2 from "../assets/img2.jpg";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };



  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // Add validation logic here
  if (formData.username && formData.password) {
    navigate("/applications");
  }
};

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Main Content - Split Layout */}
      <div className="flex flex-grow pt-20 md:pt-24">
        
        {/* Left Column - Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            
            {/* Header */}
                <h1 className="text-black text-xl font-bold mb-8">
            LOGIN<span className="text-red-500">_PORTAL</span>
          </h1>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                 Reg_No:
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-black"
                  required
                />
              </div>

              {/* Password Field */}
                 {/* Password Field */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Password
  </label>
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      value={formData.password}
      onChange={handleChange}
      placeholder="Enter your password"
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-black pr-12"
      required
    />
          <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-0"
  style={{ 
    background: 'transparent', 
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none'
  }}
>
  {showPassword ? (
    <Eye className="h-5 w-5" />
  ) : (
    <EyeOff className="h-5 w-5" />
  )}
</button>
  </div>
</div>

              {/* Login Button */}
              <button
  type="submit"
  className="w-full bg-red-500 hover:bg-[#ea580c] text-white font-semibold py-2 px-4 rounded-md transition duration-200"
>
  LOGIN
</button>

              {/* Extra Links */}
              <div className="text-center text-sm">
                <Link to="/forgot-password" className="text-gray-600 hover:text-[#f97316] mr-4">
                  Forgot password?
                </Link>
                <Link to="/register" className="text-gray-600 hover:text-[#f97316]">
                  Register
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Image (resized) */}
        <div className="hidden md:flex md:w-1/2 bg-gray-50 items-center justify-center p-8">
          <div className="w-full max-w-md h-auto rounded-lg overflow-hidden shadow-xl">
            <img 
              src={img2} 
              alt="Login"
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;