// pages/CompleteProfile.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    yearOfStudy: "",
    email: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get existing user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Update user with profile data
    const updatedUser = {
      ...user,
      fullName: formData.fullName,
      yearOfStudy: formData.yearOfStudy,
      email: formData.email,
      isProfileComplete: true
    };
    
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Redirect to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-gray-200">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 py-12 pt-24">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100">
          
          {/* Header with accent */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Complete<span className="text-[#f97316]">_Profile</span>
            </h2>
            <div className="h-1 w-20 bg-[#f97316] rounded-full"></div>
          </div>
          
          <p className="text-sm text-gray-600 mb-8">
            Please provide your details to continue to the dashboard
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Full Name <span className="text-[#f97316]">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] text-gray-900 placeholder-gray-400 transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            {/* Year of Study Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Year of Study <span className="text-[#f97316]">*</span>
              </label>
              <select
                value={formData.yearOfStudy}
                onChange={(e) => setFormData({...formData, yearOfStudy: e.target.value})}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] text-gray-900 appearance-none cursor-pointer"
                required
              >
                <option value="" className="text-gray-500">Select your year</option>
                <option value="1" className="text-gray-900">Year 1 - First Year</option>
                <option value="2" className="text-gray-900">Year 2 - Second Year</option>
                <option value="3" className="text-gray-900">Year 3 - Third Year</option>
                <option value="4" className="text-gray-900">Year 4 - Fourth Year</option>
              </select>
            </div>
            
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Email Address <span className="text-[#f97316]">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] text-gray-900 placeholder-gray-400 transition-all"
                placeholder="your.email@example.com"
                required
              />
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#f97316] text-white font-bold py-3.5 px-4 rounded-lg transition duration-200 text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Save & Continue to Dashboard →
              </button>
            </div>
            
            {/* Helper Text */}
            <p className="text-xs text-center text-gray-500 mt-4">
              Your information is secure and will only be used for verification
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;