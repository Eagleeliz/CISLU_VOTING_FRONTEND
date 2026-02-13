import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Define specific interfaces based on your backend response
interface User {
  id: string;
  studentRegNo: string;
  fullName: string;
  role: string;
  yearOfStudy: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  requireProfileCompletion: boolean;
}

// Persistence: Sync with localStorage to handle page refreshes
const storedToken = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  requireProfileCompletion: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Matches your: { message, token, user, requireProfileCompletion }
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

      // Deep Tech Persistence
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },

    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.requireProfileCompletion = false;

      // Clean up the digital footprint
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    updateUserData: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
});

export const { setCredentials, clearCredentials, updateUserData } = authSlice.actions;
export default authSlice.reducer;