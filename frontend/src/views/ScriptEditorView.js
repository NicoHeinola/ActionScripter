import "styles/views/scripteditorview.scss";

import BasicButton from "components/inputs/BasicButton";
import SelectBox from "components/inputs/SelectBox";
import TextInput from "components/inputs/TextInput";
import { useCallback, useEffect, useMemo, useState } from "react";

import { connect } from 'react-redux';
import { createActionCall, setScriptPlayStateCall } from "store/reducers/actionScriptReducer";
import ActionList from "components/actions/ActionList";

import { getScriptCall, pauseScriptCall, startScriptCall, stopScriptCall, updateScriptCall } from "store/reducers/actionScriptReducer";

import socket from "socket/socketManager";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import ActionGroupList from "components/actions/groups/ActionGroupList";
import ScriptSettingsForm from "components/forms/ScriptSettingsForm";

const ScriptEditorView = (props) => {
    const navigate = useNavigate();

    let actionTypes = useMemo(() => [
        { "text": "Mouse Click", "value": "mouse-click" },
    ], []);

    const [actionFilterKeyword, setActionFilterKeyword] = useState("");
    const [filteredActions, setFilteredActions] = useState([]);
    const [selectedActionType, setSelectedActionType] = useState("");
    const [settingsOpen, setSettingsOpen] = useState(false);

    const { updateScriptCall, currentScript, isLoadingActions, allSettings, getScriptCall, setScriptPlayStateCall, startScriptCall, stopScriptCall, pauseScriptCall, createActionCall } = props;

    const [currentGroupId, setCurrentGroupId] = useState(0);

    // Filter pickable actions
    useEffect(() => {
        const filterActions = () => {
            let newFilteredActions = [];
            newFilteredActions = actionTypes.filter(action => action.value.toLowerCase().includes(actionFilterKeyword.toLowerCase()));
            setFilteredActions(newFilteredActions);
        }

        filterActions();
    }, [actionFilterKeyword, actionTypes])

    useEffect(() => {
        socket.on("finished-actions", () => {
            setScriptPlayStateCall("stopped")
        });

        return (() => {
            socket.off("finished-actions");
        })
    }, [getScriptCall, setScriptPlayStateCall]);

    const addNewAction = useCallback(() => {
        if (selectedActionType === "") {
            return;
        }

        createActionCall(currentGroupId, selectedActionType);
    }, [currentGroupId, selectedActionType, createActionCall]);

    const startScript = useCallback(() => {
        startScriptCall(currentGroupId);
    }, [currentGroupId, startScriptCall]);

    const pauseScript = useCallback(() => {
        pauseScriptCall();
    }, [pauseScriptCall]);

    const stopScript = useCallback(() => {
        stopScriptCall();
    }, [stopScriptCall]);

    const updateScript = useCallback((updatedScript) => {
        updatedScript = { ...updatedScript };
        console.log(updatedScript);
        updateScriptCall(updatedScript);
    }, [updateScriptCall]);

    const switchScriptLoopType = useCallback(() => {
        let updatedData = {};

        if (currentScript["loop-type"] === "infinite") {
            updatedData["loop-type"] = "loop-x-times";
        } else {
            updatedData["loop-type"] = "infinite";
        }

        updateScript(updatedData);
    }, [updateScript, currentScript]);

    const setScriptLoopCount = useCallback((newValue) => {
        let updatedData = {};
        updatedData["loop-count"] = newValue;
        updateScript(updatedData);
    }, [updateScript]);

    const openSettings = useCallback(() => {
        setSettingsOpen(true);
    }, []);

    if (currentScript["missing-script"] && !isLoadingActions) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="script-editor-view page">
                <div className="missing-script">
                    <div className="text-container">
                        <p>No script found!</p>
                        <p>Please create or select one first.</p>
                    </div>
                    <BasicButton className="button" onClick={() => navigate("/")}>Home</BasicButton>
                    <BasicButton className="button" theme="warning" onClick={() => window.history.back()}>Go back</BasicButton>
                </div>
            </motion.div>
        )
    }

    const actionsInGroup = currentScript["action-groups"][`${currentGroupId}`]["actions"];

    const isStopped = currentScript["play-state"] === "stopped";
    const hotkeysEnabled = currentScript["hotkeys-enabled"] && allSettings["hotkeys-enabled"] === "true";
    const startHotkeyText = (hotkeysEnabled) ? `${currentScript["hotkeys"]["start-script"]["display"]}` : "";
    const stopHotkeyText = (hotkeysEnabled) ? `${currentScript["hotkeys"]["stop-script"]["display"]}` : "";

    let playButton = <></>;
    const playTextAlignment = hotkeysEnabled && startHotkeyText ? "flex-start" : "center";
    const stopTextAlignment = hotkeysEnabled && stopHotkeyText ? "flex-start" : "center";
    switch (currentScript["play-state"]) {
        case "playing":
            playButton = <BasicButton centering={playTextAlignment} onClick={pauseScript} className="play-button" icon="images/icons/pause_play.png">{startHotkeyText}</BasicButton>
            break;
        case "stopped":
            playButton = <BasicButton centering={playTextAlignment} disabled={actionsInGroup.length === 0} onClick={startScript} className="play-button" icon="images/icons/start_play.png">{startHotkeyText}</BasicButton>
            break;
        case "paused":
            playButton = <BasicButton centering={playTextAlignment} onClick={startScript} className="play-button" icon="images/icons/continue_play.png">{startHotkeyText}</BasicButton>
            break;
        default:
            break;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="script-editor-view page">
            <ScriptSettingsForm visible={settingsOpen} onVisibilityChange={setSettingsOpen} />
            <div className="add-action-container">
                <div className="actions">
                    <TextInput value={actionFilterKeyword} onChange={setActionFilterKeyword} type="text" placeholder="Filter Actions"></TextInput>
                    <SelectBox onSelect={setSelectedActionType} className="action-list" placeholder="Actions" options={filteredActions} />
                    <BasicButton theme="add" disabled={!isStopped || isLoadingActions} onClick={addNewAction} className="add-button" icon={"images/icons/new_action.png"}></BasicButton>
                </div>
            </div>
            <div className="action-manager">
                <ActionGroupList onChangeGroup={groupId => setCurrentGroupId(groupId)} currentGroupId={currentGroupId} />
                <ActionList groupId={currentGroupId} />
            </div>
            <div className="playstate-actions">
                {playButton}
                <BasicButton theme="warning" centering={stopTextAlignment} disabled={currentScript["play-state"] === "stopped" || isLoadingActions} onClick={stopScript} icon="images/icons/stop_play.png" className="play-button cancel">{stopHotkeyText}</BasicButton>
                <BasicButton disabled={!isStopped || isLoadingActions} onClick={openSettings} theme="utility" icon="images/icons/settings_2.png" className="small-button"></BasicButton>
                <BasicButton disabled={!isStopped || isLoadingActions} onClick={switchScriptLoopType} className="small-button" icon={`images/icons/${currentScript["loop-type"] === 'infinite' ? "loop_infinite.png" : "loop_x_times.png"}`}></BasicButton>
                <TextInput min="0" value={currentScript["loop-count"]} onChange={newValue => setScriptLoopCount(newValue)} className="input" type="number" placeholder="Loops" disabled={!isStopped || currentScript["loop-type"] === 'infinite' || isLoadingActions} />
            </div>
        </motion.div>
    );
}

const mapStateToProps = (state) => {
    return {
        currentScript: state.actionScript.currentScript,
        isLoadingActions: state.actionScript.isLoadingActions,
        allSettings: state.settings.allSettings,
    };
};

const mapDispatchToProps = {
    createActionCall,
    startScriptCall,
    pauseScriptCall,
    stopScriptCall,
    getScriptCall,
    updateScriptCall,
    setScriptPlayStateCall
};

export default connect(mapStateToProps, mapDispatchToProps)(ScriptEditorView);