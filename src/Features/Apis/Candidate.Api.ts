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
     * Fetch Entire Club Ballot (All candidates in an election)
     * GET /candidates/election/:electionId
     */
    getCandidatesByElection: builder.query<CandidatesResponse, string>({
      query: (electionId) => `candidates/election/${electionId}`,
      providesTags: ["Candidates"],
    }),

    /**
     * Fetch Ballot by Specific Position
     * GET /candidates/election/:electionId/position/:positionId
     */
    getCandidatesByPosition: builder.query<CandidatesResponse, { electionId: string; positionId: string }>({
      query: ({ electionId, positionId }) => 
        `candidates/election/${electionId}/position/${positionId}`,
      providesTags: ["Candidates"],
    }),

    /**
     * View Candidate Detailed Profile
     * GET /candidates/:candidateId
     */
    getCandidateById: builder.query<SingleCandidateResponse, string>({
      query: (id) => `candidates/${id}`,
      providesTags: ["Candidates"],
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