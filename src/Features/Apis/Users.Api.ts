import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// -------------------- TYPES --------------------
export interface UserProfile {
  id: string;
  studentRegNo: string;
  email: string;
  fullName: string;
  role: 'admin' | 'member' | 'voter';
  yearOfStudy: string;
  participationPoints: number;
  isGoodStanding: boolean;
  isActive: boolean;
  isLocked: boolean;
  lastLoginAt: string;
  createdAt?: string;
}

// Updated to match Backend Zod Validator requirements
export interface PasswordUpdateRequest {
  currentPassword: string; // Required to verify identity via bcrypt
  password: string;        // The new password to be hashed
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

export interface RoleUpdateRequest {
  userId: string;
  role: 'admin' | 'member' | 'voter';
}

export interface AdminUpdateUserRequest extends UpdateProfileRequest {
  userId: string;
  studentRegNo?: string;
  password?: string;
}


// -------------------- API --------------------
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    // Base URL points to /api/ to allow access to both auth and users routers
    baseUrl: "https://cislu-voting-app-backend.onrender.com/api/", 
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      
      // Pull token from state OR localStorage (Fallback for page refreshes)
      const rawToken = state.auth?.token || localStorage.getItem("token");

      if (rawToken && rawToken !== "null" && rawToken !== "undefined") {
        // Remove double quotes and backslashes that might wrap the token
        const cleanToken = String(rawToken).replace(/[\\"]/g, "").trim();
        headers.set("Authorization", `Bearer ${cleanToken}`);
      }
      
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["User", "Profile"],
  endpoints: (builder) => ({
    
    // --- AUTHENTICATED PASSWORD UPDATE ---
    // Targets: AuthRouter.put("/update-password")
    updatePassword: builder.mutation<{ message: string }, PasswordUpdateRequest>({
      query: (payload) => ({
        url: "auth/update-password",
        method: "PUT",
        body: payload,
      }),
    }),

    // --- PROFILE MANAGEMENT ---
    getMe: builder.query<UserProfile, void>({
      query: () => ({
        url: "users/me",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),

    updateProfile: builder.mutation<{ message: string; user: UserProfile }, UpdateProfileRequest>({
      query: (payload) => ({
        url: "users/update-profile", 
        method: "PUT",         
        body: payload,
      }),
      invalidatesTags: ["Profile"],
    }),

    // --- AUTH RECOVERY / UNLOCK ---
    requestUnlock: builder.mutation<{ message: string }, { email: string }>({
      query: (payload) => ({
        url: "users/request-unlock",
        method: "POST",
        body: payload,
      }),
    }),

    resendUnlockCode: builder.mutation<{ message: string }, { email: string }>({
      query: (payload) => ({
        url: "users/resend-unlock",
        method: "POST",
        body: payload,
      }),
    }),

    verifyUnlock: builder.mutation<{ message: string }, { email: string; code: string }>({
      query: (payload) => ({
        url: "users/verify-unlock",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Profile"],
    }),

    // --- ADMIN: USER MANAGEMENT ---
    getAllUsers: builder.query<PaginatedUsers, { limit: number; offset: number }>({
      query: ({ limit, offset }) => ({
        url: `users/?limit=${limit}&offset=${offset}`,
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

    adminUpdateUser: builder.mutation<{ message: string; user: UserProfile }, AdminUpdateUserRequest>({
      query: ({ userId, ...payload }) => ({
        url: `users/admin-update/${userId}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        { type: "Profile" },
      ],
    }),

    updateUserStatus: builder.mutation<UserProfile, StatusUpdateRequest>({
      query: ({ userId, ...payload }) => ({
        url: `users/status/${userId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        { type: "Profile" }, 
      ],
    }),

    changeUserRole: builder.mutation<{ message: string; user: UserProfile }, RoleUpdateRequest>({
      query: ({ userId, role }) => ({
        url: `users/role/${userId}`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        { type: "Profile" },
      ],
    }),

    managePoints: builder.mutation<UserProfile, PointsUpdateRequest>({
      query: ({ userId, points }) => ({
        url: `users/points/${userId}`,
        method: "PATCH",
        body: { points },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        { type: "Profile" },
      ],
    }),

    deleteUser: builder.mutation<{ message: string; id: string }, string>({
      query: (userId) => ({
        url: `users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User", "Profile"],
    }),

    // --- ELIGIBILITY ---
    checkEligibility: builder.query<EligibilityResponse, { userId: string; requiredPoints: number }>({
      query: ({ userId, requiredPoints }) => ({
        url: `users/eligible/${userId}?requiredPoints=${requiredPoints}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useUpdatePasswordMutation,
  useRequestUnlockMutation,
  useResendUnlockCodeMutation,
  useVerifyUnlockMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useAdminUpdateUserMutation,
  useChangeUserRoleMutation,
  useDeleteUserMutation,
  useCheckEligibilityQuery,
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
  useManagePointsMutation,
} = userApi;