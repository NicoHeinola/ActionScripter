import { createSlice } from '@reduxjs/toolkit';
import actionScriptAPI from "apis/actionScriptAPI";
import { setActionsCall } from './actionsReducer';

const initialState = {
    isLoadingActions: false,
    currentScript: {
        "loop-count": -1,
        "missing-script": true,
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
    },
});

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

    const state = getState(); // Accessing the current Redux state
    const currentScriptIsMissing = state.actionScript.currentScript["missing-script"] === true

    if (!currentScriptIsMissing) await dispatch(setActionsCall([]));
    const loadedScript = (await actionScriptAPI.loadActionScript(scriptPath)).data;
    await dispatch(setActionsCall(loadedScript["actions"]));
    await dispatch(getScriptCall());
    dispatch(actionScriptSlice.actions.setIsLoadingActions(false));
    dispatch(actionScriptSlice.actions.setScriptIsModified(false));
};

const setScriptIsModifiedCall = (isModified) => async (dispatch) => {
    dispatch(actionScriptSlice.actions.setScriptIsModified(isModified));
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
    setScriptIsModifiedCall
};
export default actionScriptSlice.reducer;
