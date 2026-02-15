import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Mail, 
  Globe,
  Circle,
  ChevronRight,
  ArrowUp,
  Heart,
  Code2,
  ExternalLink,
  Layers
} from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-20">
      {/* Background Layer with subtle tint and soft top shadow */}
      <div className="absolute inset-0 bg-[#F8FAFC] pointer-events-none border-t border-slate-200/60 shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.05)]" />

      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          
          {/* BRAND & STATUS - 4 Columns */}
          <div className="md:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2.5 rounded-[1.25rem] text-white shadow-xl shadow-slate-900/20">
                <ShieldCheck size={24} />
              </div>
              <span className="font-black text-slate-900 uppercase tracking-tighter text-2xl">
                VOTE<span className="text-red-600">CORE</span>
              </span>
            </div>
            
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs font-medium">
              A high-fidelity digital infrastructure designed to empower student voices through 
              secure, transparent, and direct collective decision-making.
            </p>

            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 w-fit px-4 py-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                <Circle className="fill-green-500 text-green-500 animate-pulse" size={8} />
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                  Registry Active
                </span>
              </div>
            </div>
          </div>

          {/* NAVIGATION - 2 Columns */}
          <div className="md:col-span-2">
            <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-[0.2em] mb-10 opacity-40">Directory</h4>
            <ul className="space-y-6">
              {['Home', 'Voting', 'Results', 'About'].map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => navigate(`/${item.toLowerCase()}`)}
                    className="text-slate-600 text-xs font-black uppercase tracking-widest hover:text-red-600 transition-all flex items-center gap-3 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-red-600 group-hover:scale-125 transition-all" />
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* DEVELOPERS - 4 Columns */}
          <div className="md:col-span-4">
            <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-[0.2em] mb-10 opacity-40">Engineering</h4>
            <div className="space-y-4">
              {/* Gakenye Card */}
              <a 
                href="https://gakenye-ndiritu.netlify.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group p-5 rounded-[2rem] bg-white border border-slate-200/50 hover:border-red-200 shadow-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 transition-all duration-500">
                    <Code2 size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Developer</span>
                    <span className="text-sm font-black text-slate-800 tracking-tight">Gakenye Ndiritu</span>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-300 group-hover:text-red-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>

              {/* Elizabeth Card */}
              <div className="p-5 rounded-[2rem] bg-white border border-slate-200/50 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Code2 size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Developer</span>
                  <span className="text-sm font-black text-slate-800 tracking-tight">Elizabeth Wanjiku</span>
                </div>
              </div>
            </div>
          </div>

          {/* SYSTEM LINKS - 2 Columns */}
          <div className="md:col-span-2">
            <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-[0.2em] mb-10 opacity-40">Support</h4>
            <div className="space-y-6">
              <a href="mailto:support@votecore.edu" className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center shadow-sm">
                  <Mail size={14} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Help</span>
              </a>
              <button className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center shadow-sm">
                  <Globe size={14} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Guide</span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR SECTION */}
        <div className="pt-12 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              © {currentYear} Votecore Project
            </p>
            <div className="h-1 w-1 bg-slate-300 rounded-full hidden md:block" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              Made with <Heart size={12} className="fill-red-600 text-red-600 animate-pulse" /> in Kenya
            </p>
          </div>
          
          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-4 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-2xl shadow-slate-900/20 hover:shadow-red-500/30 hover:-translate-y-1 active:scale-95"
          >
            Scroll to Top <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;