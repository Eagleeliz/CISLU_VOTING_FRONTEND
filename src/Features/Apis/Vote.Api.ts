import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Types for the Voting API
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

export interface VoteReceiptResponse {
  message: string;
  receipt: string;
  votedAt: string;
}

export interface ResultEntry {
  candidateId: string;
  fullName: string;
  tally: number | string; 
  imageUrl?: string;
  voteCount: number;
  percentage: number;
}

export const votesApi = createApi({
  reducerPath: "votesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/votes",
    prepareHeaders: (headers, { getState }) => {
      // Pull token from your auth state (adjust path based on your store config)
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
    verifyVoteReceipt: builder.mutation<{ valid: boolean; data: any }, { receipt: string }>({
      query: (body) => ({
        url: "/verify",
        method: "POST",
        body,
      }),
    }),

    // 4. GET MY VOTING PROGRESS (Positions already voted for)
    getVotingProgress: builder.query<string[], string>({
      query: (electionId) => `/progress/${electionId}`,
      providesTags: ["VoteProgress"],
    }),

    // 5. VIEW LIVE POSITION RESULTS
    getPositionResults: builder.query<ResultEntry[], string>({
      query: (positionId) => `/results/position/${positionId}`,
      providesTags: (result, error, id) => [{ type: "Results", id }],
    }),

    // 6. GET FULL ELECTION ANALYTICS (Admin)
    getElectionAnalytics: builder.query<any, string>({
      query: (electionId) => `/analytics/election/${electionId}`,
      providesTags: ["Analytics"],
    }),

    // 7. GET CANDIDATE PERFORMANCE SCORECARD (Admin)
    getCandidateScorecard: builder.query<any, string>({
      query: (candidateId) => `/analytics/candidate/${candidateId}`,
    }),

    // 8. OFFICIAL ELECTION WINNERS (Admin)
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