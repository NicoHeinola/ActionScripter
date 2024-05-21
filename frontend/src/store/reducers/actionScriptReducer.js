import { createSlice } from '@reduxjs/toolkit';
import actionScriptAPI from "apis/actionScriptAPI";

const initialState = {
    isLoadingActions: false,
    currentScript: {
        "loop-count": -1,
        "missing-script": true,
        "action-groups": {
            "0": {
                "actions": []
            }
        }
    },
    recentScripts: [],
    scriptIsModified: false,
};

const actionScriptSlice = createSlice({
    name: 'actionScript',
    initialState,
    reducers: {
        setPlayState: (state, playState) => {
            state.currentScript["play-state"] = playState.payload;
        },
        setCurrentScript: (state, script) => {
            state.currentScript = script.payload;
        },
        setRecentScripts: (state, recentScripts) => {
            state.recentScripts = recentScripts.payload;
        },
        setIsLoadingActions: (state, isLoadingActions) => {
            state.isLoadingActions = isLoadingActions.payload;
        },
        setScriptIsModified: (state, isModified) => {
            state.scriptIsModified = isModified.payload;
        },
        addActions: (state, data) => {
            const groupId = data.payload["group-id"];
            const actions = data.payload["actions"];

            const allGroups = state.currentScript["action-groups"];

            if (!(groupId in allGroups)) {
                throw new Error(`Group id "${groupId}" is missing!`);
            }

            const group = allGroups[groupId];
            const actionsInGroup = group["actions"];
            actionsInGroup.push(...actions);

            // To update all the components
            state.currentScript = { ...state.currentScript }
        },
        addActionsAt: (state, data) => {
            const groupId = data.payload["group-id"];
            const actions = data.payload["actions"];
            const index = data.payload["index"];

            const allGroups = state.currentScript["action-groups"];

            if (!(groupId in allGroups)) {
                throw new Error(`Group id "${groupId}" is missing!`);
            }

            const group = allGroups[groupId];
            const actionsInGroup = group["actions"];
            actionsInGroup.splice(index, 0, ...actions)

            // To update all the components
            state.currentScript = { ...state.currentScript }
        },
        updateAction: (state, data) => {
            const groupId = data.payload["group-id"];
            const updatedAction = data.payload["updated-action"];

            const allGroups = state.currentScript["action-groups"];
            if (!(groupId in allGroups)) {
                throw new Error(`Group id "${groupId}" is missing!`);
            }

            const group = allGroups[groupId];
            const actionsInGroup = group["actions"];

            // Find the index of the action we are updating
            let indexOfUpdatedAction = null;
            for (let i = 0; i < actionsInGroup.length; i++) {
                let action = actionsInGroup[i];

                if (action.id !== updatedAction.id) {
                    continue;
                }

                indexOfUpdatedAction = i;
                break;
            }

            if (indexOfUpdatedAction === null) {
                return;
            }

            actionsInGroup[indexOfUpdatedAction] = updatedAction;
            state.currentScript = { ...state.currentScript };
        },
        removeActions: (state, data) => {
            const groupId = data.payload["group-id"];
            const actionIds = data.payload["action-ids"];

            const allGroups = state.currentScript["action-groups"];
            if (!(groupId in allGroups)) {
                throw new Error(`Group id "${groupId}" is missing!`);
            }

            const group = allGroups[groupId];
            let actionsInGroup = group["actions"];

            actionsInGroup = actionsInGroup.filter(action => !actionIds.includes(action.id));
            group["actions"] = actionsInGroup;

            state.currentScript = { ...state.currentScript };
        },
        swapActionIndexes: (state, data) => {
            const groupId = data.payload["group-id"];
            const indexes = data.payload["indexes"];

            const allGroups = state.currentScript["action-groups"];
            if (!(groupId in allGroups)) {
                throw new Error(`Group id "${groupId}" is missing!`);
            }

            const [actionAIndex, actionBIndex] = indexes;
            const group = allGroups[groupId];
            const actions = group["actions"];
            [actions[actionAIndex], actions[actionBIndex]] = [actions[actionBIndex], actions[actionAIndex]];

            state.currentScript = { ...state.currentScript };
        }
    },
});

const updateScriptPlayStateCall = (playState) => async (dispatch) => {
    dispatch(actionScriptSlice.actions.setPlayState(playState));
}

const startScriptCall = () => async (dispatch) => {
    await actionScriptAPI.startActionScript();
    dispatch(actionScriptSlice.actions.setPlayState("playing"));
};

const pauseScriptCall = () => async (dispatch) => {
    await actionScriptAPI.pauseActionScript();
    dispatch(actionScriptSlice.actions.setPlayState("paused"));
};

const stopScriptCall = () => async (dispatch) => {
    await actionScriptAPI.stopActionScript();
    dispatch(actionScriptSlice.actions.setPlayState("stopped"));
};

const getScriptCall = () => async (dispatch) => {
    const response = await actionScriptAPI.getActionScript();
    dispatch(actionScriptSlice.actions.setCurrentScript(response.data));
};

const updateScriptCall = (scriptData) => async (dispatch) => {
    await actionScriptAPI.updateActionScript(scriptData);
    dispatch(actionScriptSlice.actions.setCurrentScript(scriptData));
    dispatch(actionScriptSlice.actions.setScriptIsModified(true));
};

const getRecentScriptsCall = () => async (dispatch) => {
    const recentScripts = (await actionScriptAPI.getRecentActionScripts()).data;
    dispatch(actionScriptSlice.actions.setRecentScripts(recentScripts));
};

const newRecentScriptCall = (scriptPath) => async (dispatch) => {
    await actionScriptAPI.newRecentActionScript(scriptPath);
    dispatch(getRecentScriptsCall());
};

const saveActionScriptCall = (scriptPath) => async (dispatch) => {
    const response = await actionScriptAPI.saveActionScript(scriptPath);

    if (response.data["save-path"] === "") {
        return;
    }

    dispatch(getRecentScriptsCall());
    dispatch(actionScriptSlice.actions.setScriptIsModified(false));
};

const saveAsActionScriptCall = (scriptPath) => async (dispatch) => {
    const response = await actionScriptAPI.saveAsActionScript(scriptPath);

    if (response.data["save-path"] === "") {
        return;
    }

    dispatch(getRecentScriptsCall());
    dispatch(actionScriptSlice.actions.setScriptIsModified(false));
};

const loadActionScriptCall = (scriptPath) => async (dispatch, getState) => {
    dispatch(actionScriptSlice.actions.setIsLoadingActions(true));

    await actionScriptAPI.loadActionScript(scriptPath);
    await dispatch(getScriptCall());
    dispatch(actionScriptSlice.actions.setIsLoadingActions(false));
    dispatch(actionScriptSlice.actions.setScriptIsModified(false));
};

const setScriptIsModifiedCall = (isModified) => async (dispatch) => {
    dispatch(actionScriptSlice.actions.setScriptIsModified(isModified));
}

const createActionCall = (groupId, actionType) => async (dispatch) => {
    const response = await actionScriptAPI.createAction(groupId, actionType);
    let actionData = response.data;
    dispatch(actionScriptSlice.actions.addActions({ "group-id": groupId, "actions": [actionData] }));
    dispatch(setScriptIsModifiedCall(true));
    return actionData;
};

const addActionsCall = (groupId, actionDatas, index = -1) => async (dispatch) => {
    const response = await actionScriptAPI.addActions(groupId, actionDatas, index);
    const addedActions = response.data;

    if (index === -1) {
        dispatch(actionScriptSlice.actions.addActions({ "group-id": groupId, "actions": addedActions }));
    } else {
        dispatch(actionScriptSlice.actions.addActionsAt({ "group-id": groupId, "actions": addedActions, "index": index }));
    }
    dispatch(setScriptIsModifiedCall(true));
};

const updateActionCall = (groupId, updatedAction) => async (dispatch) => {
    await actionScriptAPI.updateAction(groupId, updatedAction);
    dispatch(actionScriptSlice.actions.updateAction({ "group-id": groupId, "updated-action": updatedAction }));
    dispatch(setScriptIsModifiedCall(true));
};

const removeActionsCall = (groupId, actionIds) => async (dispatch) => {
    actionScriptAPI.removeActions(groupId, actionIds);
    dispatch(actionScriptSlice.actions.removeActions({ "group-id": groupId, "action-ids": actionIds }));
    dispatch(setScriptIsModifiedCall(true));
};

const swapActionIndexesCall = (groupId, indexA, indexB) => async (dispatch) => {
    await actionScriptAPI.swapActionIndexes(groupId, indexA, indexB);
    dispatch(actionScriptSlice.actions.swapActionIndexes({ "group-id": groupId, "indexes": [indexA, indexB] }));
    dispatch(setScriptIsModifiedCall(true));
};

const undoHistoryCall = () => async (dispatch) => {
    /*dispatch(actionScriptSlice.actions.setIsLoadingActions(true));
    const response = await actionScriptAPI.undoHistory();
    const changes = response.data;
    await dispatch(applyActionChangesUndoCall(changes));
    dispatch(actionScriptSlice.actions.setIsLoadingActions(false));
    dispatch(actionScriptSlice.actions.setScriptIsModified(true));*/
};

const redoHistoryCall = () => async (dispatch) => {
    /*dispatch(actionScriptSlice.actions.setIsLoadingActions(true));
    const response = await actionScriptAPI.redoHistory();
    const changes = response.data;
    await dispatch(applyActionChangesRedoCall(changes));
    dispatch(actionScriptSlice.actions.setIsLoadingActions(false));
    dispatch(actionScriptSlice.actions.setScriptIsModified(true));*/
};

export {
    startScriptCall,
    pauseScriptCall,
    stopScriptCall,
    getScriptCall,
    updateScriptCall,
    getRecentScriptsCall,
    newRecentScriptCall,
    saveActionScriptCall,
    saveAsActionScriptCall,
    loadActionScriptCall,
    setScriptIsModifiedCall,
    undoHistoryCall,
    redoHistoryCall,
    updateScriptPlayStateCall,
    createActionCall,
    addActionsCall,
    updateActionCall,
    removeActionsCall,
    swapActionIndexesCall
};
export default actionScriptSlice.reducer;
