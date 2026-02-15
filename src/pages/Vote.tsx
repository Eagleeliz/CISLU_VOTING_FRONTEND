import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle,
  Fingerprint, 
  Loader2,
  LayoutGrid,
  ChevronDown,
  User,
  Info,
  Lock,
  CalendarDays,
  X,
  FileText,
  ShieldAlert
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

          <button 
            onClick={onClose}
            className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              isError 
                ? 'bg-slate-900 text-white hover:bg-red-600' 
                : 'bg-green-600 text-white hover:bg-slate-900'
            }`}
          >
            {isError ? "Acknowledge" : "Return to Home"}
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
  
  // Modal State
  const [modal, setModal] = useState({ isOpen: false, type: "success", message: "", receipt: "" });

  const { data: allElectionsRes, isLoading: isLoadingList } = useGetAllElectionsQuery();
  
  const activeElections = useMemo(() => {
    return allElectionsRes?.elections?.filter(
      e => e.status === "voting" || e.status === "upcoming"
    ) || [];
  }, [allElectionsRes]);

  useEffect(() => {
    if (activeElections.length > 0 && !selectedElectionId) {
      const firstId = activeElections[0].id || (activeElections[0] as any)._id;
      setSelectedElectionId(firstId);
    }
  }, [activeElections, selectedElectionId]);

  const { data: positions, isLoading: isLoadingPositions } = useGetPositionsByElectionQuery(selectedElectionId, {
    skip: !selectedElectionId
  });

  const { data: electionData, isLoading: isLoadingDetails } = useGetElectionByIdQuery(selectedElectionId, { 
    skip: !selectedElectionId 
  });

  const { data: candidatesRes, isLoading: isLoadingCandidates } = useGetCandidatesByElectionQuery(selectedElectionId, {
    skip: !selectedElectionId
  });

  const { data: progress, isLoading: isLoadingProgress } = useGetVotingProgressQuery(selectedElectionId, { 
    skip: !selectedElectionId 
  });

  const [submitBulk, { isLoading: isBulkSubmitting }] = useSubmitBulkBallotMutation();
  const [castSingle, { isLoading: isSingleSubmitting }] = useCastVoteMutation();
  const isSubmitting = isBulkSubmitting || isSingleSubmitting;

  const election = electionData?.election;
  const votedArray = useMemo(() => (Array.isArray(progress) ? progress : []), [progress]);

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

  const closeModal = () => {
    const wasSuccess = modal.type === "success";
    setModal(prev => ({ ...prev, isOpen: false }));
    if (wasSuccess) navigate("/");
  };

  const handleSubmit = async () => {
    const selectionEntries = Object.entries(selections);
    if (selectionEntries.length === 0) return;

    try {
      let response;
      if (selectionEntries.length === 1) {
        const [positionId, candidateId] = selectionEntries[0];
        response = await castSingle({ electionId: selectedElectionId, positionId, candidateId }).unwrap();
      } else {
        const selectionsArray = selectionEntries.map(([posId, candId]) => ({ positionId: posId, candidateId: candId }));
        response = await submitBulk({ electionId: selectedElectionId, selections: selectionsArray }).unwrap();
      }
      
      setModal({
        isOpen: true,
        type: "success",
        message: "Your encrypted ballot has been successfully submitted and verified in the registry.",
        receipt: response.receipt || "TXN-SECURE-GEN-001"
      });
    } catch (err: any) {
      setModal({
        isOpen: true,
        type: "error",
        message: err.data?.error || err.data?.message || "Submission failed. Please try again or contact support.",
        receipt: ""
      });
    }
  };

  if (isLoadingList || (selectedElectionId && (isLoadingPositions || isLoadingCandidates || isLoadingProgress || isLoadingDetails))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBFBFE]">
        <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encrypting Ballot Workspace...</p>
      </div>
    );
  }

  if (!isLoadingList && activeElections.length === 0) {
    return (
      <div className="min-h-screen bg-[#FBFBFE] flex flex-col items-center justify-center p-6">
        <Navbar />
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"><CalendarDays className="text-slate-300" size={32} /></div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">No Active Elections</h2>
          <p className="text-slate-400 text-sm font-medium mb-8">No elections are available for voting at this time.</p>
          <button onClick={() => navigate("/")} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Return to Home</button>
        </div>
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
              <h2 className="font-bold text-slate-900">Current Ballot</h2>
            </div>
          </div>

          <div className="relative group min-w-[300px]">
            <select value={selectedElectionId} onChange={(e) => { setSelectedElectionId(e.target.value); setSelections({}); }} className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 text-sm font-bold rounded-2xl p-4 appearance-none cursor-pointer focus:outline-none focus:border-red-600 transition-all">
              {activeElections.map((e: any) => (<option key={e.id || e._id} value={e.id || e._id}>{e.title}</option>))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6">
        {election && (
          <>
            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl mb-16">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Fingerprint size={120} /></div>
              <div className="relative z-10">
                <span className={`text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest mb-4 inline-block ${election.status === 'voting' ? 'bg-green-600' : 'bg-blue-600'}`}>
                  {election.status === 'voting' ? 'Live Voting' : 'Upcoming'}
                </span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2">{election.title}</h1>
                <p className="text-slate-400 font-medium max-w-2xl text-sm">{election.description}</p>
              </div>
            </div>

            <div className="space-y-24">
              {positions?.map((pos: any) => {
                const pId = pos.id || pos._id;
                const hasVotedThisPos = votedArray.includes(pId);
                const candidates = candidatesByPosition[pId] || [];

                return (
                  <section key={pId}>
                    <div className="flex items-center gap-6 mb-10">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Position</p>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{pos.title}</h3>
                      </div>
                      <div className="h-px flex-1 bg-slate-200" />
                      {hasVotedThisPos && <span className="text-green-600 font-black text-[10px] bg-green-50 px-4 py-1.5 rounded-full border border-green-100 flex items-center gap-2"><ShieldCheck size={14} /> SECURED</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {candidates.map((cand: any) => {
                        const cId = cand.id || cand._id;
                        const isSelected = selections[pId] === cId;
                        const isDisabled = hasVotedThisPos || cand.isDisqualified || election.status === "upcoming";

                        return (
                          <div key={cId} onClick={() => !isDisabled && handleSelect(pId, cId)} className={`relative p-8 rounded-[3rem] border-2 transition-all duration-300 ${isDisabled ? "opacity-50 grayscale bg-slate-50 cursor-not-allowed" : "cursor-pointer"} ${isSelected ? "border-red-600 bg-white shadow-2xl scale-[1.02]" : "border-white bg-white hover:border-slate-200 shadow-sm"}`}>
                            <div className="flex flex-col items-center text-center">
                              <div className="w-28 h-28 rounded-[2rem] bg-slate-100 mb-6 flex items-center justify-center text-slate-400 overflow-hidden ring-8 ring-slate-50">
                                {cand.profileImage ? <img src={cand.profileImage} alt={cand.fullName} className="w-full h-full object-cover" /> : <User size={40} />}
                              </div>
                              <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded mb-3">BALLOT #{cand.ballotNumber}</span>
                              <h4 className="text-lg font-black text-slate-900 uppercase leading-tight mt-1">{cand.fullName}</h4>
                            </div>
                            {isSelected && !isDisabled && <div className="absolute top-6 right-6 bg-red-600 text-white p-2 rounded-full shadow-lg"><CheckCircle2 size={18} /></div>}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>

            {election.status === "voting" && (
              <div className="mt-32 p-12 bg-white rounded-[3.5rem] shadow-xl text-center border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600" />
                <h2 className="text-2xl font-black text-slate-900 uppercase mb-4">Finalize Ballot</h2>
                <button onClick={handleSubmit} disabled={Object.keys(selections).length === 0 || isSubmitting} className="w-full max-w-sm py-6 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-slate-900 disabled:opacity-30 transition-all shadow-xl">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Cast Secure Ballot"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default VotingPage;