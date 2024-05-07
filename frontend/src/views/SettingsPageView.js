import GroupBox from "components/boxes/GroupBox";
import TextInput from "components/inputs/TextInput";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { connect } from 'react-redux';
import { loadSettingDefaultsCall, loadSettingsCall, updateSettingsCall } from "store/reducers/settingsReducer";
import "styles/views/settingspageview.scss";
import { ring } from 'ldrs'

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

    const updateSetting = (settingName, newValue) => {
        let settingsToUpdate = {}
        settingsToUpdate[settingName] = String(newValue);
        props.updateSettingsCall(settingsToUpdate);
    }

    const resetSetting = (settingName) => {
        updateSetting(settingName, settingDefaults[settingName]);
    }

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
                        <GroupBox title="General" className="group">
                            <TextInput placeholder="Actions per page" onIconClicked={() => resetSetting("actions-per-page")} onChange={(newValue) => updateSetting("actions-per-page", newValue)} value={Number(allSettings["actions-per-page"])} icons={!hasSettingDefaultValue("actions-per-page") ? [{ id: "reset", src: "images/icons/reset.png" }] : []} type="number" min="1"></TextInput>
                            <TextInput placeholder="Mouse location picker wait delay (seconds)" onIconClicked={() => resetSetting("mouse-location-picker-wait-delay-s")} onChange={(newValue) => updateSetting("mouse-location-picker-wait-delay-s", newValue)} value={Number(allSettings["mouse-location-picker-wait-delay-s"])} icons={!hasSettingDefaultValue("mouse-location-picker-wait-delay-s") ? [{ id: "reset", src: "images/icons/reset.png" }] : []} type="number" min="0"></TextInput>
                        </GroupBox>
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
