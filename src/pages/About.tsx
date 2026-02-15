import React from "react";
import { 
  ShieldCheck, 
  Users, 
  ChevronRight,
  CheckCircle2,
  LayoutGrid,
  Touchpad,
  Clock,
  BarChart3,
  ArrowRight
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const AboutPage = () => {
  const navigate = useNavigate();
  
  const principles = [
    {
      icon: <Users className="text-red-600" size={24} />,
      title: "Student Focused",
      desc: "Designed specifically for our student body, making it easier than ever to learn about candidates."
    },
    {
      icon: <CheckCircle2 className="text-red-600" size={24} />,
      title: "Fair & Equal",
      desc: "System ensures fairness by linking votes to student accounts, guaranteeing one equal voice."
    },
    {
      icon: <BarChart3 className="text-red-600" size={24} />,
      title: "Fast Results",
      desc: "Automated counting eliminates human error, delivering reliable results once polls close."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFE]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        
        {/* HERO SECTION - Optimized for Mobile Spacing */}
        <section className="bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-20 text-white relative overflow-hidden mb-12 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <LayoutGrid size={200} className="md:w-[300px]" />
          </div>
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-block bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full mb-6">
               <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">Simple & Direct</p>
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-[0.95] mb-6">
              Modern Voting <br className="hidden md:block" /> For <span className="text-red-500">Everyone.</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed max-w-2xl">
              We've built a streamlined platform to make student elections accessible. 
              No paper, no hassle—just a clear digital polling station.
            </p>
          </div>
        </section>

        {/* CORE PRINCIPLES - Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-20 md:mb-32">
          {principles.map((item, index) => (
            <div key={index} className="bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                {item.icon}
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-3">{item.title}</h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* WORKFLOW SECTION - Redesigned for Mobile Flow */}
        <section className="mb-20 md:mb-32">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            <div className="w-full lg:flex-1">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3">The Workflow</p>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-10">How to Cast <br />Your Ballot</h2>
              
              <div className="relative">
                {/* Vertical Line for Mobile Timeline */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100 md:hidden" />
                
                <div className="space-y-10">
                  {[
                    { label: "Sign In", text: "Log in with your student credentials to access your dashboard." },
                    { label: "Browse", text: "Review the profiles and manifestos of everyone running." },
                    { label: "Select", text: "Choose your preferred candidate for each available position." },
                    { label: "Submit", text: "Verify your choices and submit directly to the secure box." }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-6 items-start relative">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center z-10 border-4 border-[#FBFBFE]">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">{step.label}</h4>
                        <p className="text-slate-500 text-xs md:text-sm">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Element - Hidden on very small screens to save space */}
            <div className="hidden sm:flex flex-1 w-full bg-slate-100 rounded-[3rem] md:rounded-[4rem] aspect-square relative overflow-hidden items-center justify-center">
               <Touchpad size={80} className="text-slate-300 animate-bounce" />
               <div className="absolute inset-0 border-[20px] md:border-[32px] border-[#FBFBFE] rounded-[3rem] md:rounded-[4rem]" />
               
               <div className="absolute bottom-6 md:bottom-12 right-6 md:right-12 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Election Status</p>
                    <p className="text-[10px] font-bold text-slate-900 uppercase">Live & Active</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION - Mobile Optimized Padding */}
        <section className="bg-white border-[3px] border-slate-900 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600" />
          
          <h2 className="text-2xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">Make your <br className="md:hidden" /> voice heard.</h2>
          <p className="text-slate-500 text-sm md:text-lg max-w-xl mx-auto mb-8 font-medium leading-relaxed">
            Elections are the cornerstone of leadership. Support the candidates 
            you believe will represent you best.
          </p>
          <button 
            onClick={() => navigate("/voting")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95"
          >
            Start Voting Now <ArrowRight size={16} />
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;