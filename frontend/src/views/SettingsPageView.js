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

    const loadSettingDefaultsCall = props.loadSettingDefaultsCall;
    const loadSettingsCall = props.loadSettingsCall;
    const allSettings = props.allSettings;
    const settingDefaults = props.settingDefaults;

    useEffect(() => {
        loadSettingsCall();
        loadSettingDefaultsCall();
    }, [loadSettingsCall, loadSettingDefaultsCall]);

    const hasSettingDefaultValue = (settingName) => {
        return String(allSettings[settingName]) === String(settingDefaults[settingName]);
    }

    const updateSettings = (settingsToUpdate) => {
        props.updateSettingsCall(settingsToUpdate);
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
                    (Object.keys(settingDefaults).length === 0) ?
                        <l-ring color="white"></l-ring>
                        :
                        <>
                            <GroupBox title="General" className="group">
                                <TextInput placeholder="Actions per page" onIconClicked={() => resetSettings(["actions-per-page"])} onChange={(newValue) => updateSettings({ "actions-per-page": newValue })} value={Number(allSettings["actions-per-page"])} icons={!hasSettingDefaultValue("actions-per-page") ? [{ id: "reset", src: "images/icons/reset.png" }] : []} type="number" min="1"></TextInput>
                                <TextInput placeholder="Location picker delay (s)" onIconClicked={() => resetSettings(["mouse-location-picker-wait-delay-s"])} onChange={(newValue) => updateSettings({ "mouse-location-picker-wait-delay-s": String(newValue) })} value={Number(allSettings["mouse-location-picker-wait-delay-s"])} icons={!hasSettingDefaultValue("mouse-location-picker-wait-delay-s") ? [{ id: "reset", src: "images/icons/reset.png" }] : []} type="number" min="0" step="any"></TextInput>
                            </GroupBox>
                            <GroupBox title="Keys" className="group">
                                <CheckboxInput label="Hotkeys enabled" onChecked={checked => updateSettings({ "hotkeys-enabled": checked.toString() })} checked={hotkeysEnabled} />
                                <KeyPickerInput disabled={!hotkeysEnabled} value={allSettings["start-script-key-combination-display"]} onIconClicked={() => resetSettings(["start-script-key-combination", "start-script-key-combination-display"])} onChange={(codes, text) => updateSettings({ "start-script-key-combination": codes.join("+"), "start-script-key-combination-display": text })} placeholder="Start / Pause / Continue" icons={!hasSettingDefaultValue("start-script-key-combination-display") ? [{ id: "reset", src: "images/icons/reset.png" }] : []}></KeyPickerInput>
                                <KeyPickerInput disabled={!hotkeysEnabled} value={allSettings["stop-script-key-combination-display"]} onIconClicked={() => resetSettings(["stop-script-key-combination", "stop-script-key-combination-display"])} onChange={(codes, text) => updateSettings({ "stop-script-key-combination": codes.join("+"), "stop-script-key-combination-display": text })} placeholder="Stop" icons={!hasSettingDefaultValue("stop-script-key-combination-display") ? [{ id: "reset", src: "images/icons/reset.png" }] : []}></KeyPickerInput>
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
