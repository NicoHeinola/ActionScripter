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
            state.allActions = state.allActions.filter(action => action.id !== actionId.payload);
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

const removeActionCall = (actionId) => async (dispatch) => {
    const response = await actionAPI.removeAction(actionId);
    dispatch(actionsSlice.actions.removeAction(actionId));
};

const setActionsCall = (actions) => async (dispatch) => {
    dispatch(actionsSlice.actions.setActions(actions));
};

export { addActionCall, removeActionCall, setActionsCall };
export default actionsSlice.reducer;
