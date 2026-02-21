import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Lock, 
  Smartphone, 
  Activity, 
  UserCheck, 
  Timer, 
  CheckCircle2, 
  ExternalLink,
  Mail, 
  Globe, 
  Circle, 
  ArrowUp, 
  Heart, 
  Code2,
  Fingerprint,
  Trophy,
  MousePointer2
} from "lucide-react";

import { useGetAllElectionsQuery } from "../Features/Apis/Election.Api";
import Navbar from "../components/Navbar";

const LandingPage = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  const { user, token } = useSelector((state: any) => state.auth || {});
  const isAuthenticated = !!token;
  const isAdmin = user?.role === "admin";

  const { data: electionsRes } = useGetAllElectionsQuery();
  const latestElection = useMemo(() => electionsRes?.elections?.[0], [electionsRes]);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    if (!latestElection?.startDate) return;
    const targetDate = new Date(latestElection.startDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          mins: Math.floor((difference / 1000 / 60) % 60),
          secs: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [latestElection]);

  const handleEntryAction = () => {
    if (!isAuthenticated) navigate("/login");
    else isAdmin ? navigate("/AdminDashBoard") : navigate("/dashboard");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060D21] selection:bg-red-600 selection:text-white font-sans overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 md:pt-52 md:pb-44 bg-gradient-to-b from-[#0A1A3F] to-[#060D21]">
        <div className="absolute inset-0 z-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&q=80&w=2070" 
            alt="Democratic background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.4em] mb-10 backdrop-blur-md">
              <ShieldCheck size={14} className="text-red-500" /> Secure Protocol v2.0
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-white max-w-6xl mx-auto tracking-tighter leading-[0.85] mb-10">
              LEAD THE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-white">TRANSITION.</span>
            </h1>
            <p className="text-slate-400 max-w-3xl mx-auto text-lg md:text-2xl font-light leading-relaxed mb-14 tracking-wide">
              The premium digital gateway for <span className="text-white font-medium">Laikipia University</span> student leadership. Transparent. Secure. Final.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
              <button onClick={handleEntryAction} className="group w-full sm:w-auto px-12 py-6 rounded-2xl bg-red-600 text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-red-900/40 hover:bg-white hover:text-red-600 transition-all duration-500 transform hover:-translate-y-1 flex items-center justify-center gap-4">
                {isAuthenticated ? "RESUME SESSION" : "ACCESS PORTAL"} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => navigate("/results")} className="w-full sm:w-auto px-12 py-6 rounded-2xl bg-white/5 text-white border border-white/10 font-black text-[11px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all backdrop-blur-sm flex items-center gap-3">
                LIVE METRICS <Activity size={16} className="text-red-500" />
              </button>
            </div>
        </div>
      </section>

      {/* --- LIVE COUNTDOWN DASHBOARD --- */}
     {/* --- LIVE COUNTDOWN DASHBOARD --- */}
      <section className="px-6 -mt-20 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#0D162D] border border-white/10 rounded-[3rem] p-10 md:p-16 shadow-2xl backdrop-blur-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                     <span className={`h-2 w-2 rounded-full ${latestElection?.status === 'voting' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                     <span className={`${latestElection?.status === 'voting' ? 'text-green-500' : 'text-red-500'} font-black text-[10px] uppercase tracking-[0.5em]`}>
                        {latestElection?.status === 'voting' ? "Live Session" : "Upcoming Cycle"}
                     </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                    {latestElection?.title || "NO NEARBY ELECTIONS"}
                  </h2>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed tracking-wide">
                    {latestElection?.status === 'voting' 
                      ? "The polls are currently open. Cast your vote before the window closes. Ensure your connection is stable before finalizing your choice."
                      : latestElection 
                        ? "The registration window is closing soon. Ensure your biometric profile is updated in the student portal before the countdown hits zero."
                        : "There are currently no active or scheduled election cycles. Please check back later for updates from the CISLU Electoral Commission."}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                    <Timer size={14} className={latestElection?.status === 'voting' ? "text-green-500" : "text-red-500"} />
                    <span className="text-[10px] text-white font-black uppercase tracking-widest">
                        Status: {latestElection?.status ? latestElection.status.toUpperCase() : "IDLE"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="text-[10px] text-white font-black uppercase tracking-widest">Verified Hub</span>
                  </div>
                </div>
              </div>

              {/* Countdown Logic */}
              <div className="grid grid-cols-4 gap-4 md:gap-6">
                {[
                  { label: "DAYS", val: timeLeft.days },
                  { label: "HRS", val: timeLeft.hours },
                  { label: "MINS", val: timeLeft.mins },
                  { label: "SECS", val: timeLeft.secs }
                ].map((unit, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-full aspect-square bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-2xl flex items-center justify-center mb-3">
                      <span className="text-3xl md:text-5xl font-black text-white tracking-tighter">
                        {latestElection ? String(unit.val).padStart(2, '0') : "00"}
                      </span>
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{unit.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TECHNICAL SPECS SECTION --- */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-white">
            {[
              { icon: <Lock size={32} />, title: "ENCRYPTED CORE", desc: "Ballots are sealed with SHA-256 hashing algorithms before entering the ledger." },
              { icon: <Smartphone size={32} />, title: "UBIQUITOUS ACCESS", desc: "Low-latency voting experience optimized for campus Wi-Fi and mobile data." },
              { icon: <Zap size={32} />, title: "ATOMIC TALLYING", desc: "Result integrity is maintained through atomic transaction processing." }
            ].map((spec, i) => (
              <div key={i} className="group flex flex-col items-start text-left p-2">
                <div className="text-red-500 mb-8 transform group-hover:rotate-12 transition-transform">{spec.icon}</div>
                <h3 className="text-lg font-black text-white uppercase tracking-[0.2em] mb-4">{spec.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed tracking-wide font-medium">{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW TO USE SECTION (NEW) --- */}
      <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-white font-black text-4xl md:text-6xl tracking-tighter uppercase mb-6">Execution Protocol</h2>
            <p className="text-slate-400 font-medium tracking-wide">Follow these steps to cast your digital ballot successfully.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { 
                step: "01", 
                icon: <UserCheck className="text-red-500" />, 
                title: "Authentication", 
                desc: "Log in using your university credentials. The system verifies your enrollment status via CISLU." 
              },
              { 
                step: "02", 
                icon: <Fingerprint className="text-red-500" />, 
                title: "Verification", 
                desc: "Complete the secondary biometric or secure token check to unlock your unique voting key." 
              },
              { 
                step: "03", 
                icon: <MousePointer2 className="text-red-500" />, 
                title: "Selection", 
                desc: "Browse candidates per category. Select your choice and review your ballot before submission." 
              },
              { 
                step: "04", 
                icon: <Trophy className="text-red-500" />, 
                title: "Finalize", 
                desc: "Once submitted, your vote is encrypted and added to the tally. Results are updated live." 
              }
            ].map((item, idx) => (
              <div key={idx} className="relative p-8 rounded-3xl bg-[#0D162D] border border-white/5 hover:border-red-500/30 transition-all group">
                <span className="absolute top-6 right-8 text-4xl font-black text-white/5 group-hover:text-red-500/10 transition-colors">{item.step}</span>
                <div className="mb-6">{item.icon}</div>
                <h4 className="text-white font-black uppercase tracking-widest text-sm mb-4">{item.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- DARK THEME FOOTER --- */}
      <footer className="relative mt-20 bg-[#060D21] border-t border-white/10">
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
            
            {/* BRAND & STATUS */}
            <div className="md:col-span-4 space-y-8">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 p-2.5 rounded-[1.25rem] text-white shadow-xl shadow-red-900/20">
                  <ShieldCheck size={24} />
                </div>
                <span className="font-black text-white uppercase tracking-tighter text-2xl">
                  VOTE<span className="text-red-600">CORE</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
                A high-fidelity digital infrastructure designed to empower student voices through 
                secure, transparent, and direct collective decision-making.
              </p>
              <div className="inline-flex items-center gap-2 w-fit px-4 py-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <Circle className="fill-green-500 text-green-500 animate-pulse" size={8} />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Registry Active</span>
              </div>
            </div>

            {/* DIRECTORY */}
            <div className="md:col-span-2">
              <h4 className="font-black text-white uppercase text-[11px] tracking-[0.2em] mb-10 opacity-40">Directory</h4>
              <ul className="space-y-6">
                {['Home', 'Voting', 'Results', 'About'].map((item) => (
                  <li key={item}>
                    <button onClick={() => navigate(`/${item.toLowerCase()}`)} className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-red-600 transition-all flex items-center gap-3 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-red-600 transition-all" />
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* ENGINEERING */}
            <div className="md:col-span-4">
              <h4 className="font-black text-white uppercase text-[11px] tracking-[0.2em] mb-10 opacity-40">Engineering</h4>
              <div className="space-y-4">
                <a href="https://gakenye-ndiritu.netlify.app" target="_blank" rel="noopener noreferrer" className="group p-5 rounded-[2rem] bg-white/5 border border-white/10 hover:border-red-600/50 hover:bg-white/[0.07] transition-all duration-500 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-red-500 transition-all">
                      <Code2 size={20} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Developer</span>
                      <span className="text-sm font-black tracking-tight">Gakenye Ndiritu</span>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-500 group-hover:text-red-600 transition-all" />
                </a>
                <div className="p-5 rounded-[2rem] bg-white/5 border border-white/10 flex items-center gap-4 text-white">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
                    <Code2 size={20} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Developer</span>
                    <span className="text-sm font-black tracking-tight">Elizabeth Wanjiku</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SUPPORT */}
            <div className="md:col-span-2 text-white">
              <h4 className="font-black uppercase text-[11px] tracking-[0.2em] mb-10 opacity-40">Support</h4>
              <div className="space-y-6">
                <a href="mailto:support@votecore.edu" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"><Mail size={14} /></div>
                  <span className="text-xs font-black uppercase tracking-widest">Help</span>
                </a>
                <button className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"><Globe size={14} /></div>
                  <span className="text-xs font-black uppercase tracking-widest">Guide</span>
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">© {currentYear} Votecore Project</p>
              <div className="h-1 w-1 bg-slate-700 rounded-full hidden md:block" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                Made with <Heart size={12} className="fill-red-600 text-red-600 animate-pulse" /> in Kenya
              </p>
            </div>
            <button onClick={scrollToTop} className="group flex items-center gap-4 px-8 py-4 bg-red-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-white hover:text-red-600 transition-all shadow-2xl shadow-red-900/20 hover:-translate-y-1">
              Scroll to Top <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;