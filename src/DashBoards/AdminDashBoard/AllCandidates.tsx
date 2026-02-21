import  { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  useGetCandidatesByElectionQuery,
  useDisqualifyCandidateMutation,
} from "../../Features/Apis/Candidate.Api"; 
import { useGetAllElectionsQuery } from "../../Features/Apis/Election.Api";
import { 
  Search, Loader2, 
  ShieldAlert, RefreshCw, Shield,
 Flame, Terminal, MapPin, 
  Hash, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { RootState } from "../../app/store";

export const AllCandidates = () => {
  useSelector((state: RootState) => state.auth);
  
  // UI State
  const [selectedElectionId, setSelectedElectionId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDisqualifyModalOpen, setIsDisqualifyModalOpen] = useState(false);
  const [targetCandidate, setTargetCandidate] = useState<{id: string, name: string} | null>(null);
  const [dqReason, setDqReason] = useState("");

  // API Queries
  const { data: electionsRes } = useGetAllElectionsQuery();
  
  // Fetch candidates for the selected election
  const { 
    data: candidatesRes, 
    isLoading, 
    refetch, 
    isFetching 
  } = useGetCandidatesByElectionQuery(selectedElectionId, { 
    skip: !selectedElectionId,
  });

  const [disqualifyCandidate, { isLoading: isDisqualifying }] = useDisqualifyCandidateMutation();

  /* ================= HANDLERS ================= */
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
    } catch (err: any) {
      toast.error(err.data?.error || "Disqualification failed");
    }
  };

  /* ================= LOGIC ================= */
  const officialBallot = useMemo(() => {
    // Robust check: handles { candidates: [] } or just []
    if (!candidatesRes) return [];
    return Array.isArray(candidatesRes) ? candidatesRes : (candidatesRes.candidates || []);
  }, [candidatesRes]);

  const filteredData = useMemo(() => {
    return officialBallot.filter(c => {
      const name = c.fullName || "";
      const reg = c.studentRegNo || "";
      return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             reg.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [officialBallot, searchTerm]);

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-300 p-4 lg:p-8 font-sans">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-1">
            Registry<span className="text-red-600 font-light not-italic">_Admin</span>
          </h2>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase">
            <Shield size={12} className="text-red-600" />
            <span>Node_Status: ONLINE</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 w-full md:w-80">
           <label className="text-[10px] font-mono text-slate-500 uppercase ml-1 flex items-center gap-2">
             <Hash size={10} /> Active_Election_Sync
           </label>
           <select 
            value={selectedElectionId} 
            onChange={(e) => setSelectedElectionId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-[11px] font-mono text-white outline-none focus:border-red-600 transition-all cursor-pointer"
           >
             <option value="">-- ATTACH_TO_ELECTION_NODE --</option>
             {electionsRes?.elections?.map((el: any) => (
               <option key={el.id} value={el.id}>{el.title}</option>
             ))}
           </select>
        </div>
      </div>

      {/* STATS */}
      <div className="max-w-7xl mx-auto mb-8 flex gap-4">
        <div className="bg-slate-900/40 border border-slate-800 px-6 py-4 rounded-2xl flex items-center gap-4">
           <div className="p-2 bg-indigo-600/20 rounded-lg">
              <UserCheck size={20} className="text-indigo-500" />
           </div>
           <div>
              <p className="text-[9px] font-mono text-slate-500 uppercase">Verified_Aspirants</p>
              <p className="text-xl font-black text-white">{officialBallot.length}</p>
           </div>
        </div>
      </div>

      {/* FILTERING */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
          <input 
            type="text" placeholder="QUERY_BY_NAME_OR_REGISTRATION..." 
            className="w-full bg-slate-900/40 border border-slate-800 rounded-xl py-4 pl-10 pr-4 text-[11px] font-mono focus:border-red-600 outline-none transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => refetch()} className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-8 rounded-xl py-4 text-[10px] font-black uppercase transition-all">
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Refresh_Stream
        </button>
      </div>

      {/* MAIN CONTENT */}
      {!selectedElectionId ? (
        <div className="max-w-7xl mx-auto border-2 border-dashed border-slate-800/50 rounded-[3rem] py-32 flex flex-col items-center opacity-40">
           <MapPin size={48} className="mb-4 text-slate-600" />
           <p className="font-mono text-[10px] uppercase tracking-[0.5em]">awaiting_node_attachment...</p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col justify-center items-center py-32">
          <Loader2 className="text-red-600 animate-spin mb-4" size={50} />
          <p className="text-[10px] font-mono text-red-500 uppercase tracking-[0.4em]">decrypting_registry...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="max-w-7xl mx-auto border border-slate-800 rounded-[3rem] py-32 flex flex-col items-center bg-slate-900/10">
           <Terminal size={40} className="mb-4 text-slate-800" />
           <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-600">NULL_RECORDS: NO_CANDIDATES_IN_NODE</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((node) => (
            <div key={node.id} className="group relative bg-[#0f1117] border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-slate-500 transition-all duration-500 shadow-2xl">
              <div className="h-1 bg-indigo-600" />
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-slate-800 border-2 border-slate-700 overflow-hidden shadow-2xl">
                      <img src={node.profileImage || `https://api.dicebear.com/7.x/identicon/svg?seed=${node.id}`} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                      <span className="text-[10px] font-black text-indigo-500 uppercase">Ballot #{node.ballotNumber}</span>
                    </div>
                </div>
                
                <h3 className="text-xl font-black text-white uppercase truncate">{node.fullName}</h3>
                <p className="text-[10px] font-mono text-slate-500 mb-6 uppercase">{node.studentRegNo}</p>

                <div className="bg-black/30 p-5 rounded-2xl border border-slate-800/50 mb-8 min-h-[100px]">
                  <p className="text-[11px] text-slate-400 italic line-clamp-3 leading-relaxed">
                    "{node.manifesto || "No manifesto recorded."}"
                  </p>
                </div>

                <button 
                    onClick={() => {
                      setTargetCandidate({id: node.id, name: node.fullName});
                      setIsDisqualifyModalOpen(true);
                    }}
                    className="w-full bg-slate-900 hover:bg-red-600 text-red-500 hover:text-white border border-red-900/30 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                >
                    <ShieldAlert size={14} /> Disqualify_Node
                </button>
              </div>

              {node.isDisqualified && (
                <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-8 text-center z-20">
                   <div>
                      <Flame size={50} className="text-red-600 mx-auto animate-pulse mb-4" />
                      <h4 className="text-white font-black uppercase tracking-[0.4em] text-lg">TERMINATED</h4>
                      <p className="text-[9px] font-mono text-red-500 uppercase mt-4">{node.disqualificationReason}</p>
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
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsDisqualifyModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0f1117] border border-slate-800 rounded-[3rem] p-10">
            <h3 className="text-2xl font-black text-white uppercase italic text-center mb-6">Striking_Sequence</h3>
            <textarea 
                value={dqReason}
                onChange={(e) => setDqReason(e.target.value)}
                placeholder="REASON_FOR_REMOVAL..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-[11px] font-mono text-white focus:border-red-600 outline-none h-40"
            />
            <div className="mt-8 flex flex-col gap-3">
               <button onClick={handleDisqualify} className="w-full bg-red-600 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]">
                 {isDisqualifying ? "EXECUTING..." : "Confirm_Strike"}
               </button>
               <button onClick={() => setIsDisqualifyModalOpen(false)} className="w-full py-4 text-[10px] font-black uppercase text-slate-600">Abort</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};