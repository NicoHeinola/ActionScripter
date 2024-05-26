import { useCallback, useEffect } from "react";
import { useLocation } from 'react-router-dom';

import { connect } from 'react-redux';
import { redoHistoryCall, saveActionScriptCall, saveAsActionScriptCall, undoHistoryCall } from "store/reducers/actionScriptReducer";

const HistoryManager = (props) => {
    const location = useLocation();
    const currentPath = location.pathname;

    const currentScript = props.currentScript;

    const groupId = props.groupId;
    const undoHistoryCall = props.undoHistoryCall;
    const redoHistoryCall = props.redoHistoryCall;

    const historyCheck = useCallback((event) => {
        if (!event.ctrlKey || event.shiftKey) {
            return;
        }

        let key = event.key.toLowerCase();

        if (key !== "z" && key !== "y") {
            return;
        }

        event.preventDefault();

        if (key === "z") {
            undoHistoryCall(groupId);
        } else {
            redoHistoryCall(groupId);
        }

    }, [undoHistoryCall, redoHistoryCall, groupId]);


    useEffect(() => {
        const handleKeyDown = (event) => {
            // Can't undo changes to a non-existing script
            if (currentScript["missing-script"] === true) {
                return;
            }

            // We can only perform saving and such when we are viewing the script
            if (currentPath !== "/script-editor") {
                return;
            }

            historyCheck(event);
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentScript, currentPath, historyCheck])

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

export default connect(mapStateToProps, mapDispatchToProps)(HistoryManager);