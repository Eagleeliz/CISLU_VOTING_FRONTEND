import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Mail, GraduationCap, 
  Calendar, Award,  ChevronLeft,
  Fingerprint, CheckCircle, Quote,
  BookOpen, Hash, Verified, AlertCircle
} from "lucide-react";
import { useGetApplicationDetailsQuery } from "../Features/Apis/CandidatesApplication.Api";
import Navbar from "../components/Navbar";

const CandidateProfileView = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  const { data: detail, isLoading, isError } = useGetApplicationDetailsQuery(applicationId || "", {
    skip: !applicationId
  });

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="w-14 h-14 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-4" />
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Profile...</p>
    </div>
  );

  if (isError || !detail) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
      <div className="text-center bg-white p-12 rounded-[2rem] shadow-xl border border-slate-100 max-w-md">
        <AlertCircle className="text-red-600 mx-auto mb-6" size={48} />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
        <p className="text-slate-500 mb-8">We couldn't find the details for this candidate. They might have been removed or the link is broken.</p>
        <button 
            onClick={() => navigate('/Candidates')} 
            className="w-full bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all"
        >
          Go back to Candidates
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 pb-20">
      <Navbar />
      <div className="pt-24"> 
        
        {/* NAVIGATION BAR */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <button 
              onClick={() => navigate('/Candidates')}
              className="group flex items-center gap-3 text-slate-100 hover:text-red-600 transition-all"
            >
              <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-red-50 transition-colors">
                <ChevronLeft size={20} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Go back to Candidates</span>
            </button>
            
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
              <CheckCircle size={14} className="text-green-600" />
              <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">
                Verified Candidate
              </span>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT SIDE: PHOTO AND INFO */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm sticky top-40">
                <div className="flex flex-col items-center">
                  <div className="relative mb-8">
                    <img 
                      src={detail.imageUrl || `https://ui-avatars.com/api/?name=${detail.user?.fullName}`} 
                      className="w-48 h-48 rounded-[2.5rem] object-cover shadow-2xl border-4 border-white relative z-10"
                      alt="Candidate"
                    />
                    <div className="absolute -bottom-3 -right-3 bg-red-600 text-white p-4 rounded-2xl shadow-xl z-20 border-4 border-white">
                      <Fingerprint size={24} />
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-black text-center uppercase text-slate-900 leading-tight mb-3">
                    {detail.user?.fullName}
                  </h2>
                  
                  <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl shadow-lg">
                     <Award size={14} className="text-red-500" />
                     <p className="text-xs font-black uppercase tracking-widest">{detail.position?.title}</p>
                  </div>
                </div>

                <div className="mt-10 space-y-3">
                  <DetailBox icon={<Hash size={16}/>} title="Registration Number" value={detail.user?.studentRegNo} />
                  <DetailBox icon={<Mail size={16}/>} title="Email Address" value={detail.user?.email} />
                  <DetailBox icon={<GraduationCap size={16}/>} title="Year of Study" value={`Year ${detail.user?.yearOfStudy}`} />
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: MANIFESTO */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* BIG QUOTE BOX */}
              <div className="bg-slate-900 text-white rounded-[3rem] p-10 md:p-14 relative overflow-hidden shadow-2xl">
                <Quote className="absolute -top-6 -right-6 text-white/5" size={200} />
                <div className="relative">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-8">Main Goal</h3>
                  <p className="text-2xl md:text-3xl font-bold italic leading-snug text-white/95">
                    "{detail.statementOfIntent}"
                  </p>
                </div>
              </div>

              {/* FULL MANIFESTO */}
              <div className="bg-white border border-slate-200 rounded-[3rem] p-10 md:p-14 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><BookOpen size={20} className="text-red-600"/></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">My Manifesto</h3>
                </div>
                <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                  <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-line font-medium">
                    {detail.manifesto}
                  </p>
                </div>
              </div>

              {/* ADMIN NOTES */}
              <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-900 mb-4 flex items-center gap-2">
                  <Verified size={16} /> Official Verification Note
                </h3>
                <p className="text-blue-900/80 italic text-base mb-6">"{detail.adminRemarks}"</p>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                     {detail.reviewer?.fullName?.charAt(0)}
                   </div>
                   <p className="text-xs font-bold text-blue-900">Verified by {detail.reviewer?.fullName}</p>
                </div>
              </div>

              {/* FINAL VOTE BUTTON */}
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-4 rounded-2xl text-slate-900"><Calendar size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Election Name</p>
                    <p className="text-base font-black text-slate-900 uppercase tracking-tight">{detail.election?.title}</p>
                  </div>
                </div>

                <button 
                  disabled={detail.status !== 'approved'}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-slate-200 text-white font-black px-12 py-5 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {detail.status === 'approved' ? (
                    <>VOTE FOR THIS CANDIDATE <CheckCircle size={20}/></>
                  ) : (
                    'VOTING CLOSED'
                  )}
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

// Helper component for the info boxes
const DetailBox = ({ icon, title, value }: { icon: React.ReactNode, title: string, value?: any }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-white transition-all">
    <div className="text-slate-400 group-hover:text-red-500 transition-colors">{icon}</div>
    <div className="min-w-0">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
      <p className="text-sm font-bold text-slate-800 truncate">{value || 'Not available'}</p>
    </div>
  </div>
);

export default CandidateProfileView;