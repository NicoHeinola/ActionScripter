import "styles/components/forms/scriptsettingsform.scss";
import PopupForm from "./PopupForm";
import GroupBox from "components/boxes/GroupBox";
import CheckboxInput from "components/inputs/CheckboxInput";
import KeyPickerInput from "components/inputs/KeyPickerInput";
import { updateScriptCall } from "store/reducers/actionScriptReducer";
import { connect } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { loadSettingsCall } from "store/reducers/settingsReducer";
const ScriptSettingsForm = (props) => {

    const { visible, onVisibilityChange, currentScript, allSettings, loadSettingsCall, updateScriptCall } = props;

    const [dataToUpdate, setDataToUpdate] = useState({ ...currentScript });
    const hotkeys = dataToUpdate["hotkeys"];

    useEffect(() => {
        loadSettingsCall();
    }, [loadSettingsCall]);

    const resetData = useCallback(() => {
        setDataToUpdate({ ...currentScript })
    }, [currentScript]);

    useEffect(() => {
        resetData();
    }, [resetData]);

    const hasSettingValue = useCallback((settingName, value) => {
        return String(value) === String(allSettings[settingName]);
    }, [allSettings]);

    const updateHotkey = useCallback((key, hotkey, display) => {
        setDataToUpdate(prevData => {
            const newData = { ...prevData };
            const newHotkeys = { ...newData["hotkeys"] };
            const newHotkey = { ...newHotkeys[key] };

            newHotkey["hotkey"] = hotkey;
            newHotkey["display"] = display;

            newHotkeys[key] = newHotkey;
            newData["hotkeys"] = newHotkeys;

            return newData;
        });
    }, []);

    const resetHotkey = useCallback((key) => {
        updateHotkey(key, String(allSettings[key]), String(allSettings[`${key}-display`]));
    }, [updateHotkey, allSettings]);

    const save = useCallback(() => {
        const newData = { ...dataToUpdate };
        delete newData["action-groups"];
        updateScriptCall(newData);
    }, [dataToUpdate, updateScriptCall]);

    const updateHotkeysEnabled = useCallback((enabled) => {
        setDataToUpdate(prevData => {
            const newData = { ...prevData };
            newData["hotkeys-enabled"] = enabled;
            return newData;
        });
    }, []);

    return (
        <PopupForm onCancel={resetData} allowSaving={true} onSave={save} visible={visible} onVisibilityChange={onVisibilityChange}>
            <div className="script-settings-form">
                <GroupBox title="Hotkeys" className="box">
                    <CheckboxInput onChecked={updateHotkeysEnabled} checked={dataToUpdate["hotkeys-enabled"]} label="Hotkeys enabled" />
                    {
                        Object.entries(hotkeys).map(([key, hotkey]) =>
                            <KeyPickerInput icons={!hasSettingValue(key, hotkey["hotkey"]) ? [{ id: "reset", src: "images/icons/reset.png", onClick: () => resetHotkey(key) }] : []} onChange={(codes, text) => updateHotkey(key, codes.join("+"), text)} value={hotkey["display"]} placeholder={hotkey["text"]} key={`hotkey-${key}`} />
                        )
                    }
                </GroupBox>
            </div>
        </PopupForm>
    )
}

const mapStateToProps = (state) => {
    return {
        currentScript: state.actionScript.currentScript,
        allSettings: state.settings.allSettings,
    };
};

const mapDispatchToProps = {
    updateScriptCall,
    loadSettingsCall
};

export default connect(mapStateToProps, mapDispatchToProps)(ScriptSettingsForm);