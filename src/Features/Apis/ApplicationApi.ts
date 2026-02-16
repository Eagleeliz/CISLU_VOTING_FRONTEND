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
  email?: string; // Added email for profile completion
}

// Interface for the profile update request
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
}

export interface UpdateManifestoRequest {
  statementOfIntent?: string;
  manifesto?: string;
  imageUrl?: string;
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
  tagTypes: ["MyApplications", "Application", "User"],
  endpoints: (builder) => ({
    
    // 1. PROFILE COMPLETION MUTATION
    // This talks to your Auth Controller section 3
    completeProfile: builder.mutation<{ message: string; user: User }, CompleteProfileRequest>({
      query: (body) => ({
        url: "auth/complete-profile", // Matches your backend route
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"], // Refresh user data everywhere
    }),

    // 2. GET MY APPLICATIONS
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

    // 3. GET SINGLE APPLICATION BY ID
    getApplicationById: builder.query<ApplicationWithDetails, string>({
      query: (id) => `candidate-applications/${id}`,
      providesTags: (result, error, id) => [{ type: "Application", id }],
    }),

    // 4. CREATE APPLICATION
    createApplication: builder.mutation<any, CreateApplicationRequest>({
      query: (body) => ({
        url: "candidate-applications",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MyApplications"],
    }),

    // 5. UPDATE APPLICATION
    updateMyApplication: builder.mutation<any, { id: string; updates: UpdateManifestoRequest }>({
      query: ({ id, updates }) => ({
        url: `candidate-applications/${id}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Application", id },
        "MyApplications",
      ],
    }),

    // 6. WITHDRAW APPLICATION
    withdrawApplication: builder.mutation<any, string>({
      query: (id) => ({
        url: `candidate-applications/${id}/withdraw`,
        method: "DELETE",
      }),
      invalidatesTags: ["MyApplications"],
    }),
  }),
});

// Export all hooks
export const {
  useCompleteProfileMutation, // <--- Use this in your CompleteProfile.tsx
  useCreateApplicationMutation,
  useGetApplicationByIdQuery,
  useGetMyApplicationsQuery,
  useUpdateMyApplicationMutation,
  useWithdrawApplicationMutation,
} = applicationApi;