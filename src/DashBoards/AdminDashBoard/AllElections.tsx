import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useGetAllElectionsQuery,
  useCreateElectionMutation,
  useUpdateElectionMutation,
  useDeleteElectionMutation,
  useChangeElectionStatusMutation,
} from "../../Features/Apis/Election.Api";
import { 
  Plus, Edit3, Trash2, Search, X, Loader2, 
  Zap, CheckCircle2, Terminal, RefreshCw, 
  ChevronLeft, ChevronRight, Clock, AlertCircle,
  Calendar, Shield
} from 'lucide-react';
import toast from 'react-hot-toast'; // Using toast for better UI feedback
import type { RootState } from "../../app/store";


export const AllElections = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const { data: response, isLoading, error, refetch, isFetching } = useGetAllElectionsQuery();
  const [createElection, { isLoading: isCreating }] = useCreateElectionMutation();
  const [updateElection, { isLoading: isUpdating }] = useUpdateElectionMutation();
  const [deleteElection] = useDeleteElectionMutation();
  const [changeStatus] = useChangeElectionStatusMutation();

  // UI STATE
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // FORM STATE
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "upcoming"
  });

  /* ================= HANDLERS ================= */
  const handleOpenPanel = (election: any = null) => {
    if (election) {
      setEditingId(election.id);
      setFormData({
        title: election.title,
        description: election.description || "",
        startDate: new Date(election.startDate).toISOString().slice(0, 16),
        endDate: new Date(election.endDate).toISOString().slice(0, 16),
        status: election.status
      });
    } else {
      setEditingId(null);
      setFormData({ title: "", description: "", startDate: "", endDate: "", status: "upcoming" });
    }
    setIsPanelOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sync with your Backend JSON structure
    const payload = {
      title: formData.title,
      description: formData.description,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      status: formData.status as "upcoming" | "voting" | "completed" | "cancelled"
    };

    try {
      if (editingId) {
        await updateElection({ electionId: editingId, ...payload }).unwrap();
        toast.success("Mainframe record patched");
      } else {
        await createElection(payload).unwrap();
        toast.success("New election node deployed");
      }
      setIsPanelOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("CRITICAL: Purge this record permanently?")) {
      try {
        await deleteElection(id).unwrap();
        toast.success("Record purged");
      } catch {
        toast.error("Purge sequence failed");
      }
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    try {
      await changeStatus({ electionId: id, status: newStatus }).unwrap();
      toast.success(`Phase shifted to ${newStatus}`);
    } catch {
      toast.error("Status update failed");
    }
  };

  /* ================= LOGIC ================= */
  const { paginatedElections, totalPages } = useMemo(() => {
    const rawList = Array.isArray(response?.elections) ? response.elections : [];
    const filtered = rawList.filter((el: any) => {
      const matchesName = el.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? el.status === statusFilter : true;
      return matchesName && matchesStatus;
    });
    return {
      paginatedElections: filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  }, [response, searchTerm, statusFilter, currentPage]);

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#07090d]">
      <Loader2 className="text-red-600 animate-spin mb-4" size={40} />
      <p className="text-[10px] font-mono text-red-500 uppercase tracking-[0.4em]">fetching_elections...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-300 p-4 lg:p-8 font-sans">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-1">
            Election<span className="text-red-600 font-light not-italic">_Control</span>
          </h2>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase">
            <Shield size={12} className="text-red-600" />
            <span>Auth_Session: {user?.fullName || 'SYSTEM_ADMIN'}</span>
          </div>
        </div>
        <button 
          onClick={() => handleOpenPanel()}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg shadow-red-600/20 active:scale-95 w-full md:w-auto justify-center"
        >
          <Plus size={16} /> Initialize_Election
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-slate-900/20 p-4 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
          <input 
            type="text" placeholder="SEARCH_TITLE..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-[11px] font-mono focus:border-red-600 outline-none transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[11px] font-mono focus:border-red-600 outline-none uppercase"
        >
          <option value="">All_Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="voting">Voting</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={() => refetch()} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-xl py-3 text-[10px] font-black uppercase transition-all">
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Sync_Database
        </button>
      </div>

      {/* CARDS GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedElections.map((el: any) => (
          <div key={el.id} className="group relative bg-[#0f1117] border border-slate-800 rounded-[2rem] p-6 hover:border-red-600/40 transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                el.status === 'voting' ? 'border-red-600 text-red-500 bg-red-600/10 animate-pulse' :
                el.status === 'completed' ? 'border-emerald-600 text-emerald-500 bg-emerald-600/10' :
                'border-slate-700 text-slate-500'
              }`}>
                {el.status}
              </span>
              <span className="text-[10px] font-mono text-slate-700">NODE_{el.id?.substring(0, 6)}</span>
            </div>

            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 line-clamp-1">{el.title}</h3>
            <p className="text-[11px] text-slate-500 italic mb-6 line-clamp-2">"{el.description || 'No description provided for this manifest.'}"</p>

            <div className="space-y-2 mb-8 border-t border-slate-800/50 pt-4">
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <Calendar size={14} className="text-red-600" />
                <span className="text-slate-500 uppercase">Commence:</span>
                <span className="text-slate-300">{new Date(el.startDate).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <Clock size={14} className="text-red-600" />
                <span className="text-slate-500 uppercase">Terminate:</span>
                <span className="text-slate-300">{new Date(el.endDate).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleOpenPanel(el)} className="flex-1 bg-slate-900 hover:bg-red-600 hover:text-white py-3 rounded-xl text-[9px] font-black uppercase transition-all">Patch</button>
              <button onClick={() => handleDelete(el.id)} className="px-4 bg-slate-900 hover:bg-rose-600 hover:text-white rounded-xl transition-all"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT SIDE PANEL */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#07090d] border-l border-slate-800 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
              <div>
                <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Election_Manifest</p>
                <h3 className="text-2xl font-black text-white uppercase italic">{editingId ? 'Edit_Node' : 'Create_Node'}</h3>
              </div>
              <button onClick={() => setIsPanelOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 flex-1 overflow-y-auto space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase ml-1">Election Title</label>
                <input 
                  required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-5 text-sm font-mono focus:border-red-600 outline-none" 
                  placeholder="Enter Title..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase ml-1">Status Phase</label>
                <div className="grid grid-cols-2 gap-2">
                  {['upcoming', 'voting', 'completed', 'cancelled'].map(s => (
                    <button 
                      key={s} type="button" onClick={() => setFormData({...formData, status: s})}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${formData.status === s ? 'bg-red-600 border-red-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase ml-1">Description</label>
                <textarea 
                  rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-5 text-sm font-mono focus:border-red-600 outline-none resize-none" 
                  placeholder="Protocol objectives..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase ml-1">Start_Sequence</label>
                  <input 
                    required type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-5 text-xs font-mono focus:border-red-600 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase ml-1">End_Sequence</label>
                  <input 
                    required type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-5 text-xs font-mono focus:border-red-600 outline-none" 
                  />
                </div>
              </div>

              <div className="p-4 bg-red-600/5 border border-red-600/20 rounded-2xl flex gap-3 items-start">
                <AlertCircle className="text-red-600 shrink-0" size={16} />
                <p className="text-[9px] text-slate-500 leading-relaxed font-mono uppercase">Warning: Changing the status phase will immediately affect all authenticated voters. verify sequences before execution.</p>
              </div>
            </form>

            <div className="p-8 border-t border-slate-800 bg-slate-900/20">
              <button 
                disabled={isCreating || isUpdating}
                onClick={handleSubmit}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 flex items-center justify-center gap-3 transition-all"
              >
                {isCreating || isUpdating ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                {editingId ? 'Execute_Patch' : 'Execute_Deployment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};