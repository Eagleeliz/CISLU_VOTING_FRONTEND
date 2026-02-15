import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUserData, completeProfile } from "../../Features/Auth/AuthSlice";
import { useCompleteProfileMutation } from "../../Features/Apis/ApplicationApi"; // Your RTK Mutation
import type { RootState } from "../../app/store";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Initialize the API mutation hook
  const [saveProfile, { isLoading }] = useCompleteProfileMutation();

  const [formData, setFormData] = useState({
    fullName: "",
    yearOfStudy: "",
    email: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 1. CALL THE BACKEND API (Permanent Save)
      // This sends the data to your section 3 of Auth.controller.ts
      const result = await saveProfile({
        studentRegNo: user?.studentRegNo || "",
        fullName: formData.fullName,
        yearOfStudy: formData.yearOfStudy,
        email: formData.email
      }).unwrap();

      // 2. UPDATE REDUX (Local Sync)
      dispatch(updateUserData(result.user));
      dispatch(completeProfile());

      toast.success("Profile permanently saved!");
      
      // 3. NAVIGATE
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-gray-200">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 py-12 pt-24">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <div className="mb-6 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complete<span className="text-[#f97316]">_Profile</span>
            </h2>
            <div className="h-1 w-20 bg-[#f97316] rounded-full"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input fields for Full Name, Year, and Email remain the same as your code */}
            
            {/* ... other inputs ... */}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-bold py-3.5 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save & Continue to Dashboard →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;