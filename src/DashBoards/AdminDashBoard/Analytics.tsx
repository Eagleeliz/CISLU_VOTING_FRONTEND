import  { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, LineChart, Line, ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';
import { 
  Users, Vote, ShieldCheck, FileStack, TrendingUp, 
  Award, GraduationCap, Gavel, Activity, Search, Zap, ShieldAlert, Layers, MapPin,
  UserCheck, Shield, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { PuffLoader } from 'react-spinners';

// --- INTEGRATED API HOOKS ---
import { useGetAllElectionsQuery } from '../../Features/Apis/Election.Api';
import { useGetAllUsersQuery } from '../../Features/Apis/Users.Api';
import { useGetCandidatesByElectionQuery as useGetApps } from '../../Features/Apis/CandidatesApplication.Api';
import type { RootState } from '../../app/store';

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#8b5cf6', '#3b82f6', '#dc2626'];

const cardVariants = {
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 },
};

export const GeneralAnalytics = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // 1. FETCH GLOBAL SYSTEM DATA
  const { data: electionsData, isLoading: eLoading } = useGetAllElectionsQuery();
  const { data: userData, isLoading: uLoading } = useGetAllUsersQuery({ limit: 5000, offset: 0 });
  const { data: allApps, isLoading: aLoading } = useGetApps("");

  // 2. ANALYTICS LOGIC
  const metrics = useMemo(() => {
    const users = (userData as any)?.users || (Array.isArray(userData) ? userData : []);
    const elections = (electionsData as any)?.elections || (Array.isArray(electionsData) ? electionsData : []);
    const applications = Array.isArray(allApps) ? allApps : (allApps as any)?.candidates || [];

    // Academic Year Distribution
    const yearMap: Record<string, number> = {};
    users.forEach((u: any) => {
      const yr = u.yearOfStudy || 'N/A';
      yearMap[yr] = (yearMap[yr] || 0) + 1;
    });

    const academicBreakdown = Object.entries(yearMap)
      .map(([name, value]) => ({ name: `Year ${name}`, value }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Role Distribution (Admin vs User)
    const adminCount = users.filter((u: any) => u.role === 'admin' || u.isAdmin).length;
    const roleDistribution = [
      { name: 'Admins', value: adminCount },
      { name: 'Standard Users', value: users.length - adminCount }
    ];

    // Profile Completion Logic (Users missing core fields)
    const incompleteProfiles = users.filter((u: any) => !u.profilePicture || !u.bio || !u.yearOfStudy).length;

    // 24-Hour Registration Spikes
    const now = new Date();
    const last24hMap: Record<string, number> = {};
    for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000).getHours();
        last24hMap[`${hour}:00`] = 0;
    }
    users.forEach((u: any) => {
        const uDate = new Date(u.createdAt);
        if (now.getTime() - uDate.getTime() <= 24 * 60 * 60 * 1000) {
            const hrLabel = `${uDate.getHours()}:00`;
            if (last24hMap[hrLabel] !== undefined) last24hMap[hrLabel]++;
        }
    });
    const registration24h = Object.entries(last24hMap).map(([time, value]) => ({ time, value }));

    // Position Demand Logic
    const posMap: Record<string, number> = {};
    applications.forEach((app: any) => {
      const title = app.position?.title || app.positionTitle || 'General';
      posMap[title] = (posMap[title] || 0) + 1;
    });
    const positionDemand = Object.entries(posMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 5);

    // Registration Trends (7 Days)
    const regMap: Record<string, number> = {};
    users.forEach((u: any) => {
      const date = new Date(u.createdAt).toISOString().slice(5, 10);
      regMap[date] = (regMap[date] || 0) + 1;
    });
    const registrationTrends = Object.entries(regMap).map(([name, value]) => ({ name, value })).slice(-7);

    const verifiedCount = users.filter((u: any) => u.isVerified || u.isGoodStanding).length;
    const promotedApps = applications.filter((a: any) => a.status === 'promoted' || a.isBallotReady).length;
    const totalPositions = elections.reduce((acc: number, curr: any) => acc + (curr.positions?.length || 4), 0);
    const density = totalPositions > 0 ? (promotedApps / totalPositions).toFixed(1) : "0.0";

    return {
      totalUsers: users.length,
      activeElections: elections.filter((e: any) => e.status === 'active' || e.status === 'voting').length,
      totalElections: elections.length,
      totalPositions,
      verifiedUsers: verifiedCount,
      totalApps: applications.length,
      promotedApps,
      positionDemand,
      roleDistribution,
      incompleteProfiles,
      registration24h,
      avgPoints: users.length > 0 ? Math.round(users.reduce((s: number, u: any) => s + (u.points || 0), 0) / users.length) : 0,
      academicBreakdown,
      registrationTrends,
      density,
      distributionData: [
        { name: 'Verified', value: verifiedCount },
        { name: 'Pending', value: users.length - verifiedCount }
      ]
    };
  }, [userData, electionsData, allApps]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const name = user?.fullName?.split(' ')[0] || 'Admin';
    if (hour < 12) return `Good Morning, ${name}!`;
    if (hour < 18) return `Good Afternoon, ${name}!`;
    return `Good Evening, ${name}!`;
  }, [user]);

  if (eLoading || uLoading || aLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#07090d]">
        <PuffLoader color="#dc2626" size={60} />
        <p className="mt-4 font-mono text-[10px] text-red-500 uppercase tracking-[0.5em]">Aggregating_Global_Pulse...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200/90 py-12 px-6 font-sans text-base-content">
      <div className="container mx-auto space-y-10">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-base-300/70 p-8 rounded-3xl border border-base-content/10 shadow-2xl backdrop-blur-md flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-primary italic tracking-tight uppercase">System<span className="text-red-600 not-italic">_Pulse</span></h1>
            <p className="text-sm text-slate-500 font-medium mt-1">{greeting} Infrastructure is stable.</p>
          </div>
          <div className="flex gap-8">
             <div className="text-right border-l border-base-content/10 pl-8">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Incomplete Files</div>
                <div className="text-2xl font-black text-orange-500">{metrics.incompleteProfiles}</div>
             </div>
             <div className="text-right border-l border-base-content/10 pl-8">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Competitive Density</div>
                <div className="text-2xl font-black text-emerald-500">{metrics.density} <span className="text-xs text-slate-400">INDEX</span></div>
             </div>
          </div>
        </motion.div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: <Users size={20}/>, label: 'Total Users', count: metrics.totalUsers, color: 'text-blue-500' },
            { icon: <Layers size={20}/>, label: 'Positions', count: metrics.totalPositions, color: 'text-purple-500' },
            { icon: <FileStack size={20}/>, label: 'Applications', count: metrics.totalApps, color: 'text-amber-500' },
            { icon: <Vote size={20}/>, label: 'Live Elections', count: metrics.activeElections, color: 'text-emerald-500' },
            { icon: <ShieldCheck size={20}/>, label: 'Promoted', count: metrics.promotedApps, color: 'text-red-500' },
            { icon: <Award size={20}/>, label: 'Avg Points', count: metrics.avgPoints, color: 'text-cyan-500' },
          ].map((card, i) => (
            <motion.div key={i} variants={cardVariants} whileHover="hover" whileTap="tap" className="bg-base-300/70 p-5 rounded-2xl border border-base-content/10 shadow-lg flex flex-col items-center justify-center text-center">
              <div className={`mb-2 ${card.color}`}>{card.icon}</div>
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.label}</h2>
              <p className={`text-2xl font-black mt-1 ${card.color}`}>{card.count}</p>
            </motion.div>
          ))}
        </div>

        {/* 24-Hour Registration Velocity Line Graph */}
        <div className="bg-base-300/70 p-8 rounded-[2.5rem] shadow-xl border border-base-content/10">
            <h2 className="text-sm font-black mb-8 flex items-center gap-2 uppercase tracking-widest">
               <Clock size={18} className="text-red-500" /> Hourly Registration Spikes (Last 24h)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.registration24h}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444' }} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>

        {/* Major Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-base-300/70 p-8 rounded-[2.5rem] shadow-xl border border-base-content/10">
            <h2 className="text-sm font-black mb-8 flex items-center gap-2 uppercase tracking-widest">
               <TrendingUp size={18} className="text-blue-500" /> Platform Velocity (7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.registrationTrends}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--b3))', border: 'none', borderRadius: '15px' }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReg)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-base-300/70 p-8 rounded-[2.5rem] shadow-xl border border-base-content/10">
            <h2 className="text-sm font-black mb-8 flex items-center gap-2 uppercase tracking-widest">
               <GraduationCap size={18} className="text-emerald-500" /> Demographic Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.academicBreakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {metrics.academicBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role and Verification Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-base-300/70 p-8 rounded-[2.5rem] shadow-xl border border-base-content/10 flex flex-col items-center">
                <h2 className="text-sm font-black mb-8 uppercase tracking-widest flex items-center gap-2"><Shield size={18} className="text-purple-500" /> Admin vs User Ratio</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={metrics.roleDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                            <Cell fill="#8b5cf6" />
                            <Cell fill="#1e293b" />
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-base-300/70 p-8 rounded-[2.5rem] shadow-xl border border-base-content/10 flex flex-col items-center">
                <h2 className="text-sm font-black mb-8 uppercase tracking-widest flex items-center gap-2"><UserCheck size={18} className="text-emerald-500" /> Voter Verification Ratio</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={metrics.distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                            <Cell fill="#10b981" />
                            <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Major Charts Row 2 - Position Demand */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-base-300/70 p-8 rounded-[2.5rem] shadow-xl border border-base-content/10">
                <h2 className="text-sm font-black mb-8 flex items-center gap-2 uppercase tracking-widest">
                   <MapPin size={18} className="text-purple-500" /> Position Demand (Applications)
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.positionDemand} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 9, width: 80}} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                            {metrics.positionDemand.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-base-300/70 p-8 rounded-[2.5rem] shadow-xl border border-base-content/10">
                <h2 className="text-sm font-black mb-8 uppercase tracking-widest">Global Node Integrity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatusRow label="Sync Hub" status="Shielded" latency="14ms" color="text-emerald-500" icon={<Zap size={14}/>} />
                    <StatusRow label="Identity" status="Active" latency="22ms" color="text-blue-500" icon={<ShieldCheck size={14}/>} />
                    <StatusRow label="Engine" status="Healthy" latency="102ms" color="text-amber-500" icon={<Activity size={14}/>} />
                    <StatusRow label="Audit" status="Live" latency="Secure" color="text-purple-500" icon={<Search size={14}/>} />
                </div>
            </div>
        </div>

        {/* Audit Log Banner */}
        <div className="mt-8 p-5 bg-base-100/50 rounded-2xl border border-red-600/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Gavel className="text-red-600 animate-pulse" />
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase">Integrity Watchdog</p>
              <p className="text-sm font-bold">System logs, admin actions, and application statuses are synchronized with the audit gateway.</p>
            </div>
          </div>
          <ShieldAlert className="text-slate-700" size={20} />
        </div>

      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const StatusRow = ({ label, status, latency, color, icon }: any) => (
  <div className="p-5 bg-base-100/30 rounded-2xl border border-base-content/5 flex justify-between items-center transition-all hover:bg-base-100">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-base-200 ${color}`}>{icon}</div>
      <div>
        <p className="text-[9px] font-mono text-slate-500 uppercase">{label}</p>
        <p className={`text-xs font-black ${color}`}>{status}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-[8px] font-mono text-slate-500 uppercase">Sync</p>
      <p className="text-[10px] font-bold">{latency}</p>
    </div>
  </div>
);