import { createSlice } from '@reduxjs/toolkit';
import actionScriptAPI from "apis/actionScriptAPI";
import { setActionsCall } from './actionsReducer';

const initialState = {
    currentScript: {
        "loop-count": -1
    },
    recentScripts: []
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
        }
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
    await actionScriptAPI.saveActionScript(scriptPath);
    dispatch(getRecentScriptsCall());
};

const saveAsActionScriptCall = (scriptPath) => async (dispatch) => {
    await actionScriptAPI.saveAsActionScript(scriptPath);
    dispatch(getRecentScriptsCall());
};

const loadActionScriptCall = (scriptPath) => async (dispatch) => {
    const loadedScript = (await actionScriptAPI.loadActionScript(scriptPath)).data;
    dispatch(setActionsCall(loadedScript["actions"]));
    dispatch(getScriptCall());
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
};
export default actionScriptSlice.reducer;
