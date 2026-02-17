import * as React from "react";
import {
  useGetMeQuery,
  useCheckEligibilityQuery,
} from "../../Features/Apis/Users.Api";

import Navbar from "../../components/Navbar";

import  {
  User,
  Mail,
  ShieldCheck,
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
} from "lucide-react";

import type  {
  LucideIcon,
} from "lucide-react";
/* -------------------------------
   INFO BLOCK TYPES
-------------------------------- */
type InfoBlockProps = {
  icon: LucideIcon; // ✅ Correct icon type
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
      {/* ✅ Correct icon rendering */}
      <Icon
        size={16}
        className="text-slate-300 group-hover:text-red-500 transition-colors"
      />

      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </p>
    </div>

    <p
      className={`text-xl font-bold tracking-tight ${
        highlight ? "text-red-600 uppercase" : "text-slate-900"
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
  // 1️⃣ Fetch main profile data
  const {
    data: user,
    isLoading: profileLoading,
    isFetching: profileFetching,
    error: profileError,
  } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // 2️⃣ Debug logs
  React.useEffect(() => {
    console.log("--- Profile Page Sync ---");
    console.log("Loading:", profileLoading, "Fetching:", profileFetching);
    console.log("Error:", profileError);
    console.log("User Data:", user);
  }, [profileLoading, profileFetching, profileError, user]);

  // 3️⃣ Fetch Eligibility (skip if user not loaded yet)
  const { data: eligibility, isLoading: eligibilityLoading } =
    useCheckEligibilityQuery(
      {
        userId: user?.id || "",
        requiredPoints: 10,
      },
      {
        skip: !user?.id,
      }
    );

  // 4️⃣ Handle Errors
  if (profileError) {
    const errMsg =
      (profileError as any)?.data?.error ||
      "Session expired. Please login again.";

    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FBFBFE] p-6">
        <XCircle className="text-red-600 mb-4" size={48} />

        <h2 className="text-2xl font-black uppercase tracking-tighter">
          Access Denied
        </h2>

        <p className="text-slate-500 mb-6 text-center max-w-md">{errMsg}</p>

        <button
          onClick={() => (window.location.href = "/login")}
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all"
        >
          Back to Login
        </button>
      </div>
    );
  }

  // 5️⃣ Loading State
  if (profileLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FBFBFE]">
        <Loader2 className="animate-spin text-red-600 mb-4" size={40} />

        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Syncing Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFE]">
      <Navbar />

      <main className="max-w-5xl mx-auto pt-32 px-6 pb-24">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-2">
              Member Portal
            </p>

            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              {user?.fullName?.split(" ")[0] || "User"}
              's <span className="text-red-600">Profile.</span>
            </h1>
          </div>

          <div className="bg-white border border-slate-100 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3">
            <Calendar className="text-slate-400" size={18} />

            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
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
            <div className="bg-indigo-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-950/30">
              <Award className="absolute -right-6 -bottom-6 text-white/10" size={180} />

              <div className="relative z-10">
                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-2">
                  Participation Score
                </p>

                <h3 className="text-6xl font-black mb-1">
                  {user?.participationPoints || 0}
                </h3>

                <div className="h-1 w-12 bg-red-600 mb-4" />

                <p className="text-xs font-medium text-indigo-200 leading-relaxed">
                  Earn points by attending meetings and verifying your activity.
                </p>
              </div>
            </div>

            {/* Eligibility */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                Voting Eligibility
              </p>

              {eligibilityLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin text-slate-300" size={16} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
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
                      <p className="font-black text-slate-900 uppercase text-sm leading-none">
                        {eligibility?.eligible
                          ? "Eligible to Run"
                          : "Not Eligible"}
                      </p>

                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                        {eligibility?.eligible
                          ? "Requirement Met"
                          : eligibility?.reason || "Points below threshold"}
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
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
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                {/* ✅ FIXED ICON USAGE */}
                <InfoBlock icon={User} label="Full Name" value={user?.fullName} />
                <InfoBlock icon={ShieldCheck} label="Reg Number" value={user?.studentRegNo} />
                <InfoBlock icon={Mail} label="Email" value={user?.email} />
                <InfoBlock
                  icon={GraduationCap}
                  label="Academic Year"
                  value={user?.yearOfStudy ? `Year ${user.yearOfStudy}` : "N/A"}
                />
                <InfoBlock icon={Award} label="Current Role" value={user?.role} highlight />
                <InfoBlock
                  icon={CheckCircle2}
                  label="Standing"
                  value={user?.isGoodStanding ? "Active" : "Under Review"}
                />
              </div>

              <div className="mt-16 pt-8 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase max-w-xs text-center md:text-left">
                  Account verified. Security status:{" "}
                  {user?.isLocked ? "LOCKED" : "SECURE"}
                </p>

                <button className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-2xl hover:bg-red-600 transition-all active:scale-95 shadow-lg">
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