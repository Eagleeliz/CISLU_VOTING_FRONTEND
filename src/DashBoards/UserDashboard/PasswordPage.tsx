import React, { useState } from "react";
import { useUpdatePasswordMutation } from "../../Features/Apis/Users.Api"; 
import { toast } from "react-hot-toast";
import Navbar from "../../components/Navbar";
import { KeyRound, ShieldCheck, Eye, EyeOff, Lock, Loader2, Save, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from "react-router-dom";

const PasswordPage = () => {
  const [updatePassword, { isLoading: isUpdating }] = useUpdatePasswordMutation();
  const [showPasswords, setShowPasswords] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // --- SECURITY LOGIC ---
  const hasNumber = /\d/.test(formData.newPassword);
  const hasLetter = /[a-zA-Z]/.test(formData.newPassword);
  const isLongEnough = formData.newPassword.length >= 6;
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword !== "";
  
  // Logic to check if new password is just the old one
  const isSameAsOld = formData.currentPassword === formData.newPassword && formData.newPassword !== "";
  
  // canSubmit now also checks that the password isn't the same as the old one
  const canSubmit = isLongEnough && hasNumber && hasLetter && passwordsMatch && formData.currentPassword !== "" && !isSameAsOld;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extra safety check
    if (isSameAsOld) {
        setServerError("New password cannot be the same as your current password");
        return;
    }

    if (!canSubmit) return;
    setServerError(null);

    try {
      await updatePassword({ 
        currentPassword: formData.currentPassword, 
        password: formData.newPassword 
      }).unwrap();
      
      setShowSuccessBanner(true);
      toast.success("CREDENTIALS_UPDATED");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      const errorMsg = err.data?.error || "UPLINK_ERROR";
      setServerError(errorMsg); 
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090d] text-white overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-6xl mx-auto pt-24 md:pt-32 px-4 sm:px-8 pb-12">
        <div className="mb-12">
          <Link to="/profile" className="flex items-center gap-2 text-white/30 hover:text-purple-400 transition-colors mb-4 text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft size={14} /> Back to Profile
          </Link>
          <h1 className="text-[8vw] md:text-5xl lg:text-6xl font-black tracking-tighter uppercase whitespace-nowrap leading-none">
            Change<span className="text-purple-400">.Password</span>
          </h1>
        </div>

        {showSuccessBanner && (
          <div className="mb-8 w-full bg-purple-500/10 border border-purple-500/50 rounded-2xl p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <CheckCircle2 className="text-purple-400" size={24} />
            <div>
              <p className="text-purple-400 font-black uppercase tracking-widest text-[12px]">Success😎</p>
              <p className="text-white/80 text-sm font-bold">Password changed successfully</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-b from-[#0b0e14] to-[#07090d] rounded-[2.5rem] p-12 border border-slate-800/50 relative overflow-hidden shadow-2xl flex flex-col justify-center min-h-[350px]">
              <ShieldCheck className="absolute -right-8 -bottom-8 text-purple-400/[0.02]" size={200} />
              <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">Security Status</p>
              <h3 className="text-6xl font-black relative z-10">ACTIVE</h3>
              <p className="text-white/40 text-[10px] mt-4 font-bold uppercase tracking-wider relative z-10">Encryption Protocol Enabled</p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-[#0b0e14] rounded-[2.5rem] p-10 md:p-16 border border-slate-800 shadow-2xl">
              <form id="password-form" onSubmit={handleUpdatePassword} className="space-y-10">
                
                {/* CURRENT PASSWORD */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                    <Lock size={14} className="text-purple-400"/> Current Password
                  </label>
                  <input 
                    type={showPasswords ? "text" : "password"}
                    required
                    className={`w-full bg-[#07090d] border ${serverError ? 'border-red-500/50' : 'border-slate-800'} rounded-xl py-4 px-6 outline-none focus:border-purple-400 text-white transition-all text-lg`}
                    value={formData.currentPassword}
                    onChange={(e) => {
                      setFormData({...formData, currentPassword: e.target.value});
                      if(serverError) setServerError(null);
                    }}
                  />
                  {serverError && (
                    <p className="text-red-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 animate-pulse">
                      <AlertCircle size={10} /> {serverError}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                            <KeyRound size={14} className="text-purple-400"/> New Password
                        </label>
                        <input 
                            type={showPasswords ? "text" : "password"}
                            required
                            className={`w-full bg-[#07090d] border ${isSameAsOld ? 'border-amber-500/50' : formData.newPassword && (!hasNumber || !hasLetter || !isLongEnough) ? 'border-purple-400/30' : 'border-slate-800'} rounded-xl py-4 px-6 outline-none focus:border-purple-400 text-white transition-all text-lg`}
                            value={formData.newPassword}
                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        />
                        <div className="pt-2 space-y-1">
                          {/* Indicator for same password */}
                          {isSameAsOld && (
                             <p className="text-amber-500 text-[9px] font-black uppercase tracking-tighter flex items-center gap-1">
                               <AlertCircle size={10} /> Cannot be the same as current
                             </p>
                          )}
                          <p className={`text-[9px] font-black uppercase tracking-tighter flex items-center gap-1 ${isLongEnough ? 'text-purple-400' : 'text-white/10'}`}>
                            {isLongEnough ? '✓' : '○'} 6+ Characters
                          </p>
                          <p className={`text-[9px] font-black uppercase tracking-tighter flex items-center gap-1 ${hasLetter && hasNumber ? 'text-purple-400' : 'text-white/10'}`}>
                            {hasLetter && hasNumber ? '✓' : '○'} Letters + Numbers Required
                          </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                            <KeyRound size={14} className="text-purple-400"/> Confirm Password
                        </label>
                        <input 
                            type={showPasswords ? "text" : "password"}
                            required
                            className={`w-full bg-[#07090d] border ${formData.confirmPassword && !passwordsMatch ? 'border-red-500/50' : 'border-slate-800'} rounded-xl py-4 px-6 outline-none focus:border-purple-400 text-white transition-all text-lg`}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                        {formData.confirmPassword && !passwordsMatch && (
                          <p className="text-red-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 animate-pulse">
                            <AlertCircle size={10} /> Mismatch Detected
                          </p>
                        )}
                    </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all flex items-center gap-2"
                >
                  {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPasswords ? "Hide Passwords" : "Show Passwords"}
                </button>
              </form>
            </div>

            <button 
              form="password-form"
              type="submit"
              disabled={isUpdating || !canSubmit}
              className={`mt-8 w-full flex items-center justify-center gap-4 px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-xl 
                ${canSubmit 
                  ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed shadow-none'}`}
            >
              {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {isUpdating ? "Syncing..." : "Update Credentials"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PasswordPage;