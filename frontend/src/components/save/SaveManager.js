import { useCallback, useEffect } from "react";
import { useLocation } from 'react-router-dom';

import { connect } from 'react-redux';
import { redoHistoryCall, saveActionScriptCall, saveAsActionScriptCall, undoHistoryCall } from "store/reducers/actionScriptReducer";

const SaveManager = (props) => {
    const location = useLocation();
    const currentPath = location.pathname;

    const saveActionScriptCall = props.saveActionScriptCall;
    const saveAsActionScriptCall = props.saveAsActionScriptCall;
    const undoHistoryCall = props.undoHistoryCall;
    const redoHistoryCall = props.redoHistoryCall;

    const handleSaveFile = useCallback(() => {
        saveActionScriptCall();
    }, [saveActionScriptCall]);

    const handleSaveAsFile = useCallback(() => {
        saveAsActionScriptCall();
    }, [saveAsActionScriptCall]);

    const currentScript = props.currentScript;

    const saveCheck = useCallback((event) => {
        if (event.ctrlKey && event.key.toLowerCase() === 's') {
            event.preventDefault();


            if (event.shiftKey) {
                handleSaveAsFile();
                return;
            }

            handleSaveFile();
        }
    }, [handleSaveAsFile, handleSaveFile]);

    const historyCheck = useCallback((event) => {
        if (!event.ctrlKey) {
            return;
        }

        let key = event.key.toLowerCase();

        if (key !== "z" && key !== "y") {
            return;
        }

        event.preventDefault();

        if (key === "z") {
            undoHistoryCall();
        } else {
            redoHistoryCall();
        }

    }, [undoHistoryCall, redoHistoryCall]);


    useEffect(() => {
        const handleKeyDown = (event) => {
            // Can't save a non-existing script
            if (currentScript["missing-script"] === true) {
                return;
            }

            // We can only perform saving and such when we are viewing the script
            if (currentPath !== "/script-editor") {
                return;
            }

            saveCheck(event);
            historyCheck(event);
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentScript, currentPath, saveCheck, historyCheck])

    return (
        <></>
    )
};


const mapStateToProps = (state) => {
    return {
        currentScript: state.actionScript.currentScript,
    };
};

const mapDispatchToProps = {
    saveActionScriptCall,
    saveAsActionScriptCall,
    undoHistoryCall,
    redoHistoryCall
};

export default connect(mapStateToProps, mapDispatchToProps)(SaveManager);