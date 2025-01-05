import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserPublic } from '../../backend-types';

interface AuthState {
  isLoggedIn: boolean;
  user: UserPublic | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserPublic>) => {
      state.isLoggedIn = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;