// DashBoards/UserDashboard/DashboardHome.tsx
import { useState, useEffect } from "react";

const DashboardHome = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  if (!user) {
    return (
      <div className="text-gray-400">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Reg No - Semi-transparent dark background */}
      <div className="bg-[#0b0e14]/80 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          CISLU <span className="text-[#f97316]">VOTE</span>
        </h1>
        <p className="text-[#f97316] font-mono text-sm">
          {user.studentRegNo || 'SC/COM/009/24'}
        </p>
      </div>

      {/* Welcome Message - Semi-transparent dark background */}
      <div className="bg-[#0b0e14]/80 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-2">Dashboard</h2>
        <p className="text-gray-400">
          Welcome back, <span className="text-[#f97316]">{user.studentRegNo}</span>
        </p>
      </div>

      {/* Stats Cards - Semi-transparent dark background */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0b0e14]/80 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Applications</h3>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
        <div className="bg-[#0b0e14]/80 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Participation Points</h3>
          <p className="text-3xl font-bold text-white">250</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-[#0b0e14]/80 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <p className="text-gray-400 text-sm">No recent activity to display.</p>
      </div>
    </div>
  );
};

export default DashboardHome;