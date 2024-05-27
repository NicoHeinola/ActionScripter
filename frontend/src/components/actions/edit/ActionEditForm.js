import "styles/components/actions/edit/actioneditform.scss";
import MouseClickActionForm from "./forms/MouseClickActionForm";
import TextInput from "components/inputs/TextInput";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import BasicButton from "components/inputs/BasicButton";
import { updateActionCall } from "store/reducers/actionScriptReducer";
import { connect } from 'react-redux';
import GroupBox from "components/boxes/GroupBox";

const ActionEditForm = forwardRef((props, ref) => {

    const { groupId, actionData, onCancel, updateActionCall, actionType, currentScript } = props;

    const playState = currentScript["play-state"];

    const [actionDataCopy, setActionDataCopy] = useState({ ...actionData });
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        setActionDataCopy({ ...actionData });
    }, [actionData]);

    const onDataChanged = (newDatas) => {
        let newActionData = { ...actionDataCopy };

        for (const keyword in newDatas) {
            const newValue = newDatas[keyword];
            newActionData[keyword] = newValue;
        }

        setActionDataCopy(newActionData);
    }

    const resetActionData = useCallback(() => {
        setActionDataCopy(actionDataCopy);
    }, [setActionDataCopy, actionDataCopy]);

    const cancel = useCallback(() => {
        resetActionData();

        if (!onCancel) {
            return;
        }

        onCancel();
    }, [onCancel, resetActionData]);

    const save = useCallback(() => {
        updateActionCall(groupId, actionDataCopy);
        onCancel();
    }, [onCancel, updateActionCall, actionDataCopy, groupId]);

    const handleKeyDown = useCallback((event) => {
        const enterKeyCode = 13;
        const escKeyCode = 27;

        if (event.keyCode === enterKeyCode) {
            save();
        } else if (event.keyCode === escKeyCode) {
            cancel();
        }
    }, [save, cancel]);

    useEffect(() => {
        if (playState === "stopped" && isActive) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown, actionDataCopy, playState]);

    useImperativeHandle(ref, () => ({
        resetActionData,
        setIsActive
    }));

    let component = null;
    switch (actionType) {
        case "mouse-click":
            component = <MouseClickActionForm actionData={actionDataCopy} dataChanged={onDataChanged} />;
            break;
        default:
            component = <p>Action type "{actionType}" doesn't have a form.</p>;
    }

    return (
        <div className="action-edit-form">
            <GroupBox title="General" className="box">
                <TextInput onChange={newValue => onDataChanged({ "name": newValue })} value={actionDataCopy["name"]} placeholder="Action name" />
                <div className="row">
                    <TextInput min="0" type="number" onChange={newValue => onDataChanged({ "start-delay-ms": newValue })} value={actionDataCopy["start-delay-ms"]} placeholder="Start delay (ms)" />
                    <TextInput min="0" type="number" onChange={newValue => onDataChanged({ "end-delay-ms": newValue })} value={actionDataCopy["end-delay-ms"]} placeholder="End delay (ms)" />
                    <TextInput min="0" type="number" onChange={newValue => onDataChanged({ "loop-count": newValue })} value={actionDataCopy["loop-count"]} placeholder="Loop count" />
                </div>
            </GroupBox>
            {component}
            <div className="row">
                <BasicButton onClick={save}>Save</BasicButton>
                <BasicButton className="cancel" onClick={cancel}>Cancel</BasicButton>
            </div>
        </div>
    )
});

const mapStateToProps = (state) => {
    return {
        currentScript: state.actionScript.currentScript
    };
};

const mapDispatchToProps = {
    updateActionCall
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(ActionEditForm);