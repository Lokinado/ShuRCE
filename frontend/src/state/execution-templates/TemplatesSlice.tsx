import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExecutionTemplatePublic } from "../../backend-types";

interface TemplatesState {
    templates: ExecutionTemplatePublic[] | null
}
  
const initialState: TemplatesState = {
    templates: null
};

const templatesSlice = createSlice({
    name: 'templates',
    initialState,
    reducers: {
        update: (state, action: PayloadAction<ExecutionTemplatePublic[]>) => {
            state.templates = action.payload
        },
        invalidate: (state) => {
            state.templates = null
        },
    },
});

export const { update, invalidate } = templatesSlice.actions;

export default templatesSlice.reducer;