import * as React from "react";
import {
  useGetMeQuery,
  useCheckEligibilityQuery,
} from "../../Features/Apis/Users.Api";

import Navbar from "../../components/Navbar";

import {
  User,
  Mail,
  ShieldCheck,
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------
   INFO BLOCK TYPES
-------------------------------- */
type InfoBlockProps = {
  icon: LucideIcon;
  label: string;
  value?: string;
  highlight?: boolean;
};

/* -------------------------------
   INFO BLOCK COMPONENT
-------------------------------- */
const InfoBlock = ({
  icon: Icon,
  label,
  value,
  highlight = false,
}: InfoBlockProps) => (
  <div className="group">
    <div className="flex items-center gap-2 mb-2">
      <Icon
        size={18}
        className={`group-hover:text-red-500 transition-colors ${
          highlight ? "text-red-600" : "text-white"
        }`}
      />
      <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">
        {label}
      </p>
    </div>

    <p
      className={`text-xl font-bold tracking-tight ${
        highlight ? "text-red-600 uppercase" : "text-white"
      }`}
    >
      {value || "---"}
    </p>
  </div>
);

/* -------------------------------
   PROFILE PAGE
-------------------------------- */
const ProfilePage = () => {
  const {
    data: user,
    isLoading: profileLoading,
    isFetching: profileFetching,
    error: profileError,
  } = useGetMeQuery(undefined, { refetchOnMountOrArgChange: true });

  const { data: eligibility, isLoading: eligibilityLoading } =
    useCheckEligibilityQuery(
      {
        userId: user?.id || "",
        requiredPoints: 10,
      },
      { skip: !user?.id }
    );

  /* -------------------------------
     ERROR STATE
  -------------------------------- */
  if (profileError) {
    const errMsg =
      (profileError as any)?.data?.error ||
      "Session expired. Please login again.";

    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#07090d] p-6">
        <XCircle className="text-red-600 mb-4" size={48} />
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
          Access Denied
        </h2>
        <p className="text-white/70 mb-6 text-center max-w-md">{errMsg}</p>
        <button
          onClick={() => (window.location.href = "/login")}
          className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-500 transition-all"
        >
          Back to Login
        </button>
      </div>
    );
  }

  /* -------------------------------
     LOADING STATE
  -------------------------------- */
  if (profileLoading || profileFetching || eligibilityLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#07090d]">
        <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
          Syncing Profile...
        </p>
      </div>
    );
  }

  /* -------------------------------
     MAIN PAGE
  -------------------------------- */
  return (
    <div className="min-h-screen bg-[#07090d]">
      <Navbar />

      <main className="max-w-5xl mx-auto pt-32 px-6 pb-24">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-2">
              Member Portal
            </p>

            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
              {user?.fullName?.split(" ")[0] || "User"}
              's <span className="text-red-600">Profile.</span>
            </h1>
          </div>

          <div className="bg-[#0b0e14] border border-slate-800 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3">
            <Calendar className="text-red-600" size={18} />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              Joined{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-4 space-y-6">
            {/* Points */}
            <div className="bg-[#0b0e14] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-black/30">
              <Award
                className="absolute -right-6 -bottom-6 text-white/10"
                size={180}
              />
              <div className="relative z-10">
                <p className="text-red-600 text-[10px] font-black uppercase tracking-widest mb-2">
                  Participation Score
                </p>

                <h3 className="text-6xl font-black mb-1">
                  {user?.participationPoints || 0}
                </h3>

                <div className="h-1 w-12 bg-red-600 mb-4" />

                <p className="text-xs font-medium text-red-300 leading-relaxed">
                  Earn points by attending meetings and verifying your activity.
                </p>
              </div>
            </div>

            {/* Eligibility */}
            <div className="bg-[#0b0e14] rounded-[2.5rem] p-8 border border-slate-800 shadow-sm text-white">
              <p className="text-[10px] font-black uppercase tracking-widest mb-6">
                Voting Eligibility
              </p>

              {eligibilityLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin text-red-600" size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    Checking...
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {eligibility?.eligible ? (
                      <CheckCircle2 className="text-green-500" size={32} />
                    ) : (
                      <XCircle className="text-red-500" size={32} />
                    )}
                    <div>
                      <p className="font-black uppercase text-sm leading-none text-white">
                        {eligibility?.eligible
                          ? "Eligible to Run"
                          : "Not Eligible"}
                      </p>
                      <p className="text-[10px] font-bold mt-1 uppercase text-white/70">
                        {eligibility?.eligible
                          ? "Requirement Met"
                          : eligibility?.reason || "Points below threshold"}
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-4">
                    <div
                      className="bg-red-600 h-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(
                          (user?.participationPoints || 0) * 10,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-8">
            <div className="bg-[#0b0e14] rounded-[2.5rem] p-10 border border-slate-800 shadow-sm h-full text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                <InfoBlock icon={User} label="Full Name" value={user?.fullName} />
                <InfoBlock
                  icon={ShieldCheck}
                  label="Reg Number"
                  value={user?.studentRegNo}
                />
                <InfoBlock icon={Mail} label="Email" value={user?.email} />
                <InfoBlock
                  icon={GraduationCap}
                  label="Academic Year"
                  value={user?.yearOfStudy ? `Year ${user.yearOfStudy}` : "N/A"}
                />
                <InfoBlock
                  icon={Award}
                  label="Current Role"
                  value={user?.role}
                  highlight
                />
                <InfoBlock
                  icon={CheckCircle2}
                  label="Standing"
                  value={user?.isGoodStanding ? "Active" : "Under Review"}
                />
              </div>

              <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-[10px] font-bold uppercase max-w-xs text-center md:text-left text-blue-500">
                  Account verified. Security status: {user?.isLocked ? "LOCKED" : "SECURE"}
                </p>

                <button className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-2xl hover:bg-red-500 transition-all active:scale-95 shadow-lg">
                  Request Data Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;