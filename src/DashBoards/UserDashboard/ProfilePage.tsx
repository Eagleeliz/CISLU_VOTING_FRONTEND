import { useState, useEffect } from "react";
import { useGetMeQuery, useUpdateProfileMutation } from "../../Features/Apis/Users.Api";
import { toast } from "react-hot-toast";
import Navbar from "../../components/Navbar";
import { User, ShieldCheck, Mail, GraduationCap, Award, Loader2, Edit3, Save, X } from 'lucide-react';

const ProfilePage = () => {
  const { data: user, isLoading: profileLoading } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", yearOfStudy: "" });
  const [originalData, setOriginalData] = useState({ fullName: "", yearOfStudy: "" });

  useEffect(() => {
    if (user) {
      const initialData = { 
        fullName: user.fullName || "", 
        yearOfStudy: user.yearOfStudy?.toString() || "1" 
      };

      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        yearOfStudy: formData.yearOfStudy
      };
      await updateProfile(payload).unwrap();
      toast.success("Identity Synchronized");
      setIsEditMode(false);
    } catch (err: any) {
      console.error("Save Error:", err);
      toast.error(err.data?.error || "UPLINK_FAILURE: Authorization Rejected");
    }
  };

  const handleDiscard = () => {
    setFormData(originalData);
    toast.success("Changes Discarded");
    setIsEditMode(false);
  };

  if (profileLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#07090d]">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07090d] text-white overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-6xl mx-auto pt-24 md:pt-32 px-4 sm:px-6 pb-12">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="w-full">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-2">Welcome Back</p>
            <h1 className="text-[8vw] md:text-5xl lg:text-6xl font-black tracking-tighter  whitespace-nowrap leading-none">
              {user?.fullName?.split(" ")[0] || "User"}<span className="text-red-600">.Profile</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {isEditMode && (
              <button
                onClick={handleDiscard}
                className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-lg bg-slate-800 hover:bg-slate-700"
              >
                <X size={14} />
                Discard Changes
              </button>
            )}

            <button 
              onClick={() => isEditMode ? handleSave() : setIsEditMode(true)}
              disabled={isUpdating}
              className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-lg bg-red-600 hover:bg-red-500"
            >
              {isUpdating ? <Loader2 className="animate-spin" size={14} /> : isEditMode ? <Save size={14} /> : <Edit3 size={14} />}
              {isEditMode ? "Apply Changes" : "Update Profile"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12">
          
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-b from-[#0b0e14] to-[#07090d] rounded-[2.5rem] p-14 min-h-[250px] border border-slate-800/50 relative overflow-hidden shadow-2xl flex flex-col justify-center transition-transform hover:scale-[1.02] duration-300">
              <Award className="absolute -right-6 -bottom-6 text-white/[0.03]" size={150} />
              <p className="text-red-600 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">Participation</p>
              <h3 className="text-6xl md:text-8xl font-black relative z-10">{user?.participationPoints || 0}</h3>
              <p className="text-white/40 text-[10px] mt-2 font-bold uppercase tracking-wider relative z-10">Points Earned</p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-[#0b0e14] rounded-[2.5rem] p-8 md:p-16 min-h-[400px] border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-12">
                
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-white/50 uppercase flex items-center gap-2 group-hover:text-red-600 transition-colors">
                    <User size={14} className="text-red-600"/> Full Identity
                  </label>
                  {isEditMode ? (
                    <input 
                      className="w-full bg-[#07090d] border border-red-600/30 rounded-xl py-3 px-4 outline-none focus:border-red-600 text-white transition-all shadow-inner"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  ) : (
                    <p className="text-xl md:text-2xl font-bold tracking-tight text-white/90">{user?.fullName || "Not Set"}</p>
                  )}
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-white/50 uppercase flex items-center gap-2 group-hover:text-red-600 transition-colors">
                    <GraduationCap size={14} className="text-red-600"/> Academic Year
                  </label>
                  {isEditMode ? (
                    <select 
                      className="w-full bg-[#07090d] border border-red-600/30 rounded-xl py-3 px-4 outline-none focus:border-red-600 text-white shadow-inner"
                      value={formData.yearOfStudy}
                      onChange={(e) => setFormData({...formData, yearOfStudy: e.target.value})}
                    >
                      {[1,2,3,4].map(y => <option key={y} value={y} className="bg-[#07090d]">Year {y}</option>)}
                    </select>
                  ) : (
                    <p className="text-xl md:text-2xl font-bold text-white/90">Year {user?.yearOfStudy || "N/A"}</p>
                  )}
                </div>

                <div className="space-y-2 opacity-60">
                  <label className="text-[10px] font-black uppercase flex items-center gap-2 tracking-wider"><ShieldCheck size={14}/> User ID (Reg No)</label>
                  <p className="text-lg md:text-xl font-bold font-mono tracking-wide">{user?.studentRegNo}</p>
                </div>

                <div className="space-y-2 opacity-60">
                  <label className="text-[10px] font-black uppercase flex items-center gap-2 tracking-wider"><Mail size={14}/> Email Account</label>
                  <p className="text-lg md:text-xl font-bold break-all">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;