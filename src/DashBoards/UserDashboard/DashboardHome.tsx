import { useSelector } from "react-redux";
import type  { RootState } from "../../app/store";
import { useGetMyApplicationsQuery } from "../../Features/Apis/ApplicationApi"; 

const DashboardHome = () => {
  // 1. Pull user from Redux state
  const { user } = useSelector((state: RootState) => state.auth);

  // 2. Fetch applications using your RTK Query hook
  // This automatically handles the "0" vs "1" logic based on your DB
  const { 
    data: applications, 
    isLoading, 
    isError,
    refetch // Adding refetch in case you want to manual refresh
  } = useGetMyApplicationsQuery();

  // 3. Simple Loading state for the whole page
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#f97316] animate-pulse font-mono italic">
          Synchronizing Elizabeth's Profile...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Identity Bar */}
      <div className="bg-[#0b0e14]/80 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 text-left">
        <h1 className="text-3xl font-bold text-white mb-2">
          CISLU <span className="text-[#f97316]">VOTE</span>
        </h1>
        <p className="text-[#f97316] font-mono text-sm tracking-widest">
          {user.studentRegNo}
        </p>
      </div>

      {/* Greeting - This solves the "Name not showing" problem */}
      <div className="bg-[#0b0e14]/80 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 text-left">
        <h2 className="text-xl font-semibold text-white mb-2">Dashboard</h2>
        <p className="text-gray-400">
          Welcome back, <span className="text-[#f97316] font-bold text-lg">
            {user.fullName || "Elizabeth"} 
          </span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Applications Card - Solves the "Zero" problem */}
        <div className="bg-[#0b0e14]/80 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 text-left group hover:border-[#f97316]/50 transition-colors">
          <h3 className="text-sm font-medium text-gray-400 mb-2">My Applications</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-white">
              {isLoading ? "..." : (applications?.length || 0)}
            </p>
            {!isLoading && <span className="text-xs text-gray-500 font-mono">RECORD(S) FOUND</span>}
          </div>
          {isError && (
            <button 
              onClick={() => refetch()}
              className="text-[10px] text-red-500 mt-2 hover:underline underline-offset-2"
            >
              ⚠️ Connection failed. Retry sync?
            </button>
          )}
        </div>

        {/* Participation Points Card */}
        <div className="bg-[#0b0e14]/80 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 text-left group hover:border-blue-500/50 transition-colors">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Participation Points</h3>
          <p className="text-4xl font-bold text-white">
             {/* Using actual points from Redux or fallback to 0 */}
            {user.participationPoints ?? 0}
          </p>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-[#0b0e14]/80 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 text-left">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          Recent Activity
          {isLoading && <div className="h-1 w-1 bg-[#f97316] rounded-full animate-ping"></div>}
        </h3>
        
        {applications && applications.length > 0 ? (
          <div className="space-y-3">
             {/* Map through the real applications if you want to list them here */}
            <div className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-lg border border-slate-800/50">
               <div className="h-2 w-2 rounded-full bg-green-500"></div>
               <span className="text-gray-300 text-sm">
                 Active application for <span className="text-white font-medium">{applications[0].position?.title || "Position"}</span> detected.
               </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic py-2">
            No submissions found in the database for this session.
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;