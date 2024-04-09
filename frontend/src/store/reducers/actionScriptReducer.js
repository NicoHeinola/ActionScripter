import { createSlice } from '@reduxjs/toolkit';
import actionScriptAPI from "apis/actionScriptAPI";

const initialState = {
    currentScript: {
        "loop-count": -1
    }
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
    let newScriptData = { ...scriptData };

    // Actions are updated elsewhere
    delete newScriptData["actions"];

    await actionScriptAPI.updateActionScript(newScriptData);
    dispatch(actionScriptSlice.actions.setCurrentScript(newScriptData));
};

export {
    startScriptCall,
    pauseScriptCall,
    stopScriptCall,
    getScriptCall,
    updateScriptCall,
};
export default actionScriptSlice.reducer;
