import { configureStore } from '@reduxjs/toolkit';
import authReducer from "./auth/AuthSlice";
import templatesReducer from "./execution-templates/TemplatesSlice"
import jobsReducer from "./jobs/JobsSlice"

export const store = configureStore({
  reducer: {
    authReducer,
    templatesReducer,
    jobsReducer
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;