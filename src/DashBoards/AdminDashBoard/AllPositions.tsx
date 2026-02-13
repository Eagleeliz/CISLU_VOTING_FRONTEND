import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useGetPositionsByElectionQuery,
  useCreatePositionMutation,
  useUpdatePositionMutation,
  useDeletePositionMutation,
} from "../../Features/Apis/Position.Api";
import { useGetAllElectionsQuery } from "../../Features/Apis/Election.Api";
import { 
  Plus, Edit3, Trash2, Search, X, Loader2, 
  Target, Shield, Settings2, RefreshCw, 
  AlertTriangle, Users, Trophy, Ghost,
  Terminal, Hash, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { RootState } from "../../app/store";


export const AllPositions = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  /* ================= DATA FETCHING ================= */
  const { data: electionsRaw, isLoading: electionsLoading } = useGetAllElectionsQuery();
  
  const elections = useMemo(() => {
    const data = electionsRaw?.elections || electionsRaw;
    return Array.isArray(data) ? data : [];
  }, [electionsRaw]);

  const [selectedElectionId, setSelectedElectionId] = useState<string>("");

  useEffect(() => {
    if (elections.length > 0 && !selectedElectionId) {
      setSelectedElectionId(elections[0].id);
    }
  }, [elections, selectedElectionId]);

  const { 
    data: positions, 
    isLoading: positionsLoading, 
    refetch, 
    isFetching 
  } = useGetPositionsByElectionQuery(selectedElectionId, {
    skip: !selectedElectionId,
  });

  const [createPosition, { isLoading: isCreating }] = useCreatePositionMutation();
  const [updatePosition, { isLoading: isUpdating }] = useUpdatePositionMutation();
  const [deletePosition] = useDeletePositionMutation();

  /* ================= UI STATE ================= */
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  /* ================= FORM STATE ================= */
  const [formData, setFormData] = useState({
    title: "",
    minParticipationPoints: 0,
    slotsAvailable: 1,
    targetYears: [] as string[]
  });

  /* ================= HANDLERS ================= */
  const handleOpenPanel = (pos: any = null) => {
    if (pos) {
      setEditingId(pos.id);
      setFormData({
        title: pos.title,
        minParticipationPoints: pos.minParticipationPoints || 0,
        slotsAvailable: pos.slotsAvailable || 1,
        targetYears: pos.targetYears || []
      });
    } else {
      setEditingId(null);
      setFormData({ 
        title: "", 
        minParticipationPoints: 0, 
        slotsAvailable: 1, 
        targetYears: ["1"] 
      });
    }
    setIsPanelOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      ...formData, 
      electionId: selectedElectionId,
      minParticipationPoints: Number(formData.minParticipationPoints),
      slotsAvailable: Number(formData.slotsAvailable)
    };

    try {
      if (editingId) {
        await updatePosition({ positionId: editingId, ...payload }).unwrap();
        toast.success("Mainframe record patched");
      } else {
        await createPosition(payload).unwrap();
        toast.success("New position node deployed");
      }
      setIsPanelOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("CRITICAL: Purge this record permanently?")) {
      try {
        await deletePosition(id).unwrap();
        toast.success("Record purged");
      } catch {
        toast.error("Purge sequence failed");
      }
    }
  };

  const toggleYear = (year: string) => {
    setFormData(prev => ({
      ...prev,
      targetYears: prev.targetYears.includes(year)
        ? prev.targetYears.filter(y => y !== year)
        : [...prev.targetYears, year]
    }));
  };

  /* ================= LOGIC ================= */
  const filteredPositions = useMemo(() => {
    const list = Array.isArray(positions) ? positions : [];
    return list.filter((p: any) => 
      p.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [positions, searchTerm]);

  if (electionsLoading || (positionsLoading && selectedElectionId)) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#07090d]">
      <Loader2 className="text-indigo-600 animate-spin mb-4" size={40} />
      <p className="text-[10px] font-mono text-indigo-500 uppercase tracking-[0.4em]">fetching_positions...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-300 p-4 lg:p-8 font-sans">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-1">
            Position<span className="text-indigo-600 font-light not-italic">_Registry</span>
          </h2>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase">
            <Shield size={12} className="text-indigo-600" />
            <span>Auth_Session: {user?.fullName || 'SYSTEM_ADMIN'}</span>
          </div>
        </div>
        <button 
          onClick={() => handleOpenPanel()}
          disabled={!selectedElectionId}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg shadow-indigo-600/20 active:scale-95 w-full md:w-auto justify-center"
        >
          <Plus size={16} /> Initialize_Position
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-slate-900/20 p-4 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
          <input 
            type="text" placeholder="SEARCH_TITLE..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-[11px] font-mono focus:border-indigo-600 outline-none transition-all text-white"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          value={selectedElectionId} 
          onChange={(e) => setSelectedElectionId(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[11px] font-mono focus:border-indigo-600 outline-none uppercase text-indigo-400 font-bold"
        >
          {elections.map((e: any) => (
            <option key={e.id} value={e.id}>TARGET_ELECTION: {e.title}</option>
          ))}
        </select>
        <button onClick={() => refetch()} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-xl py-3 text-[10px] font-black uppercase transition-all">
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Sync_Database
        </button>
      </div>

      {/* CARDS GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPositions.map((p: any) => (
          <div key={p.id} className="group relative bg-[#0f1117] border border-slate-800 rounded-[2rem] p-6 hover:border-indigo-600/40 transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-indigo-500/30 text-indigo-400 bg-indigo-500/5">
                ACTIVE_NODE
              </span>
              <span className="text-[10px] font-mono text-slate-700">NODE_{p.id?.substring(0, 6)}</span>
            </div>

            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4 line-clamp-1">{p.title}</h3>

            <div className="space-y-3 mb-8 border-t border-slate-800/50 pt-4">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <div className="flex items-center gap-2 text-slate-500">
                  <Users size={14} className="text-indigo-600" />
                  <span className="uppercase">Slots:</span>
                </div>
                <span className="text-white font-bold">{p.slotsAvailable}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <div className="flex items-center gap-2 text-slate-500">
                  <Trophy size={14} className="text-indigo-600" />
                  <span className="uppercase">Points_Req:</span>
                </div>
                <span className="text-emerald-500 font-bold">{p.minParticipationPoints}pt</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {p.targetYears.map((y: string) => (
                <span key={y} className="text-[8px] font-black bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20 uppercase">
                  YR_{y}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleOpenPanel(p)} className="flex-1 bg-slate-900 hover:bg-indigo-600 hover:text-white py-3 rounded-xl text-[9px] font-black uppercase transition-all">Patch</button>
              <button onClick={() => handleDelete(p.id)} className="px-4 bg-slate-900 hover:bg-rose-600 hover:text-white rounded-xl transition-all"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}

        {filteredPositions.length === 0 && !isFetching && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[3rem] text-slate-600">
            <Ghost size={48} className="mb-4 opacity-20" />
            <p className="text-[10px] font-mono uppercase tracking-widest italic">No_Positions_Linked_To_This_Node</p>
          </div>
        )}
      </div>

      {/* CREATE / EDIT SIDE PANEL */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#07090d] border-l border-slate-800 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
              <div>
                <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Position_Manifest</p>
                <h3 className="text-2xl font-black text-white uppercase italic">{editingId ? 'Edit_Node' : 'Create_Node'}</h3>
              </div>
              <button onClick={() => setIsPanelOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 flex-1 overflow-y-auto space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase ml-1">Position Title</label>
                <input 
                  required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-5 text-sm font-mono focus:border-indigo-600 outline-none text-white" 
                  placeholder="Enter Title..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase ml-1">Available_Slots</label>
                  <input 
                    required type="number" value={formData.slotsAvailable} onChange={(e) => setFormData({...formData, slotsAvailable: parseInt(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-5 text-xs font-mono focus:border-indigo-600 outline-none text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase ml-1">Required_Points</label>
                  <input 
                    required type="number" value={formData.minParticipationPoints} onChange={(e) => setFormData({...formData, minParticipationPoints: parseInt(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-5 text-xs font-mono focus:border-indigo-600 outline-none text-white" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase ml-1">Eligible Academic Years</label>
                <div className="grid grid-cols-4 gap-2">
                  {['1', '2', '3', '4'].map(y => (
                    <button 
                      key={y} type="button" onClick={() => toggleYear(y)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${formData.targetYears.includes(y) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                    >
                      YR_{y}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-indigo-600/5 border border-indigo-600/20 rounded-2xl flex gap-3 items-start">
                <AlertTriangle className="text-indigo-600 shrink-0" size={16} />
                <p className="text-[9px] text-slate-500 leading-relaxed font-mono uppercase">Warning: ensure the eligibility years align with faculty policies. changes will propagate to the voter ballot immediately.</p>
              </div>
            </form>

            <div className="p-8 border-t border-slate-800 bg-slate-900/20">
              <button 
                disabled={isCreating || isUpdating}
                onClick={handleSubmit}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all"
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