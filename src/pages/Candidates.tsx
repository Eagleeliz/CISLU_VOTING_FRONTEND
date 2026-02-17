// DashBoards/UserDashboard/CandidatesPage.tsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { 
  useGetCandidatesByElectionQuery, 
  useGetCandidatesByPositionQuery 
} from "../Features/Apis/Candidate.Api";
import { useGetAllElectionsQuery } from "../Features/Apis/Election.Api";
import { useGetPositionsByElectionQuery } from "../Features/Apis/Position.Api";
import { 
  Fingerprint, Search, AlertCircle, 
  Calendar, ChevronRight, Award,
  CheckCircle2, Loader2, Quote
} from "lucide-react";

const CandidatesPage = () => {
  const navigate = useNavigate();
  const [selectedElectionId, setSelectedElectionId] = useState<string>("");
  const [selectedPositionId, setSelectedPositionId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: electionsRes } = useGetAllElectionsQuery();
  const { data: positions } = useGetPositionsByElectionQuery(selectedElectionId, {
    skip: !selectedElectionId
  });

  const electionQuery = useGetCandidatesByElectionQuery(selectedElectionId, { 
    skip: !selectedElectionId || selectedPositionId !== "ALL" 
  });
  
  const positionQuery = useGetCandidatesByPositionQuery(
    { electionId: selectedElectionId, positionId: selectedPositionId }, 
    { skip: !selectedElectionId || selectedPositionId === "ALL" }
  );

  const isLoading = electionQuery.isLoading || positionQuery.isLoading;
  const candidatesData = selectedPositionId === "ALL" ? electionQuery.data : positionQuery.data;

  const groupedCandidates = useMemo(() => {
    const list = Array.isArray(candidatesData) 
      ? candidatesData 
      : candidatesData?.candidates || [];

    const filtered = list.filter(c => 
      !searchQuery || c.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.reduce((acc: any, candidate: any) => {
      const posTitle = positions?.find(p => p.id === candidate.positionId)?.title || "General Candidate";
      if (!acc[posTitle]) acc[posTitle] = [];
      acc[posTitle].push(candidate);
      return acc;
    }, {});
  }, [candidatesData, searchQuery, positions]);

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        {/* HEADER SECTION */}
        <header className="mb-10">
          <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2">Authenticated Voting System</p>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter">
            Digital <span className="text-red-600">Ballot</span>
          </h1>
        </header>

        {/* CONTROLS */}
        <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2rem] p-3 mb-12 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search Aspirant Name..."
              className="w-full bg-slate-50 border-none rounded-xl pl-14 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-red-500/10 outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              onChange={(e) => { setSelectedElectionId(e.target.value); setSelectedPositionId("ALL"); }}
              className="bg-slate-900 text-white border-none rounded-xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-slate-800 transition-colors"
            >
              <option value="">Select Election Cycle</option>
              {electionsRes?.elections.map(el => <option key={el.id} value={el.id}>{el.title}</option>)}
            </select>
            <select
              disabled={!selectedElectionId}
              onChange={(e) => setSelectedPositionId(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="ALL">All Positions</option>
              {positions?.map(pos => <option key={pos.id} value={pos.id}>{pos.title}</option>)}
            </select>
          </div>
        </div>

        {/* RESULTS GRID */}
        {!selectedElectionId ? (
          <div className="text-center py-40 bg-white border border-dashed border-slate-300 rounded-[3rem]">
            <Calendar size={60} className="mx-auto text-slate-200 mb-6" />
            <h2 className="text-2xl font-black text-slate-300 uppercase italic">Awaiting Cycle Selection</h2>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
          </div>
        ) : Object.keys(groupedCandidates).length > 0 ? (
          Object.keys(groupedCandidates).map((positionTitle) => (
            <section key={positionTitle} className="mb-20">
              
              <div className="flex items-center gap-5 mb-10">
                <div className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl shadow-lg flex items-center gap-4">
                  <span className="text-[11px] font-black uppercase tracking-[0.1em]">{positionTitle}</span>
                  <div className="w-[1px] h-4 bg-slate-700"></div>
                  <div className="flex items-center gap-1.5 bg-red-600/10 px-2 py-0.5 rounded-lg border border-red-600/20">
                    <span className="text-[10px] font-black text-red-500 uppercase">
                      {groupedCandidates[positionTitle].length} Aspirants
                    </span>
                  </div>
                </div>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {groupedCandidates[positionTitle].map((candidate: any) => (
                  <div key={candidate.id} className="group bg-white border border-slate-200 rounded-[2.5rem] flex flex-col hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                    
                    <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-red-600 transition-colors" />

                    {/* Top: Identity Header */}
                    <div className="p-8 pb-0 flex items-start justify-between">
                       <div className="relative">
                          {/* UPDATED IMAGE LOGIC: prioritized imageUrl or profileImage, falls back to initials */}
                          <img 
                            src={candidate.imageUrl || candidate.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.fullName)}&background=f1f5f9&color=0f172a&bold=true&font-size=0.33`} 
                            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-50 group-hover:scale-105 transition-transform duration-500 shadow-lg"
                            alt={candidate.fullName} 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.fullName)}&background=f1f5f9&color=0f172a&bold=true&font-size=0.33`;
                            }}
                          />
                          <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-2 rounded-xl shadow-xl z-10 border-2 border-white">
                            <Fingerprint size={14} />
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ballot No.</p>
                          <p className="text-4xl font-black text-slate-900 font-mono italic leading-none">
                            #{candidate.ballotNumber || '00'}
                          </p>
                       </div>
                    </div>

                    {/* Middle: Name & Status */}
                    <div className="px-8 mt-6">
                      <h3 className="text-2xl font-black text-slate-900 uppercase leading-tight mb-1 group-hover:text-red-600 transition-colors">
                        {candidate.fullName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-green-500 fill-green-50" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Aspirant</span>
                      </div>
                    </div>

                    {/* Manifesto Area */}
                    <div className="px-8 mt-6 flex-1">
                       <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative group-hover:bg-white group-hover:border-red-100 transition-all duration-500">
                          <Quote className="absolute top-3 right-4 text-slate-200 group-hover:text-red-100 transition-colors" size={24} />
                          <p className="text-[12px] text-slate-600 leading-relaxed italic line-clamp-3">
                             {candidate.manifesto || "This aspirant has not submitted their digital manifesto summary yet. Please view the full dossier for official records."}
                          </p>
                       </div>
                    </div>

                    {/* Bottom: Action Grid */}
                    <div className="p-8 pt-6 grid grid-cols-1 gap-3">
                      <button 
                        onClick={() => navigate(`/Candidates/profile/${candidate.applicationId || candidate.id}`)}
                        className="w-full bg-slate-900 text-white py-4.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-200 hover:bg-red-600 hover:shadow-red-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                      >
                        SEE FULL PROFILE <ChevronRight size={16} />
                      </button>
                      {/* <button className="w-full bg-white border border-slate-200 text-slate-900 py-4.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all active:scale-[0.98]">
                        Quick Vote
                      </button> */}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-40 bg-white rounded-[3rem] border border-slate-100">
             <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
             <p className="text-slate-500 font-bold uppercase tracking-widest">No matching candidates found</p>
             <p className="text-slate-400 text-xs mt-2 uppercase">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidatesPage;