import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// -------------------- TYPES --------------------
export interface RegisterRequest {
  studentRegNo: string;
  email: string;
  role?: "voter" | "admin";
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

export interface CompleteProfileRequest {
  fullName: string;
  yearOfStudy: number | string;
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
    // Pointing to your local development server
    baseUrl: "http://localhost:5000/api/auth/",
    prepareHeaders: (headers, { getState }) => {
      // Pull token from Redux or LocalStorage
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
    // 1. Register
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (payload) => ({
        url: "register",
        method: "POST",
        body: payload,
      }),
    }),

    // 2. Login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (payload) => ({
        url: "login",
        method: "POST",
        body: payload,
      }),
    }),

    // 3. Forgot Password
    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (payload) => ({
        url: "forgot-password",
        method: "POST",
        body: payload,
      }),
    }),

    // 4. Reset Password
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (payload) => ({
        url: "reset-password",
        method: "POST",
        body: payload,
      }),
    }),

    // 5. Complete Profile (Authenticated)
    completeProfile: builder.mutation<AuthResponse, CompleteProfileRequest>({
      query: (payload) => ({
        url: "complete-profile",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["User"],
    }),

    // 6. Update Password (Authenticated)
    updatePassword: builder.mutation<AuthResponse, { password: string }>({
      query: (payload) => ({
        url: "update-password",
        method: "PUT",
        body: payload,
      }),
    }),

    // 7. Get User by Registration Number
    getUserByRegNo: builder.query<any, string>({
      query: (studentRegNo) => ({
        url: `user/by-reg-no?studentRegNo=${encodeURIComponent(studentRegNo)}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

// -------------------- HOOKS --------------------
export const {
  useRegisterMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useCompleteProfileMutation,
  useUpdatePasswordMutation,
  useGetUserByRegNoQuery,
} = authApi;