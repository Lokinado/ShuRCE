import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserPublic } from "../../backend-types";

interface UsersState {
    users: UserPublic[] | null
}
  
const initialState: UsersState = {
    users: null
};

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        update: (state, action: PayloadAction<UserPublic[]>) => {
            state.users = action.payload
        },
        invalidate: (state) => {
            state.users = null
        },
    },
});

export const { update, invalidate } = usersSlice.actions;

export default usersSlice.reducer;