// Features/Apis/applicationApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// --- TYPES ---
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
  tagTypes: ["MyApplications", "Application"],
  endpoints: (builder) => ({
    
    // GET MY APPLICATIONS - Using REAL backend data
    getMyApplications: builder.query<ApplicationWithDetails[], void>({
      query: () => `candidate-applications/my`,
      providesTags: ["MyApplications"],
      transformResponse: (response: any) => {
        console.log("📦 Real backend response:", response);
        
        // Your backend returns { applications: [...] }
        if (response.applications && Array.isArray(response.applications)) {
          return response.applications;
        }
        
        // If response is already an array
        if (Array.isArray(response)) {
          return response;
        }
        
        // Return empty array if no data
        return [];
      },
    }),

    // GET SINGLE APPLICATION BY ID
    getApplicationById: builder.query<ApplicationWithDetails, string>({
      query: (id) => `candidate-applications/${id}`,
      providesTags: (result, error, id) => [{ type: "Application", id }],
      transformResponse: (response: any) => {
        console.log("📦 Single application response:", response);
        // Your backend returns the application directly
        return response;
      },
    }),

    // CREATE APPLICATION
    createApplication: builder.mutation<any, CreateApplicationRequest>({
      query: (body) => ({
        url: "candidate-applications",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => {
        console.log("✅ Application created:", response);
        return response;
      },
      transformErrorResponse: (response: any) => {
        console.error("❌ Application creation error:", response);
        return response;
      },
      invalidatesTags: ["MyApplications"],
    }),

    // UPDATE APPLICATION
    updateMyApplication: builder.mutation<any, { id: string; updates: UpdateManifestoRequest }>({
      query: ({ id, updates }) => ({
        url: `candidate-applications/${id}`,
        method: "PATCH",
        body: updates,
      }),
      transformResponse: (response: any) => {
        console.log("✅ Application updated:", response);
        return response;
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Application", id },
        "MyApplications",
      ],
    }),

    // WITHDRAW APPLICATION
    withdrawApplication: builder.mutation<any, string>({
      query: (id) => ({
        url: `candidate-applications/${id}/withdraw`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => {
        console.log("✅ Application withdrawn:", response);
        return response;
      },
      invalidatesTags: (result, error, id) => [
        { type: "Application", id },
        "MyApplications",
      ],
    }),
  }),
});

// Export all hooks
export const {
  useCreateApplicationMutation,
  useGetApplicationByIdQuery,
  useGetMyApplicationsQuery,
  useUpdateMyApplicationMutation,
  useWithdrawApplicationMutation,
} = applicationApi;