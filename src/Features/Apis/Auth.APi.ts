import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// -------------------- TYPES --------------------
export interface RegisterRequest {
  studentRegNo: string;
  email: string;
  role?: "member" | "admin";
}

export interface LoginRequest {
  studentRegNo: string;
  password: string;
}

export interface ForgotPasswordRequest {
  studentRegNo: string;
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Updated to include studentRegNo for the URL logic
export interface CompleteProfileRequest {
  studentRegNo: string; 
  fullName: string;
  yearOfStudy: string;
  email: string;
}

export interface AuthResponse {
  message?: string;
  token?: string;
  user?: any;
  requireProfileCompletion?: boolean;
}

// -------------------- API --------------------
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://cislu-voting-app-backend.onrender.com/api/auth/",
    prepareHeaders: (headers, { getState }) => {
      let token = (getState() as any).auth.token || localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (payload) => ({ url: "register", method: "POST", body: payload }),
    }),

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (payload) => ({ url: "login", method: "POST", body: payload }),
    }),

    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (payload) => ({ url: "forgot-password", method: "POST", body: payload }),
    }),

    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (payload) => ({ url: "reset-password", method: "POST", body: payload }),
    }),

    // FIXED: Uses query params for RegNo to satisfy Controller + Zod Body requirements
    completeProfile: builder.mutation<AuthResponse, CompleteProfileRequest>({
      query: ({ studentRegNo, ...body }) => ({
        url: `complete-profile?studentRegNo=${encodeURIComponent(studentRegNo)}`,
        method: "PUT",
        body: body, // Sends fullName, yearOfStudy, email in the body
      }),
      invalidatesTags: ["User"],
    }),

    updatePassword: builder.mutation<AuthResponse, { password: string }>({
      query: (payload) => ({ url: "update-password", method: "PUT", body: payload }),
    }),

    getUserByRegNo: builder.query<any, string>({
      query: (studentRegNo) => ({
        url: `user/by-reg-no?studentRegNo=${encodeURIComponent(studentRegNo)}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useCompleteProfileMutation,
  useUpdatePasswordMutation,
  useGetUserByRegNoQuery,
} = authApi;