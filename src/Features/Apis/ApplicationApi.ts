// Features/Apis/applicationApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// --- TYPES ---
export type ApplicationStatus = "pending" | "under_review" | "approved" | "rejected";

export interface User {
  id: string;
  studentRegNo: string;
  fullName: string;
  role: string;
  yearOfStudy?: string;
  participationPoints?: number;
  email?: string;
}

export interface CompleteProfileRequest {
  studentRegNo: string;
  fullName: string;
  yearOfStudy: string;
  email: string;
}

export interface Position {
  id: string;
  title: string;
  minParticipationPoints?: number;
  slotsAvailable?: number;
}

export interface Election {
  id: string;
  title: string;
}

export interface Application {
  id: string;
  userId: string;
  electionId: string;
  positionId: string;
  statementOfIntent: string;
  manifesto: string;
  imageUrl?: string | null;
  status: ApplicationStatus;
  adminRemarks?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  requiredPoints?: number; // Added from .http file
  
  user?: User;
  election?: Election;
  position?: Position;
  reviewer?: { fullName: string };
}

export interface ApplicationWithDetails extends Application {
  user: User;
  election: Election;
  position: Position;
  reviewer?: { fullName: string };
}

export interface CreateApplicationRequest {
  userId: string;
  electionId: string;
  positionId: string;
  statementOfIntent: string;
  manifesto: string;
  imageUrl?: string;
  requiredPoints?: number; // Added from .http file
}

export interface UpdateManifestoRequest {
  statementOfIntent?: string;
  manifesto?: string;
  imageUrl?: string;
}

export interface ReviewApplicationRequest {
  id: string;
  status: ApplicationStatus;
  adminRemarks: string;
}

// Base Query
const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5000/api/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// API Definition
export const applicationApi = createApi({
  reducerPath: "applicationApi",
  baseQuery,
  tagTypes: ["MyApplications", "Application", "ElectionApplications", "User"],
  endpoints: (builder) => ({
    
    // 1. PROFILE COMPLETION
    completeProfile: builder.mutation<{ message: string; user: User }, CompleteProfileRequest>({
      query: (body) => ({
        url: "auth/complete-profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // 2. GET MY APPLICATIONS (Student View)
    getMyApplications: builder.query<ApplicationWithDetails[], void>({
      query: () => `candidate-applications/my`,
      providesTags: ["MyApplications"],
      transformResponse: (response: any) => {
        if (response.applications && Array.isArray(response.applications)) {
          return response.applications;
        }
        return Array.isArray(response) ? response : [];
      },
    }),

    // 3. GET SINGLE APPLICATION BY ID (Patron/Student View)
    getApplicationById: builder.query<ApplicationWithDetails, string>({
      query: (id) => `candidate-applications/${id}`,
      providesTags: (result, error, id) => [{ type: "Application", id }],
    }),

    // 4. GET APPLICATIONS BY ELECTION (Patron View)
    getApplicationsByElection: builder.query<ApplicationWithDetails[], string>({
      query: (electionId) => `candidate-applications/election/${electionId}`,
      providesTags: (result, error, electionId) => [{ type: "ElectionApplications", id: electionId }],
    }),

    // 5. CREATE APPLICATION
    createApplication: builder.mutation<any, CreateApplicationRequest>({
      query: (body) => ({
        url: "candidate-applications",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MyApplications", "ElectionApplications"],
    }),

    // 6. UPDATE APPLICATION (Refine Statement)
    updateMyApplication: builder.mutation<any, { id: string; updates: UpdateManifestoRequest }>({
      query: ({ id, updates }) => ({
        url: `candidate-applications/${id}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Application", id },
        "MyApplications",
        "ElectionApplications"
      ],
    }),

    // 7. REVIEW APPLICATION (Approve/Reject - Patron Only)
    reviewApplication: builder.mutation<any, ReviewApplicationRequest>({
      query: ({ id, ...body }) => ({
        url: `candidate-applications/${id}/review`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Application", id },
        "ElectionApplications",
        "MyApplications"
      ],
    }),

    // 8. WITHDRAW APPLICATION (Student Only)
    withdrawApplication: builder.mutation<any, string>({
      query: (id) => ({
        url: `candidate-applications/${id}/withdraw`,
        method: "DELETE",
      }),
      invalidatesTags: ["MyApplications", "ElectionApplications"],
    }),

    // 9. DISQUALIFY CANDIDATE (Admin Only)
    disqualifyCandidate: builder.mutation<any, string>({
      query: (id) => ({
        url: `candidate-applications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ElectionApplications", "MyApplications"],
    }),
  }),
});

// Export all hooks
export const {
  useCompleteProfileMutation,
  useCreateApplicationMutation,
  useGetApplicationByIdQuery,
  useGetMyApplicationsQuery,
  useGetApplicationsByElectionQuery, // New hook
  useUpdateMyApplicationMutation,
  useReviewApplicationMutation,     // New hook
  useWithdrawApplicationMutation,
  useDisqualifyCandidateMutation,    // New hook
} = applicationApi;