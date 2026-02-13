import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useGetCandidatesByElectionQuery,
  usePromoteApplicationMutation,
  useDisqualifyCandidateMutation,
} from "../../Features/Apis/Candidate.Api"; 
import { useGetAllElectionsQuery } from "../../Features/Apis/Election.Api";
import { 
  UserPlus, Trash2, Search, X, Loader2, 
  ShieldAlert, RefreshCw, ChevronLeft, 
  ChevronRight, UserCheck, Shield,
  Award, FileText, MapPin, Zap, Flame, Terminal
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { RootState } from "../../app/store";

export const AllCandidates = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // UI State
  const [selectedElectionId, setSelectedElectionId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDisqualifyModalOpen, setIsDisqualifyModalOpen] = useState(false);
  const [targetCandidate, setTargetCandidate] = useState<{id: string, name: string} | null>(null);
  const [dqReason, setDqReason] = useState("");
  const [activeTab, setActiveTab] = useState<'approved_apps' | 'final_ballot'>('approved_apps');

  // API Queries
  const { data: electionsRes } = useGetAllElectionsQuery();
  
  // Important: Ensure we handle the case where the API returns an object or an array
  const { 
    data: candidatesRes, 
    isLoading, 
    refetch, 
    isFetching 
  } = useGetCandidatesByElectionQuery(selectedElectionId, { 
    skip: !selectedElectionId,
    refetchOnMountOrArgChange: true 
  });

  const [promoteCandidate, { isLoading: isPromoting }] = usePromoteApplicationMutation();
  const [disqualifyCandidate, { isLoading: isDisqualifying }] = useDisqualifyCandidateMutation();

  /* ================= HANDLERS ================= */
  const handlePromote = async (appId: string, name: string) => {
    try {
      await promoteCandidate(appId).unwrap();
      toast.success(`${name}_PROMOTED_TO_OFFICIAL_BALLOT`);
      refetch();
    } catch (err: any) {
      toast.error(err.data?.message || "Promotion sequence failed");
    }
  };

  const handleDisqualify = async () => {
    if (!targetCandidate || !dqReason) return;
    try {
      await disqualifyCandidate({ 
        candidateId: targetCandidate.id, 
        reason: dqReason 
      }).unwrap();
      toast.success(`CANDIDATE_${targetCandidate.name}_STRUCK_FROM_BALLOT`);
      setIsDisqualifyModalOpen(false);
      setDqReason("");
      refetch();
    } catch (err: any) {
      toast.error(err.data?.error || "Disqualification sequence failed");
    }
  };

  /* ================= LOGIC ================= */
  const { promotionQueue, officialBallot } = useMemo(() => {
    // Check various common API response structures (Array, or Object with nested array)
    const list = Array.isArray(candidatesRes) ? candidatesRes : candidatesRes?.candidates || [];
    
    return {
      // Logic Fix: If it's not on the ballot yet, it's in the queue
      promotionQueue: list.filter(c => !c.ballotNumber),
      // Logic Fix: If it has a ballot number, it is officially a candidate
      officialBallot: list.filter(c => c.ballotNumber !== null && c.ballotNumber !== undefined)
    };
  }, [candidatesRes]);

  const displayedList = activeTab === 'approved_apps' ? promotionQueue : officialBallot;

  const filteredData = displayedList.filter(c => {
    const name = c.fullName || c.userId || "";
    const reg = c.studentRegNo || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           reg.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-300 p-4 lg:p-8 font-sans">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-1">
            Control<span className="text-red-600 font-light not-italic">_Center</span>
          </h2>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase">
            <Shield size={12} className="text-red-600" />
            <span>Auth_Level: {user?.role || 'SYSTEM_ADMIN'}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 w-full md:w-64">
           <label className="text-[10px] font-mono text-slate-500 uppercase ml-1">Election_Node</label>
           <select 
            value={selectedElectionId} 
            onChange={(e) => setSelectedElectionId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[11px] font-mono text-white outline-none focus:border-red-600 transition-all"
           >
             <option value="">-- SELECT_NODE --</option>
             {electionsRes?.elections?.map((el: any) => (
               <option key={el.id} value={el.id}>{el.title}</option>
             ))}
           </select>
        </div>
      </div>

      {/* TAB SWITCHER */}
      <div className="max-w-7xl mx-auto flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('approved_apps')}
          className={`flex-1 md:flex-none px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'approved_apps' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`}
        >
          Promotion_Queue ({promotionQueue.length})
        </button>
        <button 
          onClick={() => setActiveTab('final_ballot')}
          className={`flex-1 md:flex-none px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'final_ballot' ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`}
        >
          Official_Ballot ({officialBallot.length})
        </button>
      </div>

      {/* SEARCH & REFRESH */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
          <input 
            type="text" placeholder="FILTER_RECORDS..." 
            className="w-full bg-slate-900/40 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-[11px] font-mono focus:border-red-600 outline-none transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => refetch()} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 px-6 rounded-xl py-3 text-[10px] font-black uppercase transition-all">
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Sync
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      {!selectedElectionId ? (
        <div className="max-w-7xl mx-auto border-2 border-dashed border-slate-800 rounded-[3rem] py-24 flex flex-col items-center opacity-40">
           <MapPin size={48} className="mb-4 text-slate-600" />
           <p className="font-mono text-[10px] uppercase tracking-[0.5em]">awaiting_node_selection...</p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col justify-center items-center py-24">
          <Loader2 className="text-red-600 animate-spin mb-4" size={40} />
          <p className="text-[10px] font-mono text-red-500 uppercase tracking-[0.4em]">scanning_registry...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="max-w-7xl mx-auto border border-slate-800 rounded-[3rem] py-24 flex flex-col items-center">
           <Terminal size={40} className="mb-4 text-slate-800" />
           <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-600">No_Data_Found_In_This_Sector</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((node) => (
            <div key={node.id} className="group relative bg-[#0f1117] border border-slate-800 rounded-[2rem] overflow-hidden hover:border-slate-600 transition-all duration-500">
              
              <div className={`h-1.5 bg-gradient-to-r ${activeTab === 'approved_apps' ? 'from-indigo-600 to-blue-500' : 'from-red-600 to-rose-500'}`} />

              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden shadow-xl">
                    <img src={node.profileImage || node.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${node.id}`} className="w-full h-full object-cover" alt="" />
                  </div>
                  {node.ballotNumber && (
                    <div className="text-right">
                        <span className="block text-[8px] font-mono text-slate-500 uppercase">Rank</span>
                        <span className="text-lg font-black text-white">#{node.ballotNumber}</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-black text-white uppercase truncate">{node.fullName || node.userId}</h3>
                <p className="text-[9px] font-mono text-red-500 mb-6 uppercase tracking-widest">{node.studentRegNo || "PENDING_REG"}</p>

                <div className="bg-black/40 p-4 rounded-xl border border-slate-800/50 mb-6 h-20 overflow-hidden">
                  <p className="text-[10px] text-slate-400 italic line-clamp-2">"{node.statementOfIntent || node.manifesto || "No manifesto recorded."}"</p>
                </div>

                {activeTab === 'approved_apps' ? (
                  <button 
                    onClick={() => handlePromote(node.id, node.fullName || node.userId)}
                    disabled={isPromoting}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2"
                  >
                    {isPromoting ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
                    Execute_Promotion
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setTargetCandidate({id: node.id, name: node.fullName || node.userId});
                      setIsDisqualifyModalOpen(true);
                    }}
                    className="w-full bg-rose-950/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-900/30 py-4 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldAlert size={14} /> Disqualify
                  </button>
                )}
              </div>

              {node.isDisqualified && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 text-center z-10">
                   <div>
                      <Flame size={40} className="text-red-600 mx-auto mb-4 animate-pulse" />
                      <h4 className="text-white font-black uppercase tracking-[0.2em]">TERMINATED</h4>
                      <p className="text-[8px] font-mono text-red-500 mt-2 uppercase">{node.disqualificationReason || "Administrative Strike"}</p>
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* DISQUALIFY MODAL */}
      {isDisqualifyModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsDisqualifyModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0f1117] border border-slate-800 rounded-[2.5rem] p-8 animate-in zoom-in duration-300">
            <div className="text-center mb-8">
               <ShieldAlert size={48} className="text-red-600 mx-auto mb-4" />
               <h3 className="text-2xl font-black text-white uppercase italic">Striking_Sequence</h3>
               <p className="text-[10px] font-mono text-slate-500 uppercase mt-2">Target: {targetCandidate?.name}</p>
            </div>
            <textarea 
                value={dqReason}
                onChange={(e) => setDqReason(e.target.value)}
                placeholder="REGULATORY_REASON_FOR_REMOVAL..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-[10px] font-mono text-white focus:border-red-600 outline-none h-32"
            />
            <div className="mt-8 flex gap-3">
               <button onClick={() => setIsDisqualifyModalOpen(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-600">Abort</button>
               <button 
                onClick={handleDisqualify}
                disabled={isDisqualifying || !dqReason}
                className="flex-[2] bg-red-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase disabled:opacity-50"
               >
                 {isDisqualifying ? "STRIKING..." : "Confirm_Strike"}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};