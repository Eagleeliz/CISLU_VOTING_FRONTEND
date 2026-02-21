import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// --- TYPES ---
export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "voting" | "completed" | "cancelled";
  positions?: any[];
  candidates?: any[];
}

// This interface matches your backend response object structure
interface ElectionsResponse {
  success: boolean;
  elections: Election[];
}

const baseQuery = fetchBaseQuery({
  baseUrl: "https://cislu-voting-app-backend.onrender.com/api/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

export const electionApi = createApi({
  reducerPath: "electionApi",
  baseQuery,
  tagTypes: ["Elections"],
  endpoints: (builder) => ({
    
    // 1. Get All Elections 
    // FIX: Changed <any[], void> to <ElectionsResponse, void>
    getAllElections: builder.query<ElectionsResponse, void>({
      query: () => "elections",
      providesTags: ["Elections"],
    }),

    // 2. Filter Elections by Status
    // FIX: Changed to <ElectionsResponse, string>
    filterElectionsByStatus: builder.query<ElectionsResponse, string>({
      query: (status) => `elections/filter?status=${status}`,
      providesTags: ["Elections"],
    }),

    // 3. Get Election by ID
    // Matches: GET {{baseUrl}}/elections/{{electionId}}
    getElectionById: builder.query<{ success: boolean; election: Election }, string>({
      query: (id) => `elections/${id}`,
      providesTags: ["Elections"],
    }),

    // 4. Create a New Election
    createElection: builder.mutation<any, Partial<Election>>({
      query: (body) => ({
        url: "elections",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Elections"],
    }),

    // 5. Update Election
    updateElection: builder.mutation<any, { electionId: string; title?: string; description?: string }>({
      query: ({ electionId, ...body }) => ({
        url: `elections/${electionId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Elections"],
    }),

    // 6. Change Election Status
    changeElectionStatus: builder.mutation<any, { electionId: string; status: string }>({
      query: ({ electionId, status }) => ({
        url: `elections/${electionId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Elections"],
    }),

    // 7. Delete Election
    deleteElection: builder.mutation<any, string>({
      query: (id) => ({
        url: `elections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Elections"],
    }),
  }),
});

export const {
  useGetAllElectionsQuery,
  useFilterElectionsByStatusQuery, 
  useGetElectionByIdQuery,
  useCreateElectionMutation,
  useUpdateElectionMutation,
  useChangeElectionStatusMutation,
  useDeleteElectionMutation,
} = electionApi;