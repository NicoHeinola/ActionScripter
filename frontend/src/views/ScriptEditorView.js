import BasicButton from "components/inputs/BasicButton";
import SelectBox from "components/inputs/SelectBox";
import TextInput from "components/inputs/TextInput";
import { useEffect, useMemo, useState } from "react";

import { connect } from 'react-redux';
import { addActionCall, removeActionCall, setActionsCall, swapActionIndexesCall } from "store/reducers/actionsReducer";
import ActionList from "components/actions/ActionList";

import "styles/views/scripteditorview.scss";
import { getScriptCall, pauseScriptCall, startScriptCall, stopScriptCall, updateScriptCall } from "store/reducers/actionScriptReducer";

import socket from "socket/socketManager";

const ScriptEditorView = (props) => {
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

        props.addActionCall(selectedActionType);
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

        props.updateScriptCall(updatedCurrentScript);
    }

    const setScriptLoopCount = (newValue) => {
        let updatedCurrentScript = { ...props.currentScript };
        updatedCurrentScript["loop-count"] = newValue;
        props.updateScriptCall(updatedCurrentScript);
    }

    return (
        <div className="script-editor-view">
            <div className="add-action-container">
                <div className="actions">
                    <TextInput onChange={e => setActionFilterKeyword(e.target.value)} type={"text"} placeholder={"Filter Actions"}></TextInput>
                    <SelectBox onSelect={setSelectedActionType} className="action-list" placeholder="Actions" options={filteredActions} />
                    <BasicButton disabled={props.currentScript["play-state"] !== "stopped"} onClick={addNewAction} className="add-button">Add</BasicButton>
                </div>
            </div>
            <ActionList />
            <div className="playstate-actions">
                {(props.currentScript["play-state"] !== "playing") ?
                    <BasicButton onClick={startScript} className="play-button">{props.currentScript["play-state"] === "stopped" ? "Start" : "Continue"}</BasicButton>
                    :
                    <BasicButton onClick={pauseScript} className="play-button">Pause</BasicButton>
                }
                <BasicButton disabled={props.currentScript["play-state"] === "stopped"} onClick={stopScript} className="play-button">Stop</BasicButton>
                <BasicButton disabled={props.currentScript["play-state"] !== "stopped"} onClick={switchScriptLoopType} className="repeat-button" icon={`images/icons/${props.currentScript["loop-type"] === 'infinite' ? "loop_infinite.png" : "loop_x_times.png"}`}></BasicButton>
                <TextInput disabled={props.currentScript["play-state"] !== "stopped" || props.currentScript["loop-type"] === 'infinite'} onChange={e => setScriptLoopCount(e.target.value)} value={props.currentScript["loop-count"]} className="input" type="number" placeholder="Loop Count" />
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        allActions: state.actions.allActions,
        currentScript: state.actionScript.currentScript,
    };
};

const mapDispatchToProps = {
    addActionCall,
    removeActionCall,
    setActionsCall,
    swapActionIndexesCall,
    startScriptCall,
    pauseScriptCall,
    stopScriptCall,
    getScriptCall,
    updateScriptCall
};

export default connect(mapStateToProps, mapDispatchToProps)(ScriptEditorView);