import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// --- UPDATED TYPES TO SUPPORT FULL PROFILE DATA ---
export interface CandidateApplication {
  id: string;
  userId: string;
  electionId: string;
  positionId: string;
  statementOfIntent: string;
  manifesto: string;
  imageUrl: string;
  requiredPoints: number;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  adminRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  // Nested data for Profile View
  user: {
    id: string;
    studentRegNo: string;
    email: string;
    fullName: string;
    yearOfStudy: string;
    role: string;
    participationPoints: number;
    isGoodStanding: boolean;
  };
  election: {
    id: string;
    title: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
  };
  position: {
    id: string;
    title: string;
    minParticipationPoints: number;
    slotsAvailable: number;
    targetYears: string[];
  };
  reviewer?: {
    fullName: string;
  };
}

export const candidateApplicationApi = createApi({
  reducerPath: "candidateApplicationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/candidate-applications",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Applications"],
  endpoints: (builder) => ({
    
    // 1. SUBMIT CLUB APPLICATION (POST /)
    submitApplication: builder.mutation<CandidateApplication, Partial<CandidateApplication>>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Applications"],
    }),

    // 2. REFINE STATEMENT (PATCH /:id) - For Students
    updateApplication: builder.mutation<CandidateApplication, { id: string; statementOfIntent: string }>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Applications", id }, "Applications"],
    }),

    // 3. LIST ALL CANDIDATES FOR ELECTION (GET /election/:electionId)
    getCandidatesByElection: builder.query<CandidateApplication[], string>({
      query: (electionId) => `/election/${electionId}`,
      transformResponse: (response: { applications: CandidateApplication[] } | CandidateApplication[]) => 
        Array.isArray(response) ? response : response.applications,
      providesTags: ["Applications"],
    }),

    // 4. VIEW CANDIDATE BIO (GET /:id)
    // Updated to handle the nested response object
    getApplicationDetails: builder.query<CandidateApplication, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: any) => response.application || response,
      providesTags: (result, error, id) => [{ type: "Applications", id }],
    }),

    // 5. APPROVE/REJECT CANDIDATE (PATCH /:id/review) - Admin/Patron
    reviewApplication: builder.mutation<CandidateApplication, { id: string; status: string; adminRemarks: string }>({
      query: ({ id, ...body }) => ({
        url: `/${id}/review`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Applications", id }, "Applications"],
    }),

    // 6. WITHDRAW CANDIDACY (DELETE /:id/withdraw) - Student
    withdrawApplication: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/${id}/withdraw`,
        method: "DELETE",
      }),
      invalidatesTags: ["Applications"],
    }),

    // 7. DISQUALIFY CANDIDATE (DELETE /:id) - Admin Only
    disqualifyCandidate: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Applications"],
    }),
  }),
});

export const {
  useSubmitApplicationMutation,
  useUpdateApplicationMutation,
  useGetCandidatesByElectionQuery,
  useGetApplicationDetailsQuery,
  useReviewApplicationMutation,
  useWithdrawApplicationMutation,
  useDisqualifyCandidateMutation,
} = candidateApplicationApi;