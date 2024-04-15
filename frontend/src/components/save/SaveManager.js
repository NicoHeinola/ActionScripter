import { useCallback, useEffect } from "react";

import { connect } from 'react-redux';
import { saveActionScriptCall } from "store/reducers/actionScriptReducer";

const SaveManager = (props) => {

    const saveActionScriptCall = props.saveActionScriptCall;
    const handleSaveFile = useCallback(() => {
        saveActionScriptCall();
    }, [saveActionScriptCall]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                handleSaveFile();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleSaveFile])

    return (
        <></>
    )
};


const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = {
    saveActionScriptCall
};

export default connect(mapStateToProps, mapDispatchToProps)(SaveManager);