import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUserData, completeProfile } from "../../Features/Auth/AuthSlice";
import { useCompleteProfileMutation } from "../../Features/Apis/ApplicationApi";
import type { RootState } from "../../app/store";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import { User, Mail, GraduationCap, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth as any);
  
  const [saveProfile, { isLoading }] = useCompleteProfileMutation();

  const [formData, setFormData] = useState({
    fullName: "",
    yearOfStudy: "",
    email: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Sending the exact payload your working PUT request uses
      const result = await saveProfile({
        studentRegNo: user?.studentRegNo || "",
        fullName: formData.fullName,
        yearOfStudy: formData.yearOfStudy,
        email: formData.email
      }).unwrap();

      // Syncing the "user" object from your successful JSON response to Redux
      dispatch(updateUserData(result.user));
      dispatch(completeProfile());
      
      toast.success("Identity Verified Successfully!");
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.data?.error || "Error updating profile.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFE] flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex flex-col lg:flex-row w-full overflow-hidden">
        
        {/* LEFT BRAND PANEL: High-end Identity Section */}
        <div className="hidden lg:flex lg:w-5/12 bg-indigo-950 p-16 flex-col justify-center relative">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
             <div className="grid grid-cols-4 gap-10 rotate-12">
                {Array.from({length: 16}).map((_, i) => <ShieldCheck key={i} size={120} className="text-white" />)}
             </div>
          </div>
          
          <div className="relative z-10">
            <div className="w-20 h-1 bg-red-500 mb-8" />
            <h1 className="text-7xl font-black text-white uppercase leading-[0.85] tracking-tighter">
              Verify <br /> <span className="text-red-600">Account.</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-sm mt-8 leading-relaxed">
              We've found your record for <span className="text-white font-bold">{user?.studentRegNo}</span>. 
              Please complete the legal details below to activate your voting rights.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Optimized Form */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-24 lg:py-10">
          <div className="w-full max-w-md">
            
            <div className="mb-12">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-2">Final Step</p>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Complete Profile</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Read Only Reg No Card */}
              <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                    <ShieldCheck className="text-green-500" size={24} />
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Authenticated ID</p>
                    <p className="text-sm font-black text-indigo-950">{user?.studentRegNo || "PENDING..."}</p>
                </div>
              </div>

              {/* Input: Full Name */}
              <div className="group">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                  <input 
                    type="text"
                    required
                    placeholder="Enter full name"
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-red-500 outline-none transition-all font-bold text-slate-900 shadow-sm"
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
              </div>

              {/* Input: Year */}
              <div className="group">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Current Year of Study</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                  <select 
                    required
                    className="w-full pl-12 pr-10 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-red-500 outline-none transition-all font-bold text-slate-900 appearance-none shadow-sm"
                    onChange={(e) => setFormData({...formData, yearOfStudy: e.target.value})}
                  >
                    <option value="">Choose Year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
              </div>

              {/* Input: Email */}
              <div className="group">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                  <input 
                    type="email"
                    required
                    placeholder="student@cislu.com"
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-red-500 outline-none transition-all font-bold text-slate-900 shadow-sm"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] transition-all shadow-xl hover:bg-red-600 hover:shadow-red-600/30 active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-3 tracking-[0.2em] uppercase text-[11px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Validating...
                    </>
                  ) : (
                    <>
                      Save & Continue <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;