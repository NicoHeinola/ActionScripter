import BasicButton from "components/inputs/BasicButton";
import SelectBox from "components/inputs/SelectBox";
import TextInput from "components/inputs/TextInput";
import { useEffect, useMemo, useState } from "react";

import { connect } from 'react-redux';
import { createActionCall, setScriptPlayStateCall } from "store/reducers/actionScriptReducer";
import ActionList from "components/actions/ActionList";

import "styles/views/scripteditorview.scss";
import { getScriptCall, pauseScriptCall, startScriptCall, stopScriptCall, updateScriptCall } from "store/reducers/actionScriptReducer";

import socket from "socket/socketManager";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import HistoryManager from "components/save/HistoryManager";
import ActionGroupList from "components/actions/groups/ActionGroupList";

const ScriptEditorView = (props) => {
    const navigate = useNavigate();

    let actionTypes = useMemo(() => [
        { "text": "Mouse Click", "value": "mouse-click" },
    ], []);

    const [actionFilterKeyword, setActionFilterKeyword] = useState("");
    const [filteredActions, setFilteredActions] = useState([]);
    const [selectedActionType, setSelectedActionType] = useState("");

    const currentScript = props.currentScript;

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

    const getScriptCall = props.getScriptCall;

    const setScriptPlayStateCall = props.setScriptPlayStateCall;

    useEffect(() => {
        socket.on("finished-actions", () => {
            setScriptPlayStateCall("stopped")
        });

        return (() => {
            socket.off("finished-actions");
        })
    }, [getScriptCall, setScriptPlayStateCall]);

    const addNewAction = () => {
        if (selectedActionType === "") {
            return;
        }

        props.createActionCall(currentGroupId, selectedActionType);
    }

    const startScript = () => {
        props.startScriptCall(currentGroupId);
    }

    const pauseScript = () => {
        props.pauseScriptCall();
    }

    const stopScript = () => {
        props.stopScriptCall();
    }

    const switchScriptLoopType = () => {
        let updatedCurrentScript = { ...currentScript };

        if (updatedCurrentScript["loop-type"] === "infinite") {
            updatedCurrentScript["loop-type"] = "loop-x-times";
        } else {
            updatedCurrentScript["loop-type"] = "infinite";
        }

        updateScript(updatedCurrentScript);
    }

    const setScriptLoopCount = (newValue) => {
        let updatedCurrentScript = { ...currentScript };
        updatedCurrentScript["loop-count"] = newValue;
        updateScript(updatedCurrentScript);
    }

    const updateScript = (updatedScript) => {
        updatedScript = { ...updatedScript };

        // Actions are updated elsewhere
        delete updatedScript["actions"];

        props.updateScriptCall(updatedScript);
    }

    if (currentScript["missing-script"] && !props.isLoadingActions) {
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
                    <BasicButton className="button" onClick={() => window.history.back()}>Go back</BasicButton>
                </div>
            </motion.div>
        )
    }

    const actionsInGroup = currentScript["action-groups"][`${currentGroupId}`]["actions"];

    const isStopped = currentScript["play-state"] === "stopped";
    const hotkeysEnabled = props.allSettings["hotkeys-enabled"] === "true";
    const startHotkeyText = (hotkeysEnabled) ? `${props.allSettings["start-script-key-combination-display"]}` : "";
    const stopHotkeyText = (hotkeysEnabled) ? `${props.allSettings["stop-script-key-combination-display"]}` : "";

    let playButton = <></>;
    const buttonTextAlignment = hotkeysEnabled ? "flex-start" : "center";
    switch (currentScript["play-state"]) {
        case "playing":
            playButton = <BasicButton centering={buttonTextAlignment} onClick={pauseScript} className="play-button" icon="images/icons/pause_play.png">{startHotkeyText}</BasicButton>
            break;
        case "stopped":
            playButton = <BasicButton centering={buttonTextAlignment} disabled={actionsInGroup.length === 0} onClick={startScript} className="play-button" icon="images/icons/start_play.png">{startHotkeyText}</BasicButton>
            break;
        case "paused":
            playButton = <BasicButton centering={buttonTextAlignment} onClick={startScript} className="play-button" icon="images/icons/continue_play.png">{startHotkeyText}</BasicButton>
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
            <HistoryManager groupId={currentGroupId} />
            <div className="add-action-container">
                <div className="actions">
                    <TextInput onChange={newValue => setActionFilterKeyword(newValue)} type={"text"} placeholder={"Filter Actions"}></TextInput>
                    <SelectBox onSelect={setSelectedActionType} className="action-list" placeholder="Actions" options={filteredActions} />
                    <BasicButton disabled={!isStopped || props.isLoadingActions} onClick={addNewAction} className="add-button" icon={"images/icons/new_action.png"}></BasicButton>
                </div>
            </div>
            <div className="action-manager">
                <ActionGroupList onChangeGroup={groupId => setCurrentGroupId(groupId)} currentGroupId={currentGroupId} />
                <ActionList groupId={currentGroupId} />
            </div>
            <div className="playstate-actions">
                {playButton}
                <BasicButton centering={buttonTextAlignment} disabled={currentScript["play-state"] === "stopped" || props.isLoadingActions} onClick={stopScript} icon="images/icons/stop_play.png" className="play-button cancel">{stopHotkeyText}</BasicButton>
                <BasicButton disabled={!isStopped || props.isLoadingActions} onClick={switchScriptLoopType} className="repeat-button" icon={`images/icons/${currentScript["loop-type"] === 'infinite' ? "loop_infinite.png" : "loop_x_times.png"}`}></BasicButton>
                <TextInput min="0" value={currentScript["loop-count"]} onChange={newValue => setScriptLoopCount(newValue)} className="input" type="number" placeholder="Loop Count" disabled={!isStopped || currentScript["loop-type"] === 'infinite' || props.isLoadingActions} />
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