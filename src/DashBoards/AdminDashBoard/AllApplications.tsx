import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
// Import from the corrected applicationApi
import {
  useGetApplicationsByElectionQuery,
  useReviewApplicationMutation,
  useDisqualifyCandidateMutation,
} from "../../Features/Apis/ApplicationApi"; 
import { useGetAllElectionsQuery } from "../../Features/Apis/Election.Api";
import { 
  Search, X, Loader2, RefreshCw, 
  ShieldCheck, Zap, 
  Trash2, Eye, ChevronLeft, ChevronRight,
  User, FileText, Terminal
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { RootState } from "../../app/store";

export const AllApplications = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  /* ================= DATA FETCHING ================= */
  const { data: electionsRaw } = useGetAllElectionsQuery();
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

  // Using the corrected query hook
  const { 
    data: applications, 
    isLoading, 
    refetch, 
    isFetching 
  } = useGetApplicationsByElectionQuery(selectedElectionId, {
    skip: !selectedElectionId,
  });

  // Using the corrected mutation hook from applicationApi
  const [reviewApplication, { isLoading: isReviewing }] = useReviewApplicationMutation();
  const [disqualifyCandidate] = useDisqualifyCandidateMutation();

  /* ================= UI STATE ================= */
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [viewingApp, setViewingApp] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  /* ================= FORM STATE ================= */
  const [reviewData, setReviewData] = useState({
    status: "approved" as "approved" | "rejected",
    adminRemarks: ""
  });

  /* ================= HANDLERS ================= */
  const handleOpenReview = (app: any) => {
    setViewingApp(app);
    setReviewData({
      status: app.status === 'pending' || app.status === 'under_review' ? 'approved' : app.status,
      adminRemarks: app.adminRemarks || ""
    });
    setIsPanelOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingApp) return;

    try {
      // Logic fix: This mutation now triggers the backend transaction 
      // which updates status AND promotes to the candidates table if approved.
      await reviewApplication({
        id: viewingApp.id,
        status: reviewData.status,
        adminRemarks: reviewData.adminRemarks
      }).unwrap();

      const successMsg = reviewData.status === 'approved' 
        ? "CANDIDATE_PROMOTED_TO_BALLOT_SUCCESS" 
        : `DECISION_EXECUTED:_${reviewData.status.toUpperCase()}`;
      
      toast.success(successMsg);
      setIsPanelOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || "Review process failed");
    }
  };

  const handleDisqualify = async (id: string) => {
    if (window.confirm("CRITICAL: Disqualify this candidate permanently?")) {
      try {
        await disqualifyCandidate(id).unwrap();
        toast.success("Candidate purged from node");
      } catch {
        toast.error("Purge sequence failed");
      }
    }
  };

  /* ================= LOGIC ================= */
  const { paginatedApps, totalPages } = useMemo(() => {
    const rawList = Array.isArray(applications) ? applications : [];
    const filtered = rawList.filter((app: any) => {
      // Checking both userId and the user object's fullName if available
      const userName = app.user?.fullName || app.userId || "";
      const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           app.statementOfIntent?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? app.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
    return {
      paginatedApps: filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  }, [applications, searchTerm, statusFilter, currentPage]);

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#07090d]">
      <Loader2 className="text-indigo-600 animate-spin mb-4" size={40} />
      <p className="text-[10px] font-mono text-indigo-500 uppercase tracking-[0.4em]">fetching_applications...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-300 p-4 lg:p-8 font-sans">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-1">
            Scrutiny<span className="text-indigo-600 font-light not-italic">_Console</span>
          </h2>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase">
            <ShieldCheck size={12} className="text-indigo-600" />
            <span>Auth_Session: {user?.fullName || 'SYSTEM_ADMIN'}</span>
          </div>
        </div>
        <select 
          value={selectedElectionId} 
          onChange={(e) => { setSelectedElectionId(e.target.value); setCurrentPage(1); }}
          className="bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 rounded-xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all w-full md:w-auto"
        >
          {elections.map((e: any) => (
            <option key={e.id} value={e.id} className="bg-[#07090d]">Target: {e.title}</option>
          ))}
        </select>
      </div>

      {/* FILTER BAR */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-slate-900/20 p-4 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
          <input 
            type="text" placeholder="SEARCH_CANDIDATES..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-[11px] font-mono focus:border-indigo-600 outline-none transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[11px] font-mono focus:border-indigo-600 outline-none uppercase"
        >
          <option value="">All_Statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={() => refetch()} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-xl py-3 text-[10px] font-black uppercase transition-all">
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Sync_Database
        </button>
      </div>

      {/* CARDS GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedApps.map((app: any) => (
          <div key={app.id} className="group relative bg-[#0f1117] border border-slate-800 rounded-[2rem] p-6 hover:border-indigo-600/40 transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                app.status === 'approved' ? 'border-emerald-600 text-emerald-500 bg-emerald-600/10' :
                app.status === 'rejected' ? 'border-red-600 text-red-500 bg-red-600/10' :
                'border-orange-500 text-orange-500 bg-orange-500/10 animate-pulse'
              }`}>
                {app.status}
              </span>
              <span className="text-[10px] font-mono text-slate-700">APP_{app.id?.substring(0, 6)}</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                {app.imageUrl ? (
                  <img src={app.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-slate-700" size={20} />
                )}
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight line-clamp-1">
                  {app.user?.fullName || app.userId}
                </h3>
                <p className="text-[10px] font-mono text-indigo-500 uppercase">
                  {app.user?.participationPoints || 0} POINTS_RECORDED
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic mb-6 line-clamp-2 bg-black/20 p-3 rounded-xl border border-slate-800/50">
              "{app.statementOfIntent || 'No statement provided.'}"
            </p>

            <div className="flex gap-2">
              <button onClick={() => handleOpenReview(app)} className="flex-1 bg-slate-900 hover:bg-indigo-600 hover:text-white py-3 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2">
                <Eye size={14} /> Review_Bid
              </button>
              <button onClick={() => handleDisqualify(app.id)} className="px-4 bg-slate-900 hover:bg-rose-600 hover:text-white rounded-xl transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto mt-12 flex justify-center items-center gap-4">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:text-indigo-500 disabled:opacity-20 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
            Page <span className="text-white">{currentPage}</span> of {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:text-indigo-500 disabled:opacity-20 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* SCRUTINY SIDE PANEL */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#07090d] border-l border-slate-800 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-indigo-600/5">
              <div>
                <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Candidacy_Manifest</p>
                <h3 className="text-2xl font-black text-white uppercase italic">Scrutiny_Review</h3>
              </div>
              <button onClick={() => setIsPanelOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500"><X size={20} /></button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto space-y-8">
              {/* CANDIDATE BIO */}
              <div className="flex items-start gap-6 bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800">
                <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden">
                   {viewingApp?.imageUrl ? (
                     <img src={viewingApp.imageUrl} className="w-full h-full object-cover" alt="" />
                   ) : (
                     <User className="w-full h-full p-4 text-slate-600" />
                   )}
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-black uppercase text-lg">{viewingApp?.user?.fullName || viewingApp?.userId}</h4>
                  <p className="text-[10px] font-mono text-indigo-400 uppercase">STATUS: {viewingApp?.status}</p>
                  <p className="text-[10px] font-mono text-slate-500 uppercase">POINTS: {viewingApp?.user?.participationPoints || 0}</p>
                </div>
              </div>

              {/* STATEMENTS */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase ml-1 flex items-center gap-2"><Terminal size={12}/> Statement_of_Intent</label>
                  <div className="mt-2 bg-slate-950 border border-slate-800 p-5 rounded-2xl text-xs text-slate-300 leading-relaxed italic">
                    "{viewingApp?.statementOfIntent}"
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase ml-1 flex items-center gap-2"><FileText size={12}/> Detailed_Manifesto</label>
                  <div className="mt-2 bg-slate-950 border border-slate-800 p-5 rounded-2xl text-xs text-slate-400 leading-relaxed max-h-48 overflow-y-auto">
                    {viewingApp?.manifesto}
                  </div>
                </div>
              </div>

              {/* REVIEW FORM */}
              <form onSubmit={handleReviewSubmit} className="space-y-6 pt-6 border-t border-slate-800">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase ml-1">Phase_Decision</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['approved', 'rejected'] as const).map(s => (
                      <button 
                        key={s} type="button" onClick={() => setReviewData({...reviewData, status: s})}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${reviewData.status === s ? (s === 'approved' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-rose-600 border-rose-600 text-white') : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase ml-1">Admin_Remarks</label>
                  <textarea 
                    rows={4} 
                    required
                    value={reviewData.adminRemarks} 
                    onChange={(e) => setReviewData({...reviewData, adminRemarks: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-5 text-sm font-mono focus:border-indigo-600 outline-none resize-none" 
                    placeholder="Provide reasoning for decision..."
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isReviewing}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all"
                >
                  {isReviewing ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                  Execute_Decision
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};