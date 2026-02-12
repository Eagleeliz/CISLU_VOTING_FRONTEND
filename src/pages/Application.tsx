import { useState } from "react";
import Navbar from "../components/Navbar";

const ApplicationsPage = () => {
  const [voteType, setVoteType] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [manifesto, setManifesto] = useState("");

  const positions = [
    "Position 1",
    "Position 2",
    "Position 3",
    "Position 4",
    "Position 5",
    "Position 6"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      voteType,
      position,
      description,
      manifesto
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Fully responsive container */}
      <div className="flex-grow w-full px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24">
        <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
          
          {/* Responsive card */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 md:p-6 lg:p-8">
            
            {/* Responsive header - REDUCED on mobile */}
           <h1 className="text-black text-sm sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 break-words">
  APPLICATION<span className="text-red-500">_FORM</span>
</h1>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
              
              {/* Type of Vote Dropdown */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-1.5 md:mb-2">
                  Type of Vote <span className="text-red-500">*</span>
                </label>
                <select
                  value={voteType}
                  onChange={(e) => {
                    setVoteType(e.target.value);
                    setPosition("");
                    setDescription("");
                    setManifesto("");
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent bg-white text-black"
                  required
                >
                  <option value="" className="text-gray-500 text-sm sm:text-base">Select vote type</option>
                  <option value="CISLU_VOTE" className="text-black text-sm sm:text-base">CISLU VOTE</option>
                  <option value="OTHER" className="text-black text-sm sm:text-base">Other</option>
                </select>
              </div>

              {/* Show this message if OTHER is selected */}
              {voteType === "OTHER" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-5 md:p-6 text-center animate-fadeIn">
                  <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3">😕</div>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-red-700 mb-1 sm:mb-2">
                    Oops, no other votes available at the moment
                  </h3>
                  <p className="text-xs sm:text-sm text-red-600">
                    Please select <span className="font-bold">CISLU VOTE</span> to continue with your application.
                  </p>
                </div>
              )}

              {/* Show ALL application fields ONLY if CISLU VOTE is selected */}
              {voteType === "CISLU_VOTE" && (
                <>
                  {/* Position Dropdown */}
                  <div className="animate-fadeIn">
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-1.5 md:mb-2">
                      Select Position <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent bg-white text-black"
                      required
                    >
                      <option value="" className="text-gray-500 text-sm sm:text-base">Choose a position</option>
                      {positions.map((pos) => (
                        <option key={pos} value={pos} className="text-black text-sm sm:text-base">
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brief Description */}
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-1.5 md:mb-2">
                      Write a brief description about you <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={window.innerWidth < 640 ? 3 : 4}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent resize-none bg-white text-black placeholder:text-gray-400 placeholder:text-sm sm:placeholder:text-base"
                      placeholder="Tell us a little about yourself..."
                      required
                    />
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                      Maximum 500 characters
                    </p>
                  </div>

                  {/* Manifesto */}
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-1.5 md:mb-2">
                      Manifesto <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={manifesto}
                      onChange={(e) => setManifesto(e.target.value)}
                      rows={window.innerWidth < 640 ? 4 : 6}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent resize-none bg-white text-black placeholder:text-gray-400 placeholder:text-sm sm:placeholder:text-base"
                      placeholder="Share your vision, goals, and plans for the position..."
                      required
                    />
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                      Maximum 1000 characters
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 sm:pt-4 md:pt-6">
                    <button
                      type="submit"
                      className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 md:px-6 rounded-lg transition duration-200 text-sm sm:text-base md:text-lg shadow-md hover:shadow-lg transform hover:scale-[1.01] sm:hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Submit Application
                    </button>
                  </div>
                </>
              )}

              {/* Form footer note - Only show if a vote type is selected */}
              {voteType && (
                <p className="text-xs sm:text-sm text-gray-400 text-center mt-3 sm:mt-4">
                  All fields marked with <span className="text-red-500">*</span> are required
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ApplicationsPage;