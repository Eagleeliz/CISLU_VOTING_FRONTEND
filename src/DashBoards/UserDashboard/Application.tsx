// DashBoards/UserDashboard/ApplicationsPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Navbar from "../../components/Navbar";
import { 
  useGetMyApplicationsQuery, 
  useCreateApplicationMutation,
  useWithdrawApplicationMutation
} from "../../Features/Apis/Application";
import type { ApplicationWithDetails } from "../../Features/Apis/Application";

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [voteType, setVoteType] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [manifesto, setManifesto] = useState("");

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch user's applications
  const { data: myApplications = [], isLoading, refetch } = useGetMyApplicationsQuery();
  const [createApplication, { isLoading: isSubmitting }] = useCreateApplicationMutation();
  const [withdrawApplication] = useWithdrawApplicationMutation();

  const positions = [
    { id: "pos1", title: "Position 1" },
    { id: "pos2", title: "Position 2" },
    { id: "pos3", title: "Position 3" },
    { id: "pos4", title: "Position 4" },
    { id: "pos5", title: "Position 5" },
    { id: "pos6", title: "Position 6" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (voteType !== "CISLU_VOTE") {
      toast.error("Please select CISLU VOTE");
      return;
    }

    try {
      const result = await createApplication({
        userId: user.id,
        electionId: "current-election-id", // You need to get this dynamically
        positionId: position,
        statementOfIntent: description,
        manifesto: manifesto,
      }).unwrap();

      toast.success(result.message || "Application submitted successfully!");
      
      // Reset form
      setShowForm(false);
      setVoteType("");
      setPosition("");
      setDescription("");
      setManifesto("");
      
      // Refetch applications
      refetch();
      
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to submit application");
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    if (window.confirm("Are you sure you want to withdraw this application?")) {
      try {
        const result = await withdrawApplication(applicationId).unwrap();
        toast.success(result.message || "Application withdrawn");
        refetch();
      } catch (error: any) {
        toast.error(error.data?.error || "Failed to withdraw application");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      under_review: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      approved: "bg-green-500/20 text-green-400 border border-green-500/30",
      rejected: "bg-red-500/20 text-red-400 border border-red-500/30"
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#07090d]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-gray-500">Loading applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#07090d]">
      <Navbar />
      
      <div className="flex-grow w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header with Create Button */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold">
                APPLICATIONS<span className="text-[#f97316]">_PORTAL</span>
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                {myApplications.length} application(s) found
              </p>
            </div>
            
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold py-2 px-4 rounded-lg transition-all text-sm sm:text-base flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <span>+</span> Create Application
              </button>
            )}
          </div>

          {/* Application Form */}
          {showForm && (
            <div className="bg-[#0b0e14] border border-slate-800/50 rounded-xl shadow-xl p-4 sm:p-6 mb-8 animate-fadeIn">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/50">
                <h2 className="text-white font-bold">New Application</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-[#f97316] transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type of Vote Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Type of Vote <span className="text-[#f97316]">*</span>
                  </label>
                  <select
                    value={voteType}
                    onChange={(e) => {
                      setVoteType(e.target.value);
                      setPosition("");
                    }}
                    className="w-full px-3 py-2.5 text-sm bg-[#0a0c10] border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316] text-white"
                    required
                  >
                    <option value="">Select vote type</option>
                    <option value="CISLU_VOTE">CISLU VOTE</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {voteType === "OTHER" && (
                  <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-4 text-center">
                    <p className="text-sm text-red-400">
                      ⚠️ No other votes available at this time
                    </p>
                  </div>
                )}

                {voteType === "CISLU_VOTE" && (
                  <>
                    {/* Position Dropdown */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Select Position <span className="text-[#f97316]">*</span>
                      </label>
                      <select
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-[#0a0c10] border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316] text-white"
                        required
                      >
                        <option value="">Choose a position</option>
                        {positions.map((pos) => (
                          <option key={pos.id} value={pos.id}>
                            {pos.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Brief Description */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Brief Description <span className="text-[#f97316]">*</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2.5 text-sm bg-[#0a0c10] border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316] resize-none text-white placeholder-gray-600"
                        placeholder="Tell us a little about yourself..."
                        required
                      />
                    </div>

                    {/* Manifesto */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Manifesto <span className="text-[#f97316]">*</span>
                      </label>
                      <textarea
                        value={manifesto}
                        onChange={(e) => setManifesto(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2.5 text-sm bg-[#0a0c10] border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316] resize-none text-white placeholder-gray-600"
                        placeholder="Share your vision, goals, and plans..."
                        required
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 bg-transparent border border-slate-700 hover:border-slate-600 text-gray-300 font-semibold py-2.5 px-4 rounded-lg transition-all text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold py-2.5 px-4 rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          )}

          {/* Applications List */}
          {myApplications.length === 0 && !showForm ? (
            // Empty State
            <div className="bg-[#0b0e14] border border-slate-800/50 rounded-xl p-8 sm:p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-white text-lg sm:text-xl font-semibold mb-2">
                No Applications Yet
              </h3>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                You haven't applied for any positions. Start your journey by creating your first application.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold py-2.5 px-6 rounded-lg transition-all text-sm"
              >
                Create Your First Application
              </button>
            </div>
          ) : (
            // Applications Grid
            <div className="grid gap-4 md:grid-cols-2">
              {myApplications.map((app: ApplicationWithDetails) => (
                <div
                  key={app.id}
                  className="bg-[#0b0e14] border border-slate-800/50 rounded-xl p-5 hover:border-slate-700/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-base">
                        {app.position?.title || "Position"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(app.status)}`}>
                      {app.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {app.statementOfIntent}
                  </p>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800/50">
                    <button
                      onClick={() => navigate(`/dashboard/applications/${app.id}`)}
                      className="flex-1 text-xs bg-transparent border border-slate-700 hover:border-[#f97316] text-gray-300 hover:text-[#f97316] py-1.5 px-3 rounded transition-all"
                    >
                      View Details
                    </button>
                    
                    {app.status === "pending" && (
                      <>
                        <button
                          onClick={() => navigate(`/dashboard/applications/${app.id}/edit`)}
                          className="text-xs bg-transparent border border-slate-700 hover:border-blue-500 text-gray-300 hover:text-blue-400 py-1.5 px-3 rounded transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          className="text-xs bg-transparent border border-slate-700 hover:border-red-500 text-gray-300 hover:text-red-400 py-1.5 px-3 rounded transition-all"
                        >
                          Withdraw
                        </button>
                      </>
                    )}
                  </div>

                  {app.adminRemarks && (
                    <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-slate-800/50">
                      Admin: {app.adminRemarks}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ApplicationsPage;