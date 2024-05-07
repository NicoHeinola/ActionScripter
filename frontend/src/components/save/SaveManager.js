import { useCallback, useEffect } from "react";

import { connect } from 'react-redux';
import { saveActionScriptCall, saveAsActionScriptCall } from "store/reducers/actionScriptReducer";

const SaveManager = (props) => {

    const saveActionScriptCall = props.saveActionScriptCall;
    const saveAsActionScriptCall = props.saveAsActionScriptCall;

    const handleSaveFile = useCallback(() => {
        saveActionScriptCall();
    }, [saveActionScriptCall]);

    const handleSaveAsFile = useCallback(() => {
        saveAsActionScriptCall();
    }, [saveAsActionScriptCall]);

    const currentScript = props.currentScript;

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Can't save a non-existing script
            if (currentScript["missing-script"] === true) {
                return;
            }

            if (event.ctrlKey && event.key.toLowerCase() === 's') {
                event.preventDefault();


                if (event.shiftKey) {
                    handleSaveAsFile();
                    return;
                }

                handleSaveFile();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleSaveFile, handleSaveAsFile, currentScript])

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