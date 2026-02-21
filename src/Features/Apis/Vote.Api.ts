import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// --- TYPES FOR THE VOTING API ---

export interface VoteSelection {
  positionId: string;
  candidateId: string;
}

export interface CastVoteRequest {
  electionId: string;
  positionId: string;
  candidateId: string;
}

export interface BulkBallotRequest {
  electionId: string;
  selections: VoteSelection[];
}

/**
 * UPDATED: Matches the backend Controller response exactly.
 * Handles both Single (verificationReceipt) and Bulk (receipts array) responses.
 */
export interface VoteReceiptResponse {
  success: boolean;
  message: string;
  verificationReceipt?: string; // For single votes
  receipts?: string[];         // For bulk votes
  castAt?: string;             // Sent from backend
}

export interface ResultEntry {
  id: string;
  fullName: string;
  ballotNumber: string;
  role: string;
  tally: number;
  percentage: string;
  receipts: string[];
}

export const votesApi = createApi({
  reducerPath: "votesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://cislu-voting-app-backend.onrender.com/api/votes",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["VoteProgress", "Results", "Analytics"],
  endpoints: (builder) => ({
    
    // 1. CAST A SINGLE VOTE
    castVote: builder.mutation<VoteReceiptResponse, CastVoteRequest>({
      query: (body) => ({
        url: "/cast",
        method: "POST",
        body,
      }),
      invalidatesTags: ["VoteProgress", "Results"],
    }),

    // 2. BULK BALLOT SUBMISSION
    submitBulkBallot: builder.mutation<VoteReceiptResponse, BulkBallotRequest>({
      query: (body) => ({
        url: "/bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: ["VoteProgress", "Results"],
    }),

    // 3. VERIFY VOTE VIA RECEIPT
    verifyVoteReceipt: builder.mutation<any, { receipt: string }>({
      query: (body) => ({
        url: "/verify",
        method: "POST",
        body,
      }),
    }),

    /**
     * 4. GET MY VOTING PROGRESS
     * Backend returns: { votedPositionIds: string[] }
     */
    getVotingProgress: builder.query<string[], string>({
      query: (electionId) => `/progress/${electionId}`,
      // Transform response so the component receives just the array
      transformResponse: (response: { votedPositionIds: string[] }) => response.votedPositionIds,
      providesTags: ["VoteProgress"],
    }),

    // 5. VIEW LIVE POSITION RESULTS
    getPositionResults: builder.query<ResultEntry[], string>({
      query: (positionId) => `/results/position/${positionId}`,
      providesTags: (_result, _error, id) => [{ type: "Results", id }],
    }),

    // 6. GET FULL ELECTION ANALYTICS
    getElectionAnalytics: builder.query<any, string>({
      query: (electionId) => `/analytics/election/${electionId}`,
      providesTags: ["Analytics"],
    }),

    // 7. GET CANDIDATE PERFORMANCE SCORECARD
    getCandidateScorecard: builder.query<any, string>({
      query: (candidateId) => `/analytics/candidate/${candidateId}`,
    }),

    // 8. OFFICIAL ELECTION WINNERS
    getElectionWinners: builder.query<any, string>({
      query: (electionId) => `/winners/${electionId}`,
    }),
  }),
});

export const {
  useCastVoteMutation,
  useSubmitBulkBallotMutation,
  useVerifyVoteReceiptMutation,
  useGetVotingProgressQuery,
  useGetPositionResultsQuery,
  useGetElectionAnalyticsQuery,
  useGetCandidateScorecardQuery,
  useGetElectionWinnersQuery,
} = votesApi;