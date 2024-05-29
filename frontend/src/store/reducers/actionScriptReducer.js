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
            state.currentScript = { ...state.currentScript }
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
        },
        setActions: (state, data) => {
            const groupId = data.payload["group-id"];
            const actions = data.payload["actions"];
            state.currentScript["action-groups"][`${groupId}`]["actions"] = actions;

            state.currentScript = { ...state.currentScript };
        },
        addActionGroup: (state, data) => {
            const group = data.payload;
            const groupId = group.id;
            state.currentScript["action-groups"][`${groupId}`] = group;

            state.currentScript = { ...state.currentScript }
        },
        updateActionGroup: (state, data) => {
            const groupId = data.payload["group-id"];
            const groupData = data.payload["group-data"];

            state.currentScript["action-groups"][`${groupId}`] = groupData;

            state.currentScript = { ...state.currentScript }
        },
        removeActionGroup: (state, data) => {
            const groupId = data.payload["group-id"];
            delete state.currentScript["action-groups"][`${groupId}`];
            state.currentScript = { ...state.currentScript }
        },
    },
});

const updateScriptPlayStateCall = (playState) => async (dispatch) => {
    dispatch(actionScriptSlice.actions.setPlayState(playState));
}

const setScriptPlayStateCall = (state) => async (dispatch) => {
    dispatch(actionScriptSlice.actions.setPlayState(state));
};

const startScriptCall = (groupId) => async (dispatch) => {
    await actionScriptAPI.startActionScript(groupId);
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

const applyActionChangesUndoCall = (groupId, changes) => async (dispatch, getState) => {
    if (changes.length === 0) {
        return;
    }

    let state = getState();
    let newActions = [...state.actionScript.currentScript["action-groups"][`${groupId}`]["actions"]];
    for (let change of changes) {
        const type = change["type"];
        const index = change["index"];
        const actionBefore = change["action-before"];

        switch (type) {
            case "add-action":
                newActions.splice(index, 1)
                break;
            case "modify-action":
                newActions[index] = actionBefore
                break;
            case "delete-action":
                newActions.splice(index, 0, actionBefore)
                break;
            default:
                console.log(`Unhandled history modification type: ${type}`)
        }
    }

    dispatch(actionScriptSlice.actions.setActions({ "group-id": groupId, "actions": newActions }));
}

const applyActionChangesRedoCall = (groupId, changes) => async (dispatch, getState) => {
    if (changes.length === 0) {
        return;
    }

    let state = getState();
    let newActions = [...state.actionScript.currentScript["action-groups"][`${groupId}`]["actions"]];
    for (let change of changes) {
        const type = change["type"];
        const index = change["index"];
        const actionAfter = change["action-after"];

        switch (type) {
            case "add-action":
                newActions.splice(index, 0, actionAfter)
                break;
            case "modify-action":
                newActions[index] = actionAfter
                break;
            case "delete-action":
                newActions.splice(index, 1)
                break;
            default:
                console.log(`Unhandled history modification type: ${type}`)
        }
    }

    dispatch(actionScriptSlice.actions.setActions({ "group-id": groupId, "actions": newActions }));
}

const undoHistoryCall = (groupId) => async (dispatch) => {
    dispatch(actionScriptSlice.actions.setIsLoadingActions(true));
    const response = await actionScriptAPI.undoHistory(groupId);
    const changes = response.data;
    await dispatch(applyActionChangesUndoCall(groupId, changes));
    dispatch(actionScriptSlice.actions.setIsLoadingActions(false));
    dispatch(actionScriptSlice.actions.setScriptIsModified(true));
};

const redoHistoryCall = (groupId) => async (dispatch) => {
    dispatch(actionScriptSlice.actions.setIsLoadingActions(true));
    const response = await actionScriptAPI.redoHistory(groupId);
    const changes = response.data;
    await dispatch(applyActionChangesRedoCall(groupId, changes));
    dispatch(actionScriptSlice.actions.setIsLoadingActions(false));
    dispatch(actionScriptSlice.actions.setScriptIsModified(true));
};

const addActionGroupCall = () => async (dispatch) => {
    const response = await actionScriptAPI.addActionGroup();
    dispatch(actionScriptSlice.actions.addActionGroup(response.data))
}

const updateActionGroupCall = (groupId, groupData) => async (dispatch) => {
    actionScriptAPI.updateActionGroup(groupId, groupData);
    dispatch(actionScriptSlice.actions.updateActionGroup({ "group-id": groupId, "group-data": groupData }));
}

const removeActionGroupCall = (groupId) => async (dispatch) => {
    actionScriptAPI.removeActionGroup(groupId);
    dispatch(actionScriptSlice.actions.removeActionGroup({ "group-id": groupId }));
}

const setIsLoadingActionsCall = (isLoadingActions) => async (dispatch) => {
    dispatch(actionScriptSlice.actions.setIsLoadingActions(isLoadingActions));
}

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
    swapActionIndexesCall,
    addActionGroupCall,
    updateActionGroupCall,
    removeActionGroupCall,
    setScriptPlayStateCall,
    setIsLoadingActionsCall,
};
export default actionScriptSlice.reducer;
