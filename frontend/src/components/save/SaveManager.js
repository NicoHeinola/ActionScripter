import { useCallback, useEffect } from "react";
import { useLocation } from 'react-router-dom';

import { connect } from 'react-redux';
import { saveActionScriptCall, saveAsActionScriptCall } from "store/reducers/actionScriptReducer";
import { save } from '@tauri-apps/api/dialog';

const SaveManager = (props) => {
    const location = useLocation();
    const currentPath = location.pathname;

    const { saveActionScriptCall, saveAsActionScriptCall } = props;

    const handleSaveFile = useCallback(() => {
        saveActionScriptCall();
    }, [saveActionScriptCall]);

    const handleSaveAsFile = useCallback(async () => {

        // Open a selection dialog for directories
        const savePath = await save({
            "title": "Save as",
            "filters": [
                {
                    "name": "ActionScript",
                    "extensions": ["acsc"]
                }
            ]

        });

        if (!savePath) {
            return;
        }

        saveAsActionScriptCall(savePath);
    }, [saveAsActionScriptCall]);

    const currentScript = props.currentScript;

    const saveCheck = useCallback((event) => {
        if (event.ctrlKey && event.key.toLowerCase() === 's') {
            event.preventDefault();


            if (event.shiftKey || !currentScript["is-saved"]) {
                handleSaveAsFile();
                return;
            }

            handleSaveFile();
        }
    }, [handleSaveAsFile, handleSaveFile, currentScript]);


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
    saveAsActionScriptCall
};

export default connect(mapStateToProps, mapDispatchToProps)(SaveManager);