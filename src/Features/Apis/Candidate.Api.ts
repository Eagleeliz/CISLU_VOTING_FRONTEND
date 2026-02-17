import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// --- TYPES ---
export interface Candidate {
  id: string;
  fullName: string;
  studentRegNo: string;
  ballotNumber: number;
  manifesto: string;
  profileImage: string;
  positionId: string;
  electionId: string;
  isDisqualified: boolean;
  disqualificationReason?: string;
  // Included fields for UI details
  userId: string;
  applicationId: string;
}

interface CandidatesResponse {
  success: boolean;
  candidates: Candidate[];
}

interface SingleCandidateResponse {
  success: boolean;
  candidate: Candidate;
}

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5000/api/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

export const candidateApi = createApi({
  reducerPath: "candidateApi",
  baseQuery,
  tagTypes: ["Candidates"],
  endpoints: (builder) => ({
    
    // --- ADMIN OPERATIONS ---

    /**
     * Promote Approved Application
     * POST /candidates/promote/:targetAppId
     */
    promoteApplication: builder.mutation<{ success: boolean; message: string }, string>({
      query: (targetAppId) => ({
        url: `candidates/promote/${targetAppId}`,
        method: "POST",
      }),
      invalidatesTags: ["Candidates"],
    }),

    /**
     * Disqualify Candidate (Disciplinary)
     * PATCH /candidates/:candidateId/disqualify
     */
    disqualifyCandidate: builder.mutation<any, { candidateId: string; reason: string }>({
      query: ({ candidateId, reason }) => ({
        url: `candidates/${candidateId}/disqualify`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Candidates"],
    }),


    // --- VOTER / GENERAL OPERATIONS ---

    /**
     * Fetch Entire Club Ballot
     * FIXED: Added safety checks to prevent .map() crash
     */
    getCandidatesByElection: builder.query<CandidatesResponse, string>({
      query: (electionId) => `candidates/election/${electionId}`,
      providesTags: (result) => 
        result?.candidates 
          ? [
              ...result.candidates.map(({ id }) => ({ type: 'Candidates' as const, id })), 
              { type: 'Candidates', id: 'LIST' }
            ]
          : [{ type: 'Candidates', id: 'LIST' }],
    }),

    /**
     * Fetch Ballot by Specific Position
     */
    getCandidatesByPosition: builder.query<CandidatesResponse, { electionId: string; positionId: string }>({
      query: ({ electionId, positionId }) => 
        `candidates/election/${electionId}/position/${positionId}`,
      providesTags: (result) => 
        result?.candidates 
          ? [
              ...result.candidates.map(({ id }) => ({ type: 'Candidates' as const, id })), 
              { type: 'Candidates', id: 'POSITION_LIST' }
            ]
          : [{ type: 'Candidates', id: 'POSITION_LIST' }],
    }),

    /**
     * View Candidate Detailed Profile
     */
    getCandidateById: builder.query<SingleCandidateResponse, string>({
      query: (id) => `candidates/${id}`,
      providesTags: (result, error, id) => [{ type: "Candidates", id }],
    }),
  }),
});

export const {
  usePromoteApplicationMutation,
  useDisqualifyCandidateMutation,
  useGetCandidatesByElectionQuery,
  useGetCandidatesByPositionQuery,
  useGetCandidateByIdQuery,
} = candidateApi;