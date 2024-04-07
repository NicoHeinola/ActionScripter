import { createSlice } from '@reduxjs/toolkit';
import actionAPI from "apis/actionAPI";

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

const addActionCall = (actionType) => async (dispatch) => {
    const response = await actionAPI.addAction(actionType);
    dispatch(actionsSlice.actions.addAction(response.data));
};

const setActionsCall = (actions) => async (dispatch) => {
    dispatch(actionsSlice.actions.setActions(actions));
};

export { addActionCall, setActionsCall };
export default actionsSlice.reducer;
