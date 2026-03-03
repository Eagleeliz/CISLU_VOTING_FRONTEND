// DashBoards/UserDashboard/ApplicationPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Navbar from "../../components/Navbar";
import { 
  useGetMyApplicationsQuery, 
  useCreateApplicationMutation, 
  useUpdateMyApplicationMutation,
  useWithdrawApplicationMutation
} from "../../Features/Apis/ApplicationApi";
import { useGetAllElectionsQuery } from "../../Features/Apis/Election.Api";
import { 
  Upload, ShieldCheck, Zap, Loader2, 
  X, Fingerprint, AlertTriangle, Trash2, Cpu
} from 'lucide-react';

const ApplicationPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { id, action } = params;
  
  const cloud_name = 'dwibg4vvf';
  const preset_key = 'tickets';

  /* ================= NEW MODAL STATE ================= */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appToWithdraw, setAppToWithdraw] = useState<string | null>(null);

  const user = useMemo(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [selectedElection, setSelectedElection] = useState<string>("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [manifesto, setManifesto] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const { data: electionsRaw } = useGetAllElectionsQuery();
  const { data: myApplications = [], isLoading: loadingList, refetch } = useGetMyApplicationsQuery();
  const [createApplication, { isLoading: isSubmitting }] = useCreateApplicationMutation();
  const [updateApplication, { isLoading: isUpdating }] = useUpdateMyApplicationMutation();
  const [withdrawApplication, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();

  const elections = useMemo(() => {
    const data = electionsRaw?.elections || electionsRaw;
    return Array.isArray(data) ? data : [];
  }, [electionsRaw]);

  const selectedPositionData = useMemo(() => {
    return positions.find(p => p.id === position);
  }, [position, positions]);

  useEffect(() => {
    const fetchPositions = async () => {
      // Clear positions if no election is selected
      if (!selectedElection) {
        setPositions([]);
        return;
      }
      try {
        // UPDATED: Pointing to the live Render backend instead of localhost
        const response = await fetch(`https://cislu-voting-app-backend.onrender.com/api/positions/election/${selectedElection}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        setPositions(data.positions || data || []);
      } catch (error) {
        toast.error("NODE_POSITION_FETCH_FAILURE");
      }
    };
    fetchPositions();
  }, [selectedElection]);

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#07090d]">
        <AlertTriangle className="text-rose-600 mb-4" size={40} />
        <p className="text-[10px] font-mono text-rose-500 uppercase tracking-[0.4em]">Unauthorized: No_Session_Found</p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateMedia = async (): Promise<string | null> => {
    if (!selectedFile) return null;
    setIsUploadingMedia(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('upload_preset', preset_key);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      toast.error("MEDIA_UPLINK_CRITICAL_FAILURE");
      return null;
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = selectedPositionData?.requiredPoints || 0;
    const userPoints = user.participationPoints || 0;
    if (userPoints < required) {
      toast.error(`SCRUTINY_REJECTION: ${required}pt Required | Current: ${userPoints}pt`);
      return;
    }
    let finalImageUrl = previewUrl;
    if (selectedFile) {
      const uploadedUrl = await handleCreateMedia();
      if (!uploadedUrl) return;
      finalImageUrl = uploadedUrl;
    }
    if (!finalImageUrl) {
      toast.error("OFFICIAL_PHOTO_REQUIRED");
      return;
    }
    try {
      const payload = {
        userId: user.id,
        electionId: selectedElection,
        positionId: position,
        statementOfIntent: description,
        manifesto: manifesto,
        imageUrl: finalImageUrl,
        requiredPoints: required
      };
      if (action === 'edit' && id) {
        await updateApplication({ id, updates: payload }).unwrap();
        toast.success("CANDIDACY_MODIFIED");
      } else {
        await createApplication(payload).unwrap();
        toast.success("CANDIDACY_RECORDED_SUCCESSFULLY");
      }
      setShowForm(false);
      refetch();
      navigate('/dashboard/applications');
    } catch (err: any) {
      toast.error(err.data?.message || "TRANSACTION_FAILURE");
    }
  };

  /* ================= MODAL HANDLERS ================= */
  const triggerWithdrawModal = (appId: string) => {
    setAppToWithdraw(appId);
    setIsModalOpen(true);
  };

  const confirmWithdraw = async () => {
    if (!appToWithdraw) return;
    try {
      await withdrawApplication(appToWithdraw).unwrap();
      toast.success("CANDIDACY_TERMINATED");
      refetch();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || "TERMINATION_FAILURE");
    }
  };

  if (loadingList) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#07090d]">
      <Loader2 className="text-indigo-600 animate-spin mb-4" size={40} />
      <p className="text-[10px] font-mono text-indigo-500 uppercase tracking-[0.4em]">authenticating_scrutiny_portal...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-300 font-sans">
      <Navbar />
      
      {/* ================= TERMINATION MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#0f1117] border border-rose-500/30 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl shadow-rose-500/10 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="bg-rose-500/10 p-5 rounded-full">
                <AlertTriangle className="text-rose-500" size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-white text-2xl font-black uppercase tracking-tighter">System_Purge_Required</h2>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-relaxed">
                  CRITICAL: Terminate candidacy protocol? This action is irreversible and will wipe your entry from the election node.
                </p>
              </div>
              <div className="flex gap-4 w-full pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmWithdraw}
                  disabled={isWithdrawing}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isWithdrawing ? <Loader2 className="animate-spin" size={14} /> : "Terminate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800 pb-8 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
              Candidacy<span className="text-indigo-600 font-light not-italic">_Forge</span>
            </h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase mt-2">
              Operator: {user.fullName} | Balance: {user.participationPoints || 0}pt
            </p>
          </div>
          {!showForm && !action && (
            <button 
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl shadow-indigo-600/20"
            >
              <Zap size={14} /> Initiate_Application
            </button>
          )}
        </div>

        {showForm || action === 'edit' ? (
          <form onSubmit={handleSubmit} className="bg-[#0f1117] border border-slate-800 rounded-[3rem] p-8 md:p-14 space-y-10 animate-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-indigo-500 font-black uppercase tracking-widest ml-1">Election_Context</label>
                  <select 
                    value={selectedElection} 
                    onChange={(e) => setSelectedElection(e.target.value)}
                    className="w-full bg-[#07090d] border border-slate-800 rounded-2xl py-5 px-6 text-sm font-mono text-white outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="">-- Select Active Node --</option>
                    {elections.map((elec: any) => (
                      <option key={elec.id} value={elec.id}>{elec.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-indigo-500 font-black uppercase tracking-widest ml-1">Desired_Position</label>
                  <select 
                    value={position} 
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-[#07090d] border border-slate-800 rounded-2xl py-5 px-6 text-sm font-mono text-white outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="">-- Select Office --</option>
                    {positions.map((pos: any) => (
                      <option key={pos.id} value={pos.id}>{pos.title} | Req: {pos.requiredPoints}pt</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-mono text-indigo-500 font-black uppercase tracking-widest ml-1">Biometric_Identity_Photo</label>
                <div className="relative group h-52">
                  {previewUrl ? (
                    <div className="h-full w-full rounded-[2rem] overflow-hidden border-2 border-indigo-600 shadow-2xl shadow-indigo-600/10 relative">
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                      {isUploadingMedia && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                          <Loader2 className="text-indigo-500 animate-spin mb-2" size={32} />
                          <span className="text-[8px] font-mono text-indigo-400 uppercase tracking-widest">Uplinking_Media...</span>
                        </div>
                      )}
                      <button 
                        type="button" 
                        onClick={() => {setPreviewUrl(null); setSelectedFile(null);}}
                        className="absolute top-4 right-4 bg-black/80 p-2 rounded-xl text-white hover:bg-rose-600 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <label className="h-full w-full border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-600 hover:bg-indigo-600/5 transition-all group">
                      <div className="bg-slate-900 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="text-indigo-500" size={28} />
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Select_Official_Portrait</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-indigo-500 font-black uppercase tracking-widest ml-1">Statement_of_Intent</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#07090d] border border-slate-800 rounded-2xl py-5 px-6 text-sm font-mono text-white min-h-[120px] outline-none focus:border-indigo-600 transition-all resize-none"
                  placeholder="Define your primary objectives..."
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-indigo-500 font-black uppercase tracking-widest ml-1">Detailed_Manifesto_Protocol</label>
                <textarea 
                  value={manifesto}
                  onChange={(e) => setManifesto(e.target.value)}
                  className="w-full bg-[#07090d] border border-slate-800 rounded-2xl py-5 px-6 text-sm font-mono text-white min-h-[250px] outline-none focus:border-indigo-600 transition-all resize-none"
                  placeholder="Deploy your complete campaign strategy..."
                  required
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 pt-6">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-800 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all">
                Abort_Transaction
              </button>
              <button type="submit" disabled={isSubmitting || isUpdating || isUploadingMedia} className="flex-[2] bg-indigo-600 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-4 hover:bg-indigo-700 transition-all disabled:opacity-40">
                {isUploadingMedia ? <Cpu className="animate-pulse" size={18} /> : isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                {isUploadingMedia ? "Syncing_Node..." : "Execute_Forge_Entry"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 gap-8">
             {myApplications.length > 0 ? (
               myApplications.map((app: any) => (
                 <div key={app.id} className="group relative bg-[#0f1117] border border-slate-800 rounded-[3rem] p-8 md:p-10 flex flex-col lg:flex-row gap-10 items-center">
                    <div className="w-40 h-40 rounded-[2rem] overflow-hidden border border-slate-800 shrink-0 relative shadow-2xl">
                      <img src={app.imageUrl} className="w-full h-full object-cover" alt="Candidacy" />
                      <div className="absolute inset-0 bg-indigo-600/10 mix-blend-overlay" />
                    </div>
                    <div className="flex-1 space-y-4 text-center lg:text-left">
                       <div className="flex flex-wrap gap-3 justify-center lg:justify-start items-center">
                         <h3 className="text-white font-black text-2xl uppercase tracking-tighter italic">{app.position?.title}</h3>
                         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest ${
                           app.status === 'approved' ? 'border-emerald-600 text-emerald-500' : 
                           app.status === 'rejected' ? 'border-rose-600 text-rose-500' : 
                           'border-indigo-600 text-indigo-500'
                         }`}>
                           {app.status}
                         </span>
                       </div>
                       <p className="text-slate-500 font-mono text-[11px] leading-relaxed line-clamp-3 italic">"{app.statementOfIntent}"</p>
                    </div>
                    
                    <button 
                      onClick={() => triggerWithdrawModal(app.id)}
                      className="group/btn bg-rose-600/5 border border-rose-600/20 text-rose-600 p-6 rounded-3xl hover:bg-rose-600 hover:text-white transition-all duration-300 flex flex-col items-center gap-2"
                    >
                      <Trash2 size={24} className="group-hover/btn:scale-110 transition-transform" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">Terminate</span>
                    </button>
                 </div>
               ))
             ) : (
               <div className="text-center py-32 bg-[#0f1117]/50 rounded-[4rem] border border-dashed border-slate-800">
                  <Fingerprint className="text-slate-700 mx-auto mb-6 opacity-20" size={60} />
                  <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.5em]">No_Manifesto_Detected</p>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationPage;