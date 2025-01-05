import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RolePublic } from "../../backend-types";

interface RolesState {
    roles: RolePublic[] | null
}
  
const initialState: RolesState = {
    roles: null
};

const rolesSlice = createSlice({
    name: 'roles',
    initialState,
    reducers: {
        update: (state, action: PayloadAction<RolePublic[]>) => {
            state.roles = action.payload
        },
        invalidate: (state) => {
            state.roles = null
        },
    },
});

export const { update, invalidate } = rolesSlice.actions;

export default rolesSlice.reducer;