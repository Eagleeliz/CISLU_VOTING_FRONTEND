import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUserData, completeProfile } from "../../Features/Auth/AuthSlice";
import { useCompleteProfileMutation } from "../../Features/Apis/Auth.APi"; 
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
    studentRegNo: user?.studentRegNo || "",
    email: user?.email || "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        studentRegNo: user.studentRegNo || "",
        email: user.email || "",
        fullName: user.fullName || "",
        yearOfStudy: user.yearOfStudy ? String(user.yearOfStudy) : "",
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.fullName.trim().length < 3) {
      toast.error("Full name must be at least 3 characters");
      return;
    }

    try {
      // Constructing payload for the updated Auth.APi
      const payload = {
        studentRegNo: formData.studentRegNo,
        fullName: formData.fullName.trim(),
        yearOfStudy: String(formData.yearOfStudy), 
        email: formData.email,
      };

      const result = await saveProfile(payload).unwrap();

      dispatch(updateUserData(result.user));
      dispatch(completeProfile());

      toast.success("Profile saved successfully!");
      navigate("/dashboard");

    } catch (error: any) {
      console.error("Submission Error:", error);
      const serverMsg = error.data?.error || error.data?.message || "Server Error: Failed to update profile.";
      toast.error(serverMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFE] flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col lg:flex-row w-full overflow-hidden">
        {/* BRAND PANEL */}
        <div className="hidden lg:flex lg:w-5/12 bg-indigo-950 p-16 flex-col justify-center relative">
          <div className="relative z-10">
            <div className="w-20 h-1 bg-red-500 mb-8" />
            <h1 className="text-7xl font-black text-white uppercase leading-[0.85] tracking-tighter">
              Verify <br /> <span className="text-red-600">Account.</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-sm mt-8 leading-relaxed">
              Updating record for <span className="text-white font-bold">{formData.studentRegNo}</span>. 
              Complete this step to access your dashboard.
            </p>
          </div>
        </div>

        {/* FORM PANEL */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-24 lg:py-10">
          <div className="w-full max-w-md">
            <div className="mb-12 text-center lg:text-left">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-2">Registration Sync</p>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Complete Profile</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4 opacity-60">
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input readOnly value={formData.studentRegNo} className="w-full pl-10 pr-2 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 outline-none" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input readOnly value={formData.email} className="w-full pl-10 pr-2 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 outline-none" />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-red-500 outline-none font-bold text-black shadow-sm"
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Year of Study</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500" size={18} />
                  <select
                    required
                    value={formData.yearOfStudy}
                    className="w-full pl-12 pr-10 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-red-500 outline-none font-bold text-black appearance-none shadow-sm"
                    onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                  >
                    <option value="">Select Year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase text-[11px] tracking-widest"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <>Complete Sync <ArrowRight /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;