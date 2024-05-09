import BasicButton from "components/inputs/BasicButton";
import SelectBox from "components/inputs/SelectBox";
import TextInput from "components/inputs/TextInput";
import { useEffect, useMemo, useState } from "react";

import { connect } from 'react-redux';
import { createActionCall, removeActionCall, swapActionIndexesCall } from "store/reducers/actionsReducer";
import ActionList from "components/actions/ActionList";

import "styles/views/scripteditorview.scss";
import { getScriptCall, pauseScriptCall, startScriptCall, stopScriptCall, updateScriptCall } from "store/reducers/actionScriptReducer";

import socket from "socket/socketManager";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";

const ScriptEditorView = (props) => {
    const navigate = useNavigate();

    let actionTypes = useMemo(() => [
        { "text": "Mouse Click", "value": "mouse-click" },
    ], []);

    const [actionFilterKeyword, setActionFilterKeyword] = useState("");
    const [filteredActions, setFilteredActions] = useState([]);
    const [selectedActionType, setSelectedActionType] = useState("");

    useEffect(() => {
        const filterActions = () => {
            let newFilteredActions = [];
            newFilteredActions = actionTypes.filter(action => action.value.toLowerCase().includes(actionFilterKeyword.toLowerCase()));
            setFilteredActions(newFilteredActions);
        }

        filterActions();
    }, [actionFilterKeyword, actionTypes])

    const getScriptCall = props.getScriptCall;

    useEffect(() => {
        socket.on("finished-actions", () => {
            getScriptCall();
        });

        return (() => {
            socket.off("finished-actions");
        })
    }, [getScriptCall]);

    const addNewAction = () => {
        if (selectedActionType === "") {
            return;
        }

        props.createActionCall(selectedActionType);
    }

    const startScript = () => {
        props.startScriptCall();
    }

    const pauseScript = () => {
        props.pauseScriptCall();
    }

    const stopScript = () => {
        props.stopScriptCall();
    }

    const switchScriptLoopType = () => {
        let updatedCurrentScript = { ...props.currentScript };

        if (updatedCurrentScript["loop-type"] === "infinite") {
            updatedCurrentScript["loop-type"] = "loop-x-times";
        } else {
            updatedCurrentScript["loop-type"] = "infinite";
        }

        updateScript(updatedCurrentScript);
    }

    const setScriptLoopCount = (newValue) => {
        let updatedCurrentScript = { ...props.currentScript };
        updatedCurrentScript["loop-count"] = newValue;
        updateScript(updatedCurrentScript);
    }

    const updateScript = (updatedScript) => {
        updatedScript = { ...updatedScript };

        // Actions are updated elsewhere
        delete updatedScript["actions"];

        props.updateScriptCall(updatedScript);
    }

    if (props.currentScript["missing-script"] && !props.isLoadingActions) {
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

    const isStopped = props.currentScript["play-state"] === "stopped";
    const hotkeysEnabled = props.allSettings["hotkeys-enabled"] === "true";
    const startHotkeyText = (hotkeysEnabled) ? `(${props.allSettings["start-script-key-combination-display"]})` : "";
    const stopHotkeyText = (hotkeysEnabled) ? `(${props.allSettings["stop-script-key-combination-display"]})` : "";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="script-editor-view page">
            <div className="add-action-container">
                <div className="actions">
                    <TextInput onChange={newValue => setActionFilterKeyword(newValue)} type={"text"} placeholder={"Filter Actions"}></TextInput>
                    <SelectBox onSelect={setSelectedActionType} className="action-list" placeholder="Actions" options={filteredActions} />
                    <BasicButton disabled={!isStopped || props.isLoadingActions} onClick={addNewAction} className="add-button">Add</BasicButton>
                </div>
            </div>
            <ActionList />
            <div className="playstate-actions">
                {(props.currentScript["play-state"] !== "playing") ?
                    <BasicButton disabled={props.allActions.length === 0} onClick={startScript} className="play-button">{props.currentScript["play-state"] === "stopped" ? "Start" : "Continue"} {startHotkeyText}</BasicButton>
                    :
                    <BasicButton onClick={pauseScript} className="play-button">Pause {startHotkeyText}</BasicButton>
                }
                <BasicButton disabled={props.currentScript["play-state"] === "stopped" || props.isLoadingActions} onClick={stopScript} className="play-button cancel">Stop {stopHotkeyText}</BasicButton>
                <BasicButton disabled={!isStopped || props.isLoadingActions} onClick={switchScriptLoopType} className="repeat-button" icon={`images/icons/${props.currentScript["loop-type"] === 'infinite' ? "loop_infinite.png" : "loop_x_times.png"}`}></BasicButton>
                <TextInput min="0" value={props.currentScript["loop-count"]} onChange={newValue => setScriptLoopCount(newValue)} className="input" type="number" placeholder="Loop Count" disabled={!isStopped || props.currentScript["loop-type"] === 'infinite' || props.isLoadingActions} />
            </div>
        </motion.div>
    );
}

const mapStateToProps = (state) => {
    return {
        allActions: state.actions.allActions,
        currentScript: state.actionScript.currentScript,
        isLoadingActions: state.actionScript.isLoadingActions,
        allSettings: state.settings.allSettings,
    };
};

const mapDispatchToProps = {
    createActionCall,
    removeActionCall,
    swapActionIndexesCall,
    startScriptCall,
    pauseScriptCall,
    stopScriptCall,
    getScriptCall,
    updateScriptCall
};

export default connect(mapStateToProps, mapDispatchToProps)(ScriptEditorView);