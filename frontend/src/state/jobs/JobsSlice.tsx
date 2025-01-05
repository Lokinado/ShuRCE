import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { JobPublic } from "../../backend-types";

interface JobsState {
    jobs: JobPublic[] | null
}
  
const initialState: JobsState = {
    jobs: null
};

const jobsSlice = createSlice({
    name: 'jobs',
    initialState,
    reducers: {
        update: (state, action: PayloadAction<JobPublic[]>) => {
            state.jobs = action.payload
        },
        invalidate: (state) => {
            state.jobs = null
        },
    },
});

export const { update, invalidate } = jobsSlice.actions;

export default jobsSlice.reducer;