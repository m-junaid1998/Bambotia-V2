import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/** Minimal shape of the user object returned by the auth endpoints. */
export interface AuthUser {
  _id?: string;
  name?: string;
  email?: string;
  role?: "admin" | "customer" | string;
  [key: string]: unknown;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loginTime: number | null;
}

const initialState: AuthState = {
  user: null, 
  token: null,
  loginTime: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<AuthUser & { token: string }>) => {
      const { token, ...userInfo } = action.payload;
      state.user = userInfo;
      state.token = token;
      state.loginTime = Date.now();
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loginTime = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;