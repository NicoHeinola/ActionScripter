import { createSlice } from '@reduxjs/toolkit';
import actionAPI from "apis/actionAPI";
import { setScriptIsModifiedCall } from './actionScriptReducer';

const initialState = {
    allActions: [],
};

const actionsSlice = createSlice({
    name: 'actions',
    initialState,
    reducers: {
        addActions: (state, actions) => {
            for (let action of actions.payload) {
                state.allActions.push(action);
            }
        },
        addActionsAt: (state, data) => {
            const actions = data.payload["actions"];
            let index = data.payload["index"];

            for (let action of actions) {
                state.allActions.splice(index, 0, action);
                index++;
            }
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
        removeActions: (state, actionIds) => {
            state.allActions = state.allActions.filter(action => !actionIds.payload.includes(action.id));
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

const createActionCall = (actionType) => async (dispatch) => {
    const response = await actionAPI.createAction(actionType);
    let actionData = response.data;
    dispatch(actionsSlice.actions.addActions([actionData]));
    dispatch(setScriptIsModifiedCall(true));
    return actionData;
};

const addActionsCall = (actionDatas, index = -1) => async (dispatch) => {
    const response = await actionAPI.addActions(actionDatas, index);
    const addedActions = response.data;

    if (index === -1) {
        dispatch(actionsSlice.actions.addActions(addedActions));
    } else {
        dispatch(actionsSlice.actions.addActionsAt({ "actions": addedActions, "index": index }));
    }
    dispatch(setScriptIsModifiedCall(true));
};

const updateActionCall = (updatedAction) => async (dispatch) => {
    await actionAPI.updateAction(updatedAction);
    dispatch(actionsSlice.actions.updateAction(updatedAction));
    dispatch(setScriptIsModifiedCall(true));
};

const removeActionCall = (actionId) => async (dispatch) => {
    await actionAPI.removeAction(actionId);
    dispatch(actionsSlice.actions.removeAction(actionId));
    dispatch(setScriptIsModifiedCall(true));
};

const removeActionsCall = (actionIds) => async (dispatch) => {
    actionAPI.removeActions(actionIds);
    dispatch(actionsSlice.actions.removeActions(actionIds));
    dispatch(setScriptIsModifiedCall(true));
};

const setActionsCall = (actions) => async (dispatch) => {
    await actionAPI.setActions(actions);
    dispatch(actionsSlice.actions.setActions(actions));
};

const swapActionIndexesCall = (indexA, indexB) => async (dispatch) => {
    await actionAPI.swapActionIndexes(indexA, indexB);
    dispatch(actionsSlice.actions.swapActionIndexes([indexA, indexB]));
    dispatch(setScriptIsModifiedCall(true));
};

export {
    createActionCall,
    updateActionCall,
    removeActionCall,
    removeActionsCall,
    setActionsCall,
    swapActionIndexesCall,
    addActionsCall
};
export default actionsSlice.reducer;
