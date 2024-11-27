import { configureStore } from '@reduxjs/toolkit';
import authReducer from "./auth/AuthSlice";
import templatesReducer from "./execution-templates/TemplatesSlice"

export const store = configureStore({
  reducer: {
    authReducer,
    templatesReducer
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;