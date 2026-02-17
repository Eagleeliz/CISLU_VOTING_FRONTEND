// DashBoards/UserDashboard/VotingPage.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Fingerprint, 
  Loader2,
  LayoutGrid,
  ChevronDown,
  User,
  CalendarDays,
  X,
  FileText,
  ShieldAlert,
  Search,
  ArrowRight
} from "lucide-react";

// API Imports
import { 
  useGetVotingProgressQuery, 
  useSubmitBulkBallotMutation, 
  useCastVoteMutation 
} from "../Features/Apis/Vote.Api";
import { useGetAllElectionsQuery, useGetElectionByIdQuery } from "../Features/Apis/Election.Api"; 
import { useGetCandidatesByElectionQuery } from "../Features/Apis/Candidate.Api";
import { useGetPositionsByElectionQuery } from "../Features/Apis/Position.Api"; 
import Navbar from "../components/Navbar";

// --- CUSTOM MODAL COMPONENT ---
const StatusModal = ({ isOpen, type, message, onClose, receipt }: any) => {
  if (!isOpen) return null;
  const isError = type === "error";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
        <div className="flex flex-col items-center text-center relative z-10">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {isError ? <ShieldAlert size={40} /> : <CheckCircle2 size={40} />}
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
            {isError ? "Registry Error" : "Submission Success"}
          </h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 px-2">
            {message}
          </p>
          {!isError && receipt && (
            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8 flex items-center gap-3">
              <FileText className="text-slate-400" size={18} />
              <div className="text-left overflow-hidden">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Ballot Receipt</p>
                <p className="text-[10px] font-mono font-bold text-slate-600 truncate">{receipt}</p>
              </div>
            </div>
          )}
          <button onClick={onClose} className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isError ? 'bg-slate-900 text-white hover:bg-red-600' : 'bg-green-600 text-white hover:bg-slate-900'}`}>
            {isError ? "Acknowledge" : "Return to Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
};

const VotingPage = () => {
  const navigate = useNavigate();
  const [selectedElectionId, setSelectedElectionId] = useState<string>("");
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [modal, setModal] = useState({ isOpen: false, type: "success", message: "", receipt: "" });

  const { data: allElectionsRes, isLoading: isLoadingList } = useGetAllElectionsQuery();
  
  const activeElections = useMemo(() => {
    return allElectionsRes?.elections?.filter(e => e.status === "voting" || e.status === "upcoming") || [];
  }, [allElectionsRes]);

  useEffect(() => {
    if (activeElections.length > 0 && !selectedElectionId) {
      const firstId = activeElections[0].id || (activeElections[0] as any)._id;
      setSelectedElectionId(firstId);
    }
  }, [activeElections, selectedElectionId]);

  const { data: positions, isLoading: isLoadingPositions } = useGetPositionsByElectionQuery(selectedElectionId, { skip: !selectedElectionId });
  const { data: electionData, isLoading: isLoadingDetails } = useGetElectionByIdQuery(selectedElectionId, { skip: !selectedElectionId });
  const { data: candidatesRes, isLoading: isLoadingCandidates } = useGetCandidatesByElectionQuery(selectedElectionId, { skip: !selectedElectionId });
  
  const { data: progress, isLoading: isLoadingProgress, refetch: refetchProgress } = useGetVotingProgressQuery(selectedElectionId, { 
    skip: !selectedElectionId,
    refetchOnMountOrArgChange: true 
  });

  const [submitBulk, { isLoading: isBulkSubmitting }] = useSubmitBulkBallotMutation();
  const [castSingle, { isLoading: isSingleSubmitting }] = useCastVoteMutation();
  const isSubmitting = isBulkSubmitting || isSingleSubmitting;

  const election = electionData?.election;
  const votedArray = useMemo(() => {
    return Array.isArray(progress) ? progress : (progress as any)?.votedPositionIds || [];
  }, [progress]);

  const candidatesByPosition = useMemo(() => {
    const list = Array.isArray(candidatesRes) ? candidatesRes : candidatesRes?.candidates || [];
    return list.reduce((acc: any, cand: any) => {
      const pId = cand.positionId?.id || cand.positionId?._id || cand.positionId;
      if (!acc[pId]) acc[pId] = [];
      acc[pId].push(cand);
      return acc;
    }, {});
  }, [candidatesRes]);

  const handleSelect = (posId: string, candId: string) => {
    if (votedArray.includes(posId)) return;
    setSelections(prev => ({ ...prev, [posId]: candId }));
  };

  const handleSearchChange = (posId: string, query: string) => {
    setSearchQueries(prev => ({ ...prev, [posId]: query }));
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
    setSelections({});
    refetchProgress();
  };

  const handleSubmit = async () => {
    const newSelections = Object.entries(selections).filter(([posId]) => !votedArray.includes(posId));
    if (newSelections.length === 0) return;

    try {
      let response;
      if (newSelections.length === 1) {
        const [positionId, candidateId] = newSelections[0];
        response = await castSingle({ electionId: selectedElectionId, positionId, candidateId }).unwrap();
      } else {
        const selectionsArray = newSelections.map(([posId, candId]) => ({ positionId: posId, candidateId: candId }));
        response = await submitBulk({ electionId: selectedElectionId, selections: selectionsArray }).unwrap();
      }
      
      setModal({
        isOpen: true,
        type: "success",
        message: "Ballot subset processed. Your votes for the selected positions have been secured.",
        receipt: response.verificationReceipt || response.receipts?.[0] || "TXN-SECURE"
      });
    } catch (err: any) {
      setModal({
        isOpen: true,
        type: "error",
        message: err.data?.error || "Submission rejected by registry.",
        receipt: ""
      });
    }
  };

  const availablePositionsCount = useMemo(() => {
    if (!positions) return 0;
    return positions.filter((p: any) => !votedArray.includes(p.id || p._id)).length;
  }, [positions, votedArray]);

  if (isLoadingList || (selectedElectionId && (isLoadingPositions || isLoadingCandidates || isLoadingProgress || isLoadingDetails))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBFBFE]">
        <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Encrypted Registry...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFE] pb-24 pt-24">
      <Navbar />
      <StatusModal {...modal} onClose={closeModal} />
      
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg text-white"><LayoutGrid size={18} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Polling Station</p>
              <h2 className="font-bold text-slate-900">Active Ballot Session</h2>
            </div>
          </div>
          <select value={selectedElectionId} onChange={(e) => { setSelectedElectionId(e.target.value); setSelections({}); }} className="bg-slate-50 border-2 border-slate-100 text-slate-900 text-sm font-bold rounded-2xl p-4 outline-none focus:border-red-600 transition-all">
            {activeElections.map((e: any) => (<option key={e.id || e._id} value={e.id || e._id}>{e.title}</option>))}
          </select>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6">
        {election && (
          <>
            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl mb-16">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Fingerprint size={120} /></div>
              <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2">{election.title}</h1>
                <div className="flex items-center gap-4 mt-4">
                  <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                    <p className="text-[8px] font-black uppercase text-slate-400">Voted Positions</p>
                    <p className="text-sm font-black">{votedArray.length} / {positions?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-32">
              {positions?.map((pos: any) => {
                const pId = pos.id || pos._id;
                const hasVotedThisPos = votedArray.includes(pId);
                const candidates = candidatesByPosition[pId] || [];
                const searchQuery = searchQueries[pId] || "";
                
                const filteredCandidates = candidates.filter((cand: any) => 
                  cand.fullName.toLowerCase().includes(searchQuery.toLowerCase())
                );

                return (
                  <section key={pId} className={`${hasVotedThisPos ? "opacity-70" : ""} relative`}>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-100 pb-8">
                      <div>
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Election Category</p>
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{pos.title}</h3>
                      </div>
                      
                      {!hasVotedThisPos ? (
                        <div className="relative w-full md:w-72">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black z-10" size={16} />
                          <input 
                            type="text" 
                            placeholder="Find aspirant..." 
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(pId, e.target.value)}
                            className="w-full bg-white border-2 border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-500 outline-none focus:border-red-600 transition-all shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-200">
                          <ShieldCheck size={14} /> Ballot_Recorded
                        </div>
                      )}
                    </div>

                    <div className="relative group">
                      {!hasVotedThisPos && filteredCandidates.length > 3 && (
                        <div className="absolute right-0 top-[-3rem] flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                          Swipe to explore <ArrowRight size={14} />
                        </div>
                      )}

                      <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide no-scrollbar scroll-smooth px-2">
                        {filteredCandidates.length > 0 ? (
                          filteredCandidates.map((cand: any) => {
                            const cId = cand.id || cand._id;
                            const isSelected = selections[pId] === cId;
                            const isDisabled = hasVotedThisPos || cand.isDisqualified;

                            return (
                              <div 
                                key={cId} 
                                onClick={() => !isDisabled && handleSelect(pId, cId)} 
                                className={`snap-start min-w-[280px] md:min-w-[320px] relative p-8 rounded-[3.5rem] border-2 transition-all duration-500 ${isDisabled ? "bg-slate-50/50 cursor-not-allowed border-transparent grayscale" : "cursor-pointer bg-white border-white hover:border-slate-200 shadow-xl shadow-slate-200/50"} ${isSelected ? "border-red-600 scale-[1.02] ring-8 ring-red-50/50" : ""}`}
                              >
                                <div className="flex flex-col items-center text-center">
                                  <div className={`w-32 h-32 rounded-[2.5rem] mb-6 overflow-hidden ring-8 transition-all duration-500 ${hasVotedThisPos ? 'ring-green-50' : isSelected ? 'ring-red-50' : 'ring-slate-50'}`}>
                                    {/* UPDATED IMAGE LOGIC */}
                                    <img 
                                      src={cand.imageUrl || cand.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(cand.fullName)}&background=f1f5f9&color=0f172a&bold=true`} 
                                      alt={cand.fullName} 
                                      className="w-full h-full object-cover" 
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cand.fullName)}&background=f1f5f9&color=0f172a&bold=true`;
                                      }}
                                    />
                                  </div>
                                  <span className="bg-slate-900 text-white text-[8px] font-black px-3 py-1 rounded-full mb-4 uppercase tracking-tighter">Aspirant #{cand.ballotNumber}</span>
                                  <h4 className={`text-xl font-black uppercase tracking-tight ${hasVotedThisPos ? 'text-slate-400' : 'text-slate-900'}`}>{cand.fullName}</h4>
                                  <p className="text-[10px] font-mono font-bold text-slate-400 mt-2 uppercase tracking-widest">ID: {cId.substring(0, 8)}</p>
                                </div>
                                
                                {isSelected && !hasVotedThisPos && (
                                  <div className="absolute top-8 right-8 bg-red-600 text-white p-3 rounded-full shadow-xl shadow-red-200 animate-in zoom-in duration-300">
                                    <CheckCircle2 size={20} />
                                  </div>
                                )}

                                {hasVotedThisPos && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-[3.5rem]">
                                    <div className="bg-white p-4 rounded-full shadow-xl">
                                      <ShieldCheck size={32} className="text-green-600" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="w-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
                             <Search size={40} className="text-slate-200 mb-4" />
                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No aspirants found matching "{searchQuery}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>

            {Object.keys(selections).length > 0 && (
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-50 animate-in slide-in-from-bottom-10 duration-500">
                <div className="bg-slate-900 rounded-[2.5rem] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 backdrop-blur-xl flex items-center justify-between">
                  <div className="pl-6">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Ready for submission</p>
                    <p className="text-white font-black text-lg leading-none">{Object.keys(selections).length} Ballots Queued</p>
                  </div>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="bg-red-600 hover:bg-red-500 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center gap-3 shadow-lg shadow-red-900/20"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Finalize Registry"}
                  </button>
                </div>
              </div>
            )}

            {availablePositionsCount === 0 && !isLoadingProgress && (
              <div className="mt-32 p-20 bg-white rounded-[4rem] shadow-2xl text-center border border-green-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-green-600" />
                <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <ShieldCheck size={48} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">Registry Locked</h2>
                <p className="text-slate-500 max-w-md mx-auto text-sm font-medium leading-relaxed mb-10">
                  Your biometric and digital identity tokens have been used to secure your votes for this election cycle.
                </p>
                <button onClick={() => navigate("/")} className="px-14 py-6 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-slate-800 transition-all shadow-xl">
                  Exit Station
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default VotingPage;