import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// -------------------- TYPES --------------------
export interface UserProfile {
  id: string;
  studentRegNo: string;
  email: string;
  fullName: string;
  role: 'admin' | 'member' | 'voter'; // Updated to include voter role
  yearOfStudy: string;
  participationPoints: number;
  isGoodStanding: boolean;
  isActive: boolean;
  isLocked: boolean;
  lastLoginAt: string;
  createdAt?: string;
}

export interface EligibilityResponse {
  eligible: boolean;
  reason?: string;
  currentPoints: number;
  requiredPoints: number;
}

export type PaginatedUsers = UserProfile[];

export interface StatusUpdateRequest {
  userId: string;
  isActive: boolean;
  isGoodStanding: boolean;
}

export interface PointsUpdateRequest {
  userId: string;
  points: number;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  yearOfStudy?: string | number;
}

// NEW: Role Update Interface
export interface RoleUpdateRequest {
  userId: string;
  role: 'admin' | 'member' | 'voter';
}

// NEW: Admin Update Interface (Includes password and sensitive fields)
export interface AdminUpdateUserRequest extends UpdateProfileRequest {
  userId: string;
  studentRegNo?: string;
  password?: string;
}

// -------------------- API --------------------
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/users/",
    prepareHeaders: (headers, { getState }) => {
      let token = (getState() as any).auth.token || localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["User", "Profile"],
  endpoints: (builder) => ({
    
    requestUnlock: builder.mutation<{ message: string }, { email: string }>({
      query: (payload) => ({
        url: "request-unlock",
        method: "POST",
        body: payload,
      }),
    }),

    resendUnlockCode: builder.mutation<{ message: string }, { email: string }>({
      query: (payload) => ({
        url: "resend-unlock",
        method: "POST",
        body: payload,
      }),
    }),

    verifyUnlock: builder.mutation<{ message: string }, { email: string; code: string }>({
      query: (payload) => ({
        url: "verify-unlock",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Profile"],
    }),

    getMe: builder.query<UserProfile, void>({
      query: () => ({
        url: "me",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),

    updateProfile: builder.mutation<{ message: string; user: UserProfile }, UpdateProfileRequest>({
      query: (payload) => ({
        url: "update-profile",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Profile"],
    }),

    // --- NEW: Admin Full Update ---
    adminUpdateUser: builder.mutation<{ message: string; user: UserProfile }, AdminUpdateUserRequest>({
      query: ({ userId, ...payload }) => ({
        url: `admin-update/${userId}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        { type: "Profile" },
      ],
    }),

    // --- NEW: Admin Role Management ---
    changeUserRole: builder.mutation<{ message: string; user: UserProfile }, RoleUpdateRequest>({
      query: ({ userId, role }) => ({
        url: `role/${userId}`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        { type: "Profile" },
      ],
    }),

    // --- NEW: Delete User Account ---
    deleteUser: builder.mutation<{ message: string; id: string }, string>({
      query: (userId) => ({
        url: `${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User", "Profile"],
    }),

    checkEligibility: builder.query<EligibilityResponse, { userId: string; requiredPoints: number }>({
      query: ({ userId, requiredPoints }) => ({
        url: `eligible/${userId}?requiredPoints=${requiredPoints}`,
        method: "GET",
      }),
    }),

    getAllUsers: builder.query<PaginatedUsers, { limit: number; offset: number }>({
      query: ({ limit, offset }) => ({
        url: `?limit=${limit}&offset=${offset}`,
        method: "GET",
      }),
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    updateUserStatus: builder.mutation<UserProfile, StatusUpdateRequest>({
      query: ({ userId, ...payload }) => ({
        url: `status/${userId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        { type: "Profile" }, 
      ],
    }),

    managePoints: builder.mutation<UserProfile, PointsUpdateRequest>({
      query: ({ userId, points }) => ({
        url: `points/${userId}`,
        method: "PATCH",
        body: { points },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        { type: "Profile" },
      ],
    }),
  }),
});

export const {
  useRequestUnlockMutation,
  useResendUnlockCodeMutation,
  useVerifyUnlockMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useAdminUpdateUserMutation,
  useChangeUserRoleMutation, // Exported for role management
  useDeleteUserMutation,
  useCheckEligibilityQuery,
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
  useManagePointsMutation,
} = userApi;