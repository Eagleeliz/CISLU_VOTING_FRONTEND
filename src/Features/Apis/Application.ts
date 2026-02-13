// services/applicationApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// --- TYPES (Matching your schema) ---
export type ApplicationStatus = "pending" | "under_review" | "approved" | "rejected";

export interface User {
  fullName: string;
  studentRegNo: string;
  participationPoints?: number;
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
  
  // Relations (populated when requested)
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

// Request Types
export interface CreateApplicationRequest {
  userId: string;
  electionId: string;
  positionId: string;
  statementOfIntent: string;
  manifesto: string;
  imageUrl?: string;
  requiredPoints?: number;
}

export interface ReviewApplicationRequest {
  status: ApplicationStatus;
  adminRemarks: string;
}

export interface UpdateManifestoRequest {
  statementOfIntent?: string;
  manifesto?: string;
  imageUrl?: string;
}

// Response Types
interface ApplicationResponse {
  message: string;
  application: ApplicationWithDetails;
}

interface ApplicationsResponse {
  applications?: ApplicationWithDetails[];
  error?: string;
}

// Base Query Configuration
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

// API Definition
export const applicationApi = createApi({
  reducerPath: "applicationApi",
  baseQuery,
  tagTypes: ["Applications", "MyApplications", "ElectionApplications"],
  endpoints: (builder) => ({

    // 1. CREATE: Submit Application
    createApplication: builder.mutation<ApplicationResponse, CreateApplicationRequest>({
      query: (body) => ({
        url: "applications/apply",
        method: "POST",
        body: {
          ...body,
          requiredPoints: body.requiredPoints || 0
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Applications", id: arg.electionId },
        { type: "MyApplications" }
      ],
    }),

    // 2. READ: Get Applications for an Election (Admin/Committee)
    getElectionApplications: builder.query<ApplicationWithDetails[], string>({
      query: (electionId) => `applications/election/${electionId}`,
      providesTags: (result, error, electionId) => 
        result ? [{ type: "Applications", id: electionId }] : [],
      transformResponse: (response: any) => {
        // Handle both array responses and wrapped responses
        return Array.isArray(response) ? response : response.applications || [];
      },
    }),

    // 3. READ: Get Single Application by ID
    getApplicationById: builder.query<ApplicationWithDetails, string>({
      query: (id) => `applications/${id}`,
      providesTags: (result, error, id) => [{ type: "Applications", id }],
      transformResponse: (response: any) => {
        return response.application || response;
      },
    }),

    // 4. READ: Get My Applications (for logged-in user)
    getMyApplications: builder.query<ApplicationWithDetails[], void>({
      query: () => "applications/my",
      providesTags: ["MyApplications"],
      transformResponse: (response: any) => {
        return Array.isArray(response) ? response : response.applications || [];
      },
    }),

    // 5. UPDATE: Review Application (Admin)
    reviewApplication: builder.mutation<
      { message: string; updated: ApplicationWithDetails },
      { id: string; status: ApplicationStatus; adminRemarks: string }
    >({
      query: ({ id, status, adminRemarks }) => ({
        url: `applications/${id}/review`,
        method: "PATCH",
        body: { status, adminRemarks },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Applications", id },
        "MyApplications",
      ],
    }),

    // 6. UPDATE: Update My Application (Manifesto/Statement)
    updateMyApplication: builder.mutation<
      { message: string; updated: Application },
      { id: string; updates: UpdateManifestoRequest }
    >({
      query: ({ id, updates }) => ({
        url: `applications/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Applications", id },
        "MyApplications",
      ],
    }),

    // 7. DELETE: Withdraw Application
    withdrawApplication: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `applications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Applications", id },
        "MyApplications",
      ],
    }),

    // 8. READ: Check Eligibility (Optional helper)
    checkEligibility: builder.query<{ eligible: boolean; reason?: string }, { userId: string; requiredPoints: number }>({
      query: ({ userId, requiredPoints }) => ({
        url: `users/${userId}/eligibility`,
        params: { requiredPoints },
      }),
    }),
  }),
});

// Export hooks
export const {
  // Create
  useCreateApplicationMutation,

  // Read
  useGetElectionApplicationsQuery,
  useGetApplicationByIdQuery,
  useGetMyApplicationsQuery,

  // Update
  useReviewApplicationMutation,
  useUpdateMyApplicationMutation,

  // Delete
  useWithdrawApplicationMutation,

  // Utility
  useCheckEligibilityQuery,
  useLazyCheckEligibilityQuery,
} = applicationApi;

// Export types for use in components
