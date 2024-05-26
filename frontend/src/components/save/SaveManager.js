import { useCallback, useEffect } from "react";
import { useLocation } from 'react-router-dom';

import { connect } from 'react-redux';
import { saveActionScriptCall, saveAsActionScriptCall } from "store/reducers/actionScriptReducer";

const SaveManager = (props) => {
    const location = useLocation();
    const currentPath = location.pathname;

    const saveActionScriptCall = props.saveActionScriptCall;
    const saveAsActionScriptCall = props.saveAsActionScriptCall;

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
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentScript, currentPath, saveCheck])

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
};

export default connect(mapStateToProps, mapDispatchToProps)(SaveManager);