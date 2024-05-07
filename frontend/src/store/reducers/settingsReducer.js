import { createSlice } from '@reduxjs/toolkit';
import settingAPI from "apis/settingAPI";

const initialState = {
    allSettings: {},
    settingDefaults: {},
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        updateSettings: (state, settingsToUpdate) => {
            let updatedSettings = { ...state.allSettings, ...settingsToUpdate.payload };
            state.allSettings = updatedSettings;
        },
        updateSettingDefaults: (state, newDefaults) => {
            let updatedDefaults = { ...state.settingDefaults, ...newDefaults.payload };
            state.settingDefaults = updatedDefaults;
        },
    },
});

const updateSettingsCall = (settingsToUpdate) => async (dispatch) => {
    settingAPI.updateSettings(settingsToUpdate);
    dispatch(settingsSlice.actions.updateSettings(settingsToUpdate));
};

const loadSettingsCall = () => async (dispatch) => {
    const response = await settingAPI.getAllSettings();
    let allSettings = response.data;
    dispatch(settingsSlice.actions.updateSettings(allSettings));
};

const loadSettingDefaultsCall = () => async (dispatch) => {
    const response = await settingAPI.getSettingDefaults();
    let defaults = response.data;
    dispatch(settingsSlice.actions.updateSettingDefaults(defaults));
};

export {
    updateSettingsCall,
    loadSettingsCall,
    loadSettingDefaultsCall
};

export default settingsSlice.reducer;
