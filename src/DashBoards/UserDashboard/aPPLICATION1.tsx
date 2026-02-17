// DashBoards/UserDashboard/ApplicationPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Navbar from "../../components/Navbar";
import { 
  useGetMyApplicationsQuery, 
  useGetApplicationByIdQuery,
  useCreateApplicationMutation,
  useUpdateMyApplicationMutation,
  useWithdrawApplicationMutation
} from "../../Features/Apis/ApplicationApi";
import type { ApplicationWithDetails } from "../../Features/Apis/ApplicationApi";

const ApplicationPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { id, action } = params;
  
  const [showForm, setShowForm] = useState(false);
  const [voteType, setVoteType] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [manifesto, setManifesto] = useState("");
  
  // State for real data from database
  const [elections, setElections] = useState<{id: string, title: string}[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>("");
  const [positions, setPositions] = useState<{id: string, title: string}[]>([]);
  const [loadingElections, setLoadingElections] = useState(false);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    statementOfIntent: "",
    manifesto: ""
  });
  const [currentEditingApp, setCurrentEditingApp] = useState<ApplicationWithDetails | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch data using RTK Query
  const { data: myApplications = [], isLoading: loadingList, refetch } = useGetMyApplicationsQuery();
  const { data: singleApplication, isLoading: loadingSingle } = useGetApplicationByIdQuery(id || "", {
    skip: !id
  });

  const [createApplication, { isLoading: isSubmitting }] = useCreateApplicationMutation();
  const [updateApplication, { isLoading: isUpdating }] = useUpdateMyApplicationMutation();
  const [withdrawApplication] = useWithdrawApplicationMutation();

  // Check if user already has an application
  const hasApplication = myApplications.length > 0;
  const userApplication = hasApplication ? myApplications[0] : null;

  // Fetch elections from database
  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoadingElections(true);
        const response = await fetch('http://localhost:5000/api/elections', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch elections: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle different response structures
        const electionsList = data.elections || data.data || data;
        setElections(Array.isArray(electionsList) ? electionsList : []);
        
      } catch (error: any) {
        console.error("❌ Error fetching elections:", error);
        setGeneralError("Failed to load elections. Please refresh the page.");
        toast.error("Could not load elections");
      } finally {
        setLoadingElections(false);
      }
    };

    // Only fetch when form is shown
    if (showForm || action === 'edit') {
      fetchElections();
    }
  }, [showForm, action]);

  // Fetch positions when election is selected
  useEffect(() => {
    const fetchPositions = async () => {
      if (!selectedElection) {
        setPositions([]);
        return;
      }
      
      try {
        setLoadingPositions(true);
        
        const response = await fetch(`http://localhost:5000/api/positions/election/${selectedElection}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.status === 404) {
          setPositions([]);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch positions: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle different response structures
        const positionsList = data.positions || data;
        setPositions(Array.isArray(positionsList) ? positionsList : []);
        
      } catch (error: any) {
        console.error("❌ Error fetching positions:", error);
        toast.error("Failed to load positions");
        setPositions([]);
      } finally {
        setLoadingPositions(false);
      }
    };

    fetchPositions();
  }, [selectedElection]);

  // Set form values when editing
  useEffect(() => {
    if (action === 'edit' && singleApplication) {
      setVoteType("CISLU_VOTE");
      setSelectedElection(singleApplication.electionId);
      setPosition(singleApplication.positionId);
      setDescription(singleApplication.statementOfIntent);
      setManifesto(singleApplication.manifesto);
      setShowForm(true);
    }
  }, [action, singleApplication]);

  // Helper to clear field errors
  const handleFieldChange = (field: string, value: string, setter: Function) => {
    setter(value);
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle edit click
  const handleEditClick = (app: ApplicationWithDetails) => {
    setCurrentEditingApp(app);
    setEditFormData({
      statementOfIntent: app.statementOfIntent,
      manifesto: app.manifesto
    });
    setIsEditing(true);
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setIsEditing(false);
    setCurrentEditingApp(null);
    setEditFormData({ statementOfIntent: "", manifesto: "" });
  };

  // Handle edit save
  const handleEditSave = async () => {
    if (!currentEditingApp) return;
    
    try {
      const result = await updateApplication({
        id: currentEditingApp.id,
        updates: {
          statementOfIntent: editFormData.statementOfIntent,
          manifesto: editFormData.manifesto,
        }
      }).unwrap();
      
      toast.success("✅ Application updated successfully!", {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#10b981',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
        icon: '✏️'
      });
      
      setIsEditing(false);
      setCurrentEditingApp(null);
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to update application", {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFieldErrors({});
    setGeneralError("");
    setShowSuccessMessage(false);
    
    // Validation
    if (voteType !== "CISLU_VOTE") {
      toast.error("Please select CISLU VOTE");
      return;
    }

    if (!selectedElection) {
      setFieldErrors(prev => ({ ...prev, electionId: "Please select an election" }));
      toast.error("Please select an election");
      return;
    }

    if (!position) {
      setFieldErrors(prev => ({ ...prev, positionId: "Please select a position" }));
      toast.error("Please select a position");
      return;
    }

    if (description.length < 20) {
      setFieldErrors(prev => ({ 
        ...prev, 
        statementOfIntent: "Statement must be at least 20 characters" 
      }));
      toast.error("Description too short");
      return;
    }

    // Now using real UUIDs from database
    const applicationData = {
      userId: user.id,
      electionId: selectedElection,
      positionId: position,
      statementOfIntent: description,
      manifesto: manifesto,
    };

    try {
      if (action === 'edit' && id) {
        const result = await updateApplication({
          id,
          updates: {
            statementOfIntent: description,
            manifesto: manifesto,
          }
        }).unwrap();
        
        toast.success("✅ Application updated successfully!", {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#10b981',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
          icon: '✏️'
        });
        
        setShowForm(false);
        resetForm();
        refetch();
        navigate('/dashboard/applications');
      } else {
        const result = await createApplication(applicationData).unwrap();
        
        toast.success("✅ Application submitted successfully!", {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#10b981',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
          icon: '🎉'
        });
        
        setShowForm(false);
        resetForm();
        refetch();
      }
      
    } catch (error: any) {
      console.error("❌ Submission error:", error);
      console.error("❌ Error data:", error.data);
      
      // Handle validation errors (400 with errors array)
      if (error.data?.errors && Array.isArray(error.data.errors)) {
        const errors: Record<string, string> = {};
        
        error.data.errors.forEach((err: any) => {
          errors[err.field] = err.message;
          // Show each validation error as a toast
          toast.error(err.message || `${err.field}: ${err.message}`, {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#ef4444',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
            },
          });
        });
        
        setFieldErrors(errors);
      }
      
      // Handle single error message
      else if (error.data?.error) {
        toast.error(error.data.error, {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
        });
        setGeneralError(error.data.error);
      }
      
      // Handle permission errors (403)
      else if (error.status === 403 || error.data?.error?.includes("permission")) {
        const msg = error.data?.error || "Access forbidden: insufficient permissions";
        toast.error(msg, {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
        });
        setGeneralError(msg);
      }
      
      // Handle other errors
      else {
        const errorMsg = error.data?.message || "Failed to submit application";
        toast.error(errorMsg, {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
        });
        setGeneralError(errorMsg);
      }
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    if (window.confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) {
      try {
        const result = await withdrawApplication(applicationId).unwrap();
        
        // Show success toast immediately with green color for success
        toast.success("✅ Application withdrawn successfully!", {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#10b981', // Green for success
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontWeight: 'bold',
          },
          icon: '🗑️'
        });
        
        // Then refetch and reset states
        await refetch();
        setShowForm(false);
        resetForm();
        setIsEditing(false);
        setCurrentEditingApp(null);
        setShowSuccessMessage(false);
        
      } catch (error: any) {
        console.error("❌ Withdraw error:", error);
        toast.error(error.data?.error || "Failed to withdraw application", {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
        });
      }
    }
  };

  const resetForm = () => {
    setVoteType("");
    setSelectedElection("");
    setPosition("");
    setDescription("");
    setManifesto("");
    setFieldErrors({});
    setGeneralError("");
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

  // Render application card
  const renderApplicationCard = (app: ApplicationWithDetails) => (
    <div className="bg-[#0b0e14] border border-slate-800/50 rounded-xl p-6 mb-6 animate-fadeIn">
      {isEditing && currentEditingApp?.id === app.id ? (
        // Edit Mode
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold text-lg">Edit Application</h3>
            <span className={`text-xs px-3 py-1.5 rounded ${getStatusBadge(app.status)}`}>
              {app.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-2">Brief Description</label>
            <textarea
              value={editFormData.statementOfIntent}
              onChange={(e) => setEditFormData({...editFormData, statementOfIntent: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-[#0a0c10] border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f97316]/50"
              placeholder="Brief description..."
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-2">Manifesto</label>
            <textarea
              value={editFormData.manifesto}
              onChange={(e) => setEditFormData({...editFormData, manifesto: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 text-sm bg-[#0a0c10] border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f97316]/50"
              placeholder="Your manifesto..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleEditCancel}
              className="flex-1 bg-transparent border border-slate-600 text-gray-300 py-2.5 rounded-lg hover:bg-slate-800 transition-all text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              disabled={isUpdating}
              className="flex-1 bg-[#f97316] hover:bg-[#ea580c] text-white py-2.5 rounded-lg transition-all text-sm font-semibold disabled:opacity-50"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      ) : (
        // View Mode
        <>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-white text-xl font-bold">Your Application</h2>
              <p className="text-gray-500 text-xs mt-1">
                Submitted on {new Date(app.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`text-xs px-3 py-1.5 rounded ${getStatusBadge(app.status)}`}>
              {app.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0a0c10] rounded-lg p-4 border border-slate-800/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Position</label>
                  <p className="text-white font-medium">{app.position?.title}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Election</label>
                  <p className="text-white font-medium">{app.election?.title}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0c10] rounded-lg p-4 border border-slate-800/50">
              <label className="text-xs text-gray-500 mb-2 block">Brief Description</label>
              <p className="text-white">{app.statementOfIntent}</p>
            </div>

            <div className="bg-[#0a0c10] rounded-lg p-4 border border-slate-800/50">
              <label className="text-xs text-gray-500 mb-2 block">Manifesto</label>
              <p className="text-white whitespace-pre-wrap">{app.manifesto}</p>
            </div>

            {app.status === "pending" && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleEditClick(app)}
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold py-2.5 px-4 rounded-lg transition-all text-sm"
                >
                  Edit Application
                </button>
                <button
                  onClick={() => handleWithdraw(app.id)}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-2.5 px-4 rounded-lg transition-all text-sm"
                >
                  Withdraw Application
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  // Single Application View
  if (id && !action && singleApplication) {
    return (
      <div className="min-h-screen flex flex-col bg-[#07090d]">
        <Navbar />
        <div className="flex-grow w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-8">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/dashboard/applications')}
              className="text-gray-400 hover:text-[#f97316] mb-4 inline-flex items-center gap-1"
            >
              ← Back to Applications
            </button>
            
            <div className="bg-[#0b0e14] border border-slate-800/50 rounded-xl p-6">
              <h1 className="text-2xl font-bold text-white mb-4">Application Details</h1>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500">Position</label>
                  <p className="text-white">{singleApplication.position?.title}</p>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(singleApplication.status)}`}>
                      {singleApplication.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500">Brief Description</label>
                  <p className="text-white">{singleApplication.statementOfIntent}</p>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500">Manifesto</label>
                  <p className="text-white whitespace-pre-wrap">{singleApplication.manifesto}</p>
                </div>
                
                {singleApplication.status === "pending" && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => navigate(`/dashboard/applications/${id}/edit`)}
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold py-2 px-4 rounded-lg transition-all text-sm"
                    >
                      Edit Application
                    </button>
                    <button
                      onClick={() => handleWithdraw(id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-2 px-4 rounded-lg transition-all text-sm"
                    >
                      Withdraw Application
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingList || loadingSingle) {
    return (
      <div className="min-h-screen flex flex-col bg-[#07090d]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  // Main List View
  return (
    <div className="min-h-screen flex flex-col bg-[#07090d]">
      <Navbar />
      
      <div className="flex-grow w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold">
                APPLICATIONS<span className="text-[#f97316]">_PORTAL</span>
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                {hasApplication ? "You have submitted your application" : "No application submitted yet"}
              </p>
            </div>
            
            {/* Only show Create Application button if user has NO application */}
            {!hasApplication && !showForm && !action && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold py-2 px-4 rounded-lg transition-all text-sm sm:text-base flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <span>+</span> Create Application
              </button>
            )}
          </div>

          {/* Show success message ONLY when there's an application AND it was just created */}
          {hasApplication && showSuccessMessage && (
            <div className="mb-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 text-center">
                  ✅ Application submitted successfully! You can view your application below.
                </p>
              </div>
            </div>
          )}

          {/* Show application card if user has an application */}
          {hasApplication && !showForm && !action && userApplication && (
            renderApplicationCard(userApplication)
          )}

          {/* Application Form - Only show if user has NO application OR is editing */}
          {(showForm || action === 'edit') && (!hasApplication || action === 'edit') && (
            <div className="bg-[#0b0e14] border border-slate-800/50 rounded-xl shadow-xl p-4 sm:p-6 mb-8 animate-fadeIn">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/50">
                <h2 className="text-white font-bold">
                  {action === 'edit' ? 'Edit Application' : 'New Application'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                    if (action === 'edit') navigate('/dashboard/applications');
                  }}
                  className="text-gray-500 hover:text-[#f97316] transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Display general error message */}
              {generalError && (
                <div className="mb-4 p-3 bg-red-950/30 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{generalError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Type of Vote <span className="text-[#f97316]">*</span>
                  </label>
                  <select
                    value={voteType}
                    onChange={(e) => {
                      setVoteType(e.target.value);
                      setSelectedElection("");
                      setPosition("");
                    }}
                    className="w-full px-3 py-2.5 text-sm bg-[#0a0c10] border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316] text-white"
                    required
                    disabled={action === 'edit'}
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
                    {/* Election Selection */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Select Election <span className="text-[#f97316]">*</span>
                      </label>
                      {loadingElections ? (
                        <div className="text-gray-400 text-sm py-2">Loading elections...</div>
                      ) : elections.length === 0 ? (
                        <div className="bg-yellow-950/30 border border-yellow-500/20 rounded-lg p-4 text-center">
                          <p className="text-sm text-yellow-400">
                            ⚠️ No elections available
                          </p>
                        </div>
                      ) : (
                        <>
                          <select
                            value={selectedElection}
                            onChange={(e) => {
                              setSelectedElection(e.target.value);
                              setPosition("");
                              if (fieldErrors.electionId) {
                                setFieldErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.electionId;
                                  return newErrors;
                                });
                              }
                            }}
                            className={`w-full px-3 py-2.5 text-sm bg-[#0a0c10] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316] text-white ${
                              fieldErrors.electionId ? 'border-red-500' : 'border-slate-800'
                            }`}
                            required
                            disabled={action === 'edit'}
                          >
                            <option value="">Choose an election</option>
                            {elections.map((elec) => (
                              <option key={elec.id} value={elec.id}>
                                {elec.title}
                              </option>
                            ))}
                          </select>
                          {fieldErrors.electionId && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.electionId}</p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Position Selection */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Select Position <span className="text-[#f97316]">*</span>
                      </label>
                      {!selectedElection ? (
                        <div className="text-gray-400 text-sm py-2">Please select an election first</div>
                      ) : loadingPositions ? (
                        <div className="text-gray-400 text-sm py-2">Loading positions...</div>
                      ) : positions.length === 0 ? (
                        <div className="bg-yellow-950/30 border border-yellow-500/20 rounded-lg p-4 text-center">
                          <p className="text-sm text-yellow-400">
                            ⚠️ No positions available for this election yet
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Please check back later or contact the administrator
                          </p>
                        </div>
                      ) : (
                        <>
                          <select
                            value={position}
                            onChange={(e) => handleFieldChange('positionId', e.target.value, setPosition)}
                            className={`w-full px-3 py-2.5 text-sm bg-[#0a0c10] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316] text-white ${
                              fieldErrors.positionId ? 'border-red-500' : 'border-slate-800'
                            }`}
                            required
                            disabled={action === 'edit'}
                          >
                            <option value="">Choose a position</option>
                            {positions.map((pos) => (
                              <option key={pos.id} value={pos.id}>
                                {pos.title}
                              </option>
                            ))}
                          </select>
                          {fieldErrors.positionId && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.positionId}</p>
                          )}
                        </>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Brief Description <span className="text-[#f97316]">*</span>
                        <span className="text-gray-500 text-xs ml-2">(min. 20 characters)</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => handleFieldChange('statementOfIntent', e.target.value, setDescription)}
                        rows={3}
                        className={`w-full px-3 py-2.5 text-sm bg-[#0a0c10] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316] resize-none text-white placeholder-gray-600 ${
                          fieldErrors.statementOfIntent ? 'border-red-500' : 'border-slate-800'
                        }`}
                        placeholder="Tell us a little about yourself..."
                        required
                      />
                      {fieldErrors.statementOfIntent && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.statementOfIntent}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Manifesto <span className="text-[#f97316]">*</span>
                      </label>
                      <textarea
                        value={manifesto}
                        onChange={(e) => handleFieldChange('manifesto', e.target.value, setManifesto)}
                        rows={4}
                        className={`w-full px-3 py-2.5 text-sm bg-[#0a0c10] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316] resize-none text-white placeholder-gray-600 ${
                          fieldErrors.manifesto ? 'border-red-500' : 'border-slate-800'
                        }`}
                        placeholder="Share your vision, goals, and plans..."
                        required
                      />
                      {fieldErrors.manifesto && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.manifesto}</p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          resetForm();
                          if (action === 'edit') navigate('/dashboard/applications');
                        }}
                        className="flex-1 bg-transparent border border-slate-700 hover:border-slate-600 text-gray-300 font-semibold py-2.5 px-4 rounded-lg transition-all text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || isUpdating}
                        className="flex-1 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold py-2.5 px-4 rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting || isUpdating ? "Saving..." : action === 'edit' ? "Update Application" : "Submit Application"}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          )}

          {/* Show message if user has application but tries to create new one */}
          {hasApplication && !showForm && !action && (
            <div className="bg-blue-950/30 border border-blue-500/20 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-white text-lg font-semibold mb-2">
                You Already Have an Application
              </h3>
              <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">
                You can only submit one application. If you need to make changes, you can edit or withdraw your existing application.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    if (userApplication) handleEditClick(userApplication);
                  }}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold py-2 px-6 rounded-lg transition-all text-sm"
                >
                  Edit Application
                </button>
                <button
                  onClick={() => userApplication && handleWithdraw(userApplication.id)}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-2 px-6 rounded-lg transition-all text-sm"
                >
                  Withdraw Application
                </button>
              </div>
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

export default ApplicationPage;