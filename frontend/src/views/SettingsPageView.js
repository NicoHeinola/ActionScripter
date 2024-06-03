import GroupBox from "components/boxes/GroupBox";
import TextInput from "components/inputs/TextInput";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { connect } from 'react-redux';
import { loadSettingDefaultsCall, loadSettingsCall, updateSettingsCall } from "store/reducers/settingsReducer";
import "styles/views/settingspageview.scss";
import { ring } from 'ldrs'
import KeyPickerInput from "components/inputs/KeyPickerInput";
import CheckboxInput from "components/inputs/CheckboxInput";

ring.register()

const SettingsPageView = (props) => {

    const { loadSettingDefaultsCall, loadSettingsCall, allSettings, settingDefaults, updateSettingsCall } = props;

    // Setting keys
    const startKeyDisplay = allSettings["start-script-display"];
    const stopKeyDisplay = allSettings["stop-script-display"];

    const isLoadingSettings = Object.keys(allSettings).length === 0;

    useEffect(() => {
        loadSettingsCall();
        loadSettingDefaultsCall();
    }, [loadSettingsCall, loadSettingDefaultsCall]);

    const hasSettingDefaultValue = (settingName) => {
        return String(allSettings[settingName]) === String(settingDefaults[settingName]);
    }

    const updateSettings = (settingsToUpdate) => {
        updateSettingsCall(settingsToUpdate);
    }

    const resetSettings = (settingNames) => {
        let settingsToReset = {}
        for (let name of settingNames) {
            settingsToReset[name] = settingDefaults[name];
        }
        updateSettings(settingsToReset);
    }

    const hotkeysEnabled = allSettings["hotkeys-enabled"] === "true";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="settings-page-view page">
            <div className="settings">
                {
                    isLoadingSettings ?
                        <l-ring color="white"></l-ring>
                        :
                        <>
                            <GroupBox title="General" className="group">
                                <TextInput placeholder="Actions per page" icons={!hasSettingDefaultValue("actions-per-page") ? [{ id: "reset", src: "images/icons/reset.png", onClick: () => resetSettings(["actions-per-page"]) }] : []} onChange={(newValue) => updateSettings({ "actions-per-page": newValue })} value={Number(allSettings["actions-per-page"])} type="number" min="1"></TextInput>
                                <TextInput placeholder="Location picker delay (s)" icons={!hasSettingDefaultValue("mouse-location-picker-wait-delay-s") ? [{ id: "reset", src: "images/icons/reset.png", onClick: () => resetSettings(["mouse-location-picker-wait-delay-s"]) }] : []} onChange={(newValue) => updateSettings({ "mouse-location-picker-wait-delay-s": String(newValue) })} value={Number(allSettings["mouse-location-picker-wait-delay-s"])} type="number" min="0" step="any"></TextInput>
                            </GroupBox>
                            <GroupBox title="Default keys" className="group">
                                <CheckboxInput label="Track key presses" onChecked={checked => updateSettings({ "hotkeys-enabled": checked.toString() })} checked={hotkeysEnabled} />
                                <KeyPickerInput value={startKeyDisplay} icons={!hasSettingDefaultValue("start-script") ? [{ id: "reset", src: "images/icons/reset.png", onClick: () => resetSettings(["start-script", "start-script-display"]) }] : []} onChange={(codes, text) => updateSettings({ "start-script": codes.join("+"), "start-script-display": text })} placeholder="Start / Pause / Continue" ></KeyPickerInput>
                                <KeyPickerInput value={stopKeyDisplay} icons={!hasSettingDefaultValue("stop-script") ? [{ id: "reset", src: "images/icons/reset.png", onClick: () => resetSettings(["stop-script", "stop-script-display"]) }] : []} onChange={(codes, text) => updateSettings({ "stop-script": codes.join("+"), "stop-script-display": text })} placeholder="Stop"></KeyPickerInput>
                            </GroupBox>
                        </>
                }
            </div>
        </motion.div>
    )
}

const mapStateToProps = (state) => {
    return {
        allSettings: state.settings.allSettings,
        settingDefaults: state.settings.settingDefaults,
    };
};

const mapDispatchToProps = {
    loadSettingsCall,
    loadSettingDefaultsCall,
    updateSettingsCall
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPageView);
