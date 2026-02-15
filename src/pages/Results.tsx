import React, { useState, useMemo, useEffect } from "react";
import { 
  Trophy, 
  BarChart3, 
  ShieldCheck, 
  Loader2, 
  ChevronDown, 
  Activity,
  RefreshCcw,
  Hash,
  User,
  CheckCircle2,
  Lock
} from "lucide-react";

import { useGetAllElectionsQuery } from "../Features/Apis/Election.Api"; 
import { useGetPositionsByElectionQuery } from "../Features/Apis/Position.Api"; 
import { useGetPositionResultsQuery } from "../Features/Apis/Vote.Api";
import Navbar from "../components/Navbar";

const PositionResultCard = ({ position, electionStatus }: { position: any, electionStatus: string }) => {
  const pId = position.id || position._id;
  const isCompleted = electionStatus === "completed";
  
  // Stop polling if election is completed
  const { data: results, isLoading, error, refetch, isFetching } = useGetPositionResultsQuery(pId, {
    pollingInterval: isCompleted ? 0 : 20000, 
  });

  const { totalVotes, margin } = useMemo(() => {
    if (!results || !Array.isArray(results)) return { totalVotes: 0, margin: 0 };
    // Asserting as any to handle the 'tally' property error
    const total = (results as any[]).reduce((acc: number, curr: any) => acc + (Number(curr.tally) || 0), 0);
    const leadMargin = results.length > 1 ? (Number((results[0] as any).tally) - Number((results[1] as any).tally)) : 0;
    return { totalVotes: total, margin: leadMargin };
  }, [results]);

  if (isLoading) return (
    <div className="h-32 flex items-center justify-center bg-white rounded-3xl border border-slate-100 mb-6 shadow-sm">
      <Loader2 className="animate-spin text-red-600" size={24} />
    </div>
  );
  
  if (error) return null;

  return (
    <section className="mb-12 md:mb-20">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg relative">
            <BarChart3 size={18} />
            {!isCompleted && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">{position.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isCompleted ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-600'}`}>
                <Hash size={8} className="inline mr-0.5" /> {totalVotes} Total Ballots
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end flex-1 gap-2">
          {!isCompleted && (
            <>
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest sm:block hidden">Live Sync: 20s</span>
              <button 
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
              >
                <RefreshCcw size={14} className={`text-slate-400 ${isFetching ? 'animate-spin text-red-600' : ''}`} />
                <span className="text-[10px] font-black uppercase text-slate-500">Refresh</span>
              </button>
            </>
          )}
          {isCompleted && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
               <Lock size={12} className="text-slate-400" />
               <span className="text-[10px] font-black uppercase text-slate-400">Final Results</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 px-1">
        {results && results.length > 0 ? (
          results.map((cand: any, index: number) => {
            const currentTally = Number(cand.tally) || 0;
            const currentPercentage = cand.percentage || 0;
            const regNumber = cand.fullName || "Unknown"; 
            const isWinner = index === 0 && currentTally > 0;
            
            return (
              <div 
                key={cand.id || index} 
                className={`relative bg-white rounded-[2rem] p-4 md:p-6 border-2 transition-all duration-300 ${
                  isWinner ? 'border-red-600 shadow-md md:shadow-xl' : 'border-slate-100 shadow-sm hover:border-slate-200'
                }`}
              >
                {isWinner && (
                  <div className={`absolute -top-2.5 left-6 text-white px-3 py-0.5 rounded-full flex items-center gap-1.5 shadow-lg z-10 ${isCompleted ? 'bg-green-600' : 'bg-red-600'}`}>
                    {isCompleted ? <CheckCircle2 size={10} /> : <Trophy size={10} />}
                    <span className="text-[8px] font-black uppercase">
                      {isCompleted ? 'Winner Confirmed' : 'Leader'}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-4 md:gap-6">
                  <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-slate-50 ring-2 md:ring-4 transition-all shrink-0 ${isWinner ? 'ring-red-50' : 'ring-slate-50'}`}>
                    <img 
                      src={`https://ui-avatars.com/api/?name=${regNumber}&background=f8fafc&color=ef4444&bold=true`} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm md:text-lg font-black text-slate-900 uppercase truncate">
                          {regNumber}
                        </h4>
                        {isWinner && margin > 0 && (
                          <p className={`text-[9px] font-bold italic leading-none mt-1 ${isCompleted ? 'text-green-600' : 'text-red-500'}`}>
                            {isCompleted ? `Won by ${margin} votes` : `+${margin} vote lead`}
                          </p>
                        )}
                      </div>
                      <div className="bg-slate-900 text-white px-2.5 py-1 rounded-lg shadow-sm shrink-0">
                        <span className="text-xs font-black tracking-tighter">{currentTally}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Tally Share</span>
                        <span className="text-[10px] md:text-[11px] font-black text-red-600">{currentPercentage}%</span>
                      </div>
                      <div className="w-full h-1.5 md:h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out ${isWinner ? 'bg-red-600' : 'bg-slate-400'}`} 
                          style={{ width: `${currentPercentage}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
            <Activity className="mx-auto text-slate-300 mb-2" size={24} />
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Awaiting Live Tally</p>
          </div>
        )}
      </div>
    </section>
  );
};

const ResultsPage = () => {
  const [selectedElectionId, setSelectedElectionId] = useState<string>("");
  const [countdown, setCountdown] = useState(20);

  const { data: allElectionsRes, isLoading: isLoadingList } = useGetAllElectionsQuery();
  
  const eligibleElections = useMemo(() => {
    return allElectionsRes?.elections?.filter(e => e.status === "voting" || e.status === "completed") || [];
  }, [allElectionsRes]);

  const currentElection = useMemo(() => {
    return eligibleElections.find(e => (e.id || (e as any)._id) === selectedElectionId);
  }, [eligibleElections, selectedElectionId]);

  const isCompleted = currentElection?.status === "completed";

  // Countdown timer logic - Only runs if NOT completed
  useEffect(() => {
    if (isCompleted) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 20 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  useEffect(() => {
    if (eligibleElections.length > 0 && !selectedElectionId) {
      const firstId = eligibleElections[0].id || (eligibleElections[0] as any)._id;
      setSelectedElectionId(firstId);
    }
  }, [eligibleElections, selectedElectionId]);

  const { data: positions, isLoading: isLoadingPos } = useGetPositionsByElectionQuery(selectedElectionId, { skip: !selectedElectionId });

  if (isLoadingList || (selectedElectionId && isLoadingPos)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBFBFE] p-6">
        <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Syncing Live Ledger...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFE] pb-24 pt-20 md:pt-24">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8 md:mb-12">
        <div className="flex flex-col gap-6 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-red-50 p-3 rounded-2xl">
                {isCompleted ? <ShieldCheck className="text-green-600" size={20} /> : <Activity className="text-red-600 animate-pulse" size={20} />}
              </div>
              <div>
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">System Monitor</p>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter">
                  {isCompleted ? 'Final' : 'Live'} <span className="text-red-600">Results</span>
                </h1>
              </div>
            </div>

            {/* CIRCULAR COUNTDOWN - Hidden if completed */}
            {!isCompleted && (
              <div className="flex flex-col items-end">
                <div className="relative h-10 w-10 flex items-center justify-center">
                  <svg className="absolute h-full w-full -rotate-90">
                    <circle cx="20" cy="20" r="18" stroke="#f1f5f9" strokeWidth="2.5" fill="transparent" />
                    <circle 
                      cx="20" cy="20" r="18" stroke="#ef4444" strokeWidth="2.5" fill="transparent" 
                      strokeDasharray={113} strokeDashoffset={113 - (113 * countdown) / 20}
                      className="transition-all duration-1000" 
                    />
                  </svg>
                  <span className="text-[10px] font-black text-slate-900">{countdown}</span>
                </div>
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Next Sync</span>
              </div>
            )}
            {isCompleted && (
              <div className="bg-green-50 text-green-700 px-4 py-2 rounded-2xl border border-green-100 flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span className="text-[10px] font-black uppercase tracking-tight">Closed</span>
              </div>
            )}
          </div>

          <div className="relative w-full">
            <select 
              value={selectedElectionId}
              onChange={(e) => setSelectedElectionId(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 text-xs md:text-sm font-bold rounded-xl md:rounded-2xl p-3 md:p-4 appearance-none focus:border-red-600 outline-none"
            >
              {eligibleElections.map((e: any) => (
                <option key={e.id || e._id} value={e.id || e._id}>{e.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6">
        {positions?.map((pos: any) => (
          <PositionResultCard 
            key={pos.id || pos._id} 
            position={pos} 
            electionStatus={currentElection?.status || 'voting'}
          />
        ))}
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-slate-900 text-white py-3 border-t border-slate-800 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-1 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-green-500" size={14} />
            <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest">
              {isCompleted ? 'Final Ledger Audited & Archived' : 'Secure Ledger Synchronized (20s)'}
            </span>
          </div>
          <span className="text-[7px] text-slate-500 font-bold uppercase">v2.0.4-live</span>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;