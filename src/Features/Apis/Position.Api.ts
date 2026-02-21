import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Matches your .http JSON structure exactly
export interface Position {
  id: string;
  electionId: string;
  title: string;
  minParticipationPoints: number;
  slotsAvailable: number;
  targetYears: string[];
}

export interface CreatePositionRequest {
  electionId: string;
  title: string;
  minParticipationPoints: number;
  slotsAvailable: number;
  targetYears: string[];
}

const baseQuery = fetchBaseQuery({
  // Fixed the protocol typo (http:// instead of http//:)
  baseUrl: "https://cislu-voting-app-backend.onrender.com/api/positions", 
  prepareHeaders: (headers) => {
    // Standardizing on 'token' as per your localStorage logic
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

export const positionApi = createApi({
  reducerPath: "positionApi",
  baseQuery,
  tagTypes: ["Positions"],
  endpoints: (builder) => ({
    
    // 1. GET ALL POSITIONS FOR AN ELECTION
    // Logic: GET /positions/election/{{electionId}}
   // Position.Api.ts

getPositionsByElection: builder.query<Position[], string>({
  query: (electionId) => `/election/${electionId}`,
  
  // 1. Extract the array from the "positions" key
  transformResponse: (response: { positions: Position[] }) => response.positions,

  // 2. Now 'result' is the clean Array, so .map() will work perfectly
  providesTags: (result) => 
    result 
      ? [
          ...result.map(({ id }) => ({ type: 'Positions' as const, id })),
          { type: 'Positions', id: 'LIST' }
        ] 
      : [{ type: 'Positions', id: 'LIST' }],
}),

    // 2. GET ELIGIBLE POSITIONS (Student Ballot View)
    // Logic: GET /positions/eligible/{{electionId}}?year={{year}}
    getEligiblePositions: builder.query<Position[], { electionId: string; year: string }>({
      query: ({ electionId, year }) => `/eligible/${electionId}?year=${year}`,
      providesTags: ["Positions"],
    }),

    // 3. CREATE POSITION (Admin Only)
    // Logic: POST /positions
    createPosition: builder.mutation<Position, CreatePositionRequest>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: 'Positions', id: 'LIST' }],
    }),

    // 4. UPDATE POSITION (Admin Only)
    // Logic: PUT /positions/{{positionId}}
    updatePosition: builder.mutation<Position, { positionId: string } & Partial<CreatePositionRequest>>({
      query: ({ positionId, ...body }) => ({
        url: `/${positionId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { positionId }) => [
        { type: 'Positions', id: positionId },
        { type: 'Positions', id: 'LIST' }
      ],
    }),

    // 5. DELETE POSITION (Admin Only)
    // Logic: DELETE /positions/{{positionId}}
    deletePosition: builder.mutation<{ success: boolean }, string>({
      query: (positionId) => ({
        url: `/${positionId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: 'Positions', id: 'LIST' }],
    }),

    // 6. GET SINGLE POSITION BY ID
    getPositionById: builder.query<Position, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Positions', id }],
    }),
  }),
});

export const {
  useGetPositionsByElectionQuery,
  useGetEligiblePositionsQuery,
  useCreatePositionMutation,
  useUpdatePositionMutation,
  useDeletePositionMutation,
  useGetPositionByIdQuery,
} = positionApi;