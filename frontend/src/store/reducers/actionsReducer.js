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
        updateAction: (state, updatedAction) => {
            let newAllActions = [...state.allActions];
            let indexOfUpdatedAction = null;

            for (let i = 0; i < newAllActions.length; i++) {
                let action = newAllActions[i];

                if (action.id !== updatedAction.payload.id) {
                    continue;
                }

                indexOfUpdatedAction = i;
                break;
            }

            if (indexOfUpdatedAction === null) {
                return;
            }

            newAllActions[indexOfUpdatedAction] = updatedAction.payload;

            state.allActions = newAllActions;
        },
        removeAction: (state, actionId) => {
            state.allActions = state.allActions.filter(action => action.id !== actionId.payload);
        },
        setActions: (state, actions) => {
            state.allActions = [...actions.payload];
        },
        swapActionIndexes: (state, indexesToSwap) => {
            const [actionAIndex, actionBIndex] = indexesToSwap.payload;
            let newActions = [...state.allActions];
            [newActions[actionAIndex], newActions[actionBIndex]] = [newActions[actionBIndex], newActions[actionAIndex]];
            state.allActions = newActions;
        }
    },
});

const addActionCall = (actionType) => async (dispatch) => {
    const response = await actionAPI.addAction(actionType);
    dispatch(actionsSlice.actions.addAction(response.data));
};

const updateActionCall = (updatedAction) => async (dispatch) => {
    await actionAPI.updateAction(updatedAction);
    dispatch(actionsSlice.actions.updateAction(updatedAction));
};

const removeActionCall = (actionId) => async (dispatch) => {
    await actionAPI.removeAction(actionId);
    dispatch(actionsSlice.actions.removeAction(actionId));
};

const setActionsCall = (actions) => async (dispatch) => {
    await actionAPI.setActions(actions);
    dispatch(actionsSlice.actions.setActions(actions));
};

const swapActionIndexesCall = (indexA, indexB) => async (dispatch) => {
    await actionAPI.swapActionIndexes(indexA, indexB);
    dispatch(actionsSlice.actions.swapActionIndexes([indexA, indexB]));
};

export { addActionCall, updateActionCall, removeActionCall, setActionsCall, swapActionIndexesCall };
export default actionsSlice.reducer;
