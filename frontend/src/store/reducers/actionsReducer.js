import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    allActions: [],
};

const actionsSlice = createSlice({
    name: 'actions',
    initialState,
    reducers: {
        addAction: (state, action) => {
            state.allActions.push(action.payload);
        },
        removeAction: (state, actionId) => {
            state.allActions = state.allActions.filter(action => action.id !== actionId);
        },
        setActions: (state, actions) => {
            state.allActions = [...actions.payload];
        }
    },
});

export const { addAction, removeAction, setActions } = actionsSlice.actions;
export default actionsSlice.reducer;
