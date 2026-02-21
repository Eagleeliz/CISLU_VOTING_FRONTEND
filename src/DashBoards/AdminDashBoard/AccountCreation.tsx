import React, { useState } from "react";
import { 

  Mail, 
  ShieldCheck, 
  UserCircle, 
  Loader2, 
  CheckCircle2, 
  ShieldAlert, 
  Fingerprint,

  Terminal,
  Zap
} from "lucide-react";

// Using your Auth API syntax

import Navbar from "../../components/Navbar";
import { useRegisterMutation } from "../../Features/Apis/Auth.APi";

const AccountCreationPage = () => {
  const [formData, setFormData] = useState({
    studentRegNo: "",
    email: "",
    role: "member" as "member" | "admin"
  });

  const [register, { isLoading }] = useRegisterMutation();
  const [modal, setModal] = useState({ isOpen: false, type: "success", message: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData).unwrap();
      setModal({
        isOpen: true,
        type: "success",
        message: `IDENTITY_PROVISIONED: User [${formData.studentRegNo}] has been successfully committed to the registry.`
      });
      setFormData({ studentRegNo: "", email: "", role: "member" });
    } catch (err: any) {
      setModal({
        isOpen: true,
        type: "error",
        message: err.data?.message || "TRANSACTION_REJECTED: Duplicate entry or invalid protocol."
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-300 pb-24 pt-24 font-sans">
      <Navbar />
      
      {/* STATUS MODAL (Aligned with Scrutiny Theme) */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f1117] w-full max-w-md rounded-[2rem] p-10 shadow-2xl relative border border-slate-800 text-center animate-in zoom-in-95">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto border ${modal.type === 'error' ? 'border-rose-600/50 bg-rose-600/10 text-rose-500' : 'border-emerald-600/50 bg-emerald-600/10 text-emerald-500'}`}>
              {modal.type === 'error' ? <ShieldAlert size={40} /> : <CheckCircle2 size={40} />}
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 italic">
              {modal.type === "error" ? "Protocol_Error" : "Access_Granted"}
            </h3>
            <p className="text-slate-500 text-[11px] font-mono leading-relaxed mb-8 uppercase">{modal.message}</p>
            <button 
              onClick={() => setModal({ ...modal, isOpen: false })}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
            >
              Acknowledge_Receipt
            </button>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6">
        {/* HEADER SECTION (Indigo & Dark Theme) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-slate-800 pb-8">
          <div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-1">
              Identity<span className="text-indigo-600 font-light not-italic">_Forge</span>
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <Terminal size={12} className="text-indigo-600" />
              <span>Registry_Status: <span className="text-emerald-500">Online</span></span>
            </div>
          </div>
          <div className="bg-indigo-600/10 border border-indigo-500/30 px-6 py-3 rounded-xl">
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Auth_Level: SYSTEM_ADMIN</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          {/* FORM COLUMN */}
          <div className="lg:col-span-4">
            <form onSubmit={handleSubmit} className="bg-[#0f1117] p-8 md:p-12 rounded-[2.5rem] border border-slate-800 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <Fingerprint size={200} />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-mono text-slate-500 uppercase ml-1 tracking-widest">Student_Registry_Number</label>
                <div className="relative group">
                  <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    required
                    name="studentRegNo"
                    value={formData.studentRegNo}
                    onChange={handleInputChange}
                    placeholder="SC/COM/XXXX/XX"
                    className="w-full bg-[#07090d] border border-slate-800 rounded-xl py-4 pl-14 pr-6 text-sm font-mono text-white placeholder:text-slate-700 outline-none focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-mono text-slate-500 uppercase ml-1 tracking-widest">Digital_Mail_Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ADMIN@INSTITUTION.DOMAIN"
                    className="w-full bg-[#07090d] border border-slate-800 rounded-xl py-4 pl-14 pr-6 text-sm font-mono text-white placeholder:text-slate-700 outline-none focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-mono text-slate-500 uppercase ml-1 tracking-widest">Privilege_Assignment</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <select 
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full bg-[#07090d] border border-slate-800 rounded-xl py-4 pl-14 pr-6 text-sm font-mono text-white outline-none focus:border-indigo-600 appearance-none transition-all cursor-pointer uppercase"
                  >
                    <option value="member" className="bg-[#07090d]">Member_Voter</option>
                    <option value="admin" className="bg-[#07090d]">System_Administrator</option>
                  </select>
                </div>
              </div>

              <button 
                disabled={isLoading}
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-xl shadow-indigo-600/10 disabled:opacity-30 disabled:grayscale"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>Commit_To_Database <Zap size={16} /></>
                )}
              </button>
            </form>
          </div>

          {/* SIDEBAR/INFO COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0f1117] border border-slate-800 p-8 rounded-[2rem]">
              <h4 className="font-black text-white uppercase tracking-widest text-xs mb-6 border-b border-slate-800 pb-4">Audit_Notes</h4>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
                  <p className="text-[10px] font-mono text-slate-500 leading-relaxed uppercase">Initial password defaults to the Registry ID provided.</p>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
                  <p className="text-[10px] font-mono text-slate-500 leading-relaxed uppercase">Profile completion is required upon first entry protocol.</p>
                </li>
              </ul>
            </div>

            <div className="bg-indigo-600/5 border border-indigo-500/20 p-8 rounded-[2rem] relative group">
               <Fingerprint className="absolute -bottom-4 -right-4 text-indigo-500/10 group-hover:scale-110 transition-transform duration-700" size={80} />
               <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">Encryption_Standard</p>
               <h4 className="font-black text-white uppercase tracking-tight text-sm">Identity_Secure</h4>
               <div className="mt-4 flex gap-1">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-1 w-4 bg-indigo-600/30 rounded-full" />)}
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountCreationPage;