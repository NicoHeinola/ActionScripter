import { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import socket from 'socket/socketManager';
import { updateScriptPlayStateCall } from 'store/reducers/actionScriptReducer';


const HotkeyManager = (props) => {

    const updateScriptPlayStateCall = props.updateScriptPlayStateCall;

    const onPlayStateChanged = useCallback((playState) => {
        updateScriptPlayStateCall(playState);
    }, [updateScriptPlayStateCall]);

    useEffect(() => {
        socket.on("changed-play-state", onPlayStateChanged);

        return () => {
            socket.off("changed-play-state", onPlayStateChanged)
        }
    }, [onPlayStateChanged]);

    return (
        <></>
    )
}

const mapStateToProps = (state) => {
    return {
    };
};

const mapDispatchToProps = {
    updateScriptPlayStateCall
};

export default connect(mapStateToProps, mapDispatchToProps)(HotkeyManager);