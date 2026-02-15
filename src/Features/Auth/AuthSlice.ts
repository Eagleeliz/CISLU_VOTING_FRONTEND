import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  studentRegNo: string;
  fullName: string;
  role: string;
  yearOfStudy?: string;
  participationPoints?: number;
  email?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  requireProfileCompletion: boolean;
}

const storedToken = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");
const storedRequireCompletion = localStorage.getItem("requireProfileCompletion") === "true";

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  requireProfileCompletion: storedRequireCompletion, 
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ 
        user: User; 
        token: string; 
        requireProfileCompletion: boolean 
      }>
    ) => {
      const { user, token, requireProfileCompletion } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.requireProfileCompletion = requireProfileCompletion;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("requireProfileCompletion", String(requireProfileCompletion));
    },

    completeProfile: (state) => {
      state.requireProfileCompletion = false;
      localStorage.setItem("requireProfileCompletion", "false");
    },

    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.requireProfileCompletion = false;
      localStorage.clear();
    },

    updateUserData: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
});

export const { setCredentials, clearCredentials, updateUserData, completeProfile } = authSlice.actions;
export default authSlice.reducer;