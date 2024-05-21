import "styles/components/actions/edit/actioneditform.scss";
import MouseClickActionForm from "./forms/MouseClickActionForm";
import TextInput from "components/inputs/TextInput";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import BasicButton from "components/inputs/BasicButton";
import { updateActionCall } from "store/reducers/actionScriptReducer";
import { connect } from 'react-redux';
import GroupBox from "components/boxes/GroupBox";

const ActionEditForm = forwardRef((props, ref) => {

    const [actionData, setActionData] = useState(props.actionData);

    const { groupId } = props;

    useEffect(() => {
        setActionData({ ...props.actionData });
    }, [props.actionData]);

    const onDataChanged = (newDatas) => {
        let newActionData = { ...actionData }

        for (const keyword in newDatas) {
            const newValue = newDatas[keyword];
            newActionData[keyword] = newValue;
        }

        setActionData(newActionData);
    }

    const onCancelProp = props.onCancel;
    const updateActionCall = props.updateActionCall;

    const resetActionData = useCallback(() => {
        setActionData(actionData);
    }, [setActionData, actionData]);

    const onCancel = useCallback(() => {
        resetActionData();

        if (!onCancelProp) {
            return;
        }

        onCancelProp();
    }, [onCancelProp, resetActionData]);

    const save = useCallback(() => {
        updateActionCall(groupId, actionData);
        onCancelProp();
    }, [onCancelProp, updateActionCall, actionData, groupId]);

    useImperativeHandle(ref, () => ({
        resetActionData
    }));

    const handleKeyDown = useCallback((event) => {
        const enterKeyCode = 13;
        const escKeyCode = 27;

        if (event.keyCode === enterKeyCode) {
            save();
        } else if (event.keyCode === escKeyCode) {
            onCancel();
        }
    }, [save, onCancel]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    let component = null;
    switch (props.actionType) {
        case "mouse-click":
            component = <MouseClickActionForm actionData={actionData} dataChanged={onDataChanged} />
            break;
        default:
            component = <p>Action type "{props.actionType}" doesn't have a form.</p>
    }

    return (
        <div className="action-edit-form">
            <GroupBox title="General" className="box">
                <TextInput onChange={newValue => onDataChanged({ "name": newValue })} value={actionData["name"]} placeholder="Action name" />
                <div className="row">
                    <TextInput min="0" type="number" onChange={newValue => onDataChanged({ "start-delay-ms": newValue })} value={actionData["start-delay-ms"]} placeholder="Start delay (ms)" />
                    <TextInput min="0" type="number" onChange={newValue => onDataChanged({ "end-delay-ms": newValue })} value={actionData["end-delay-ms"]} placeholder="End delay (ms)" />
                    <TextInput min="0" type="number" onChange={newValue => onDataChanged({ "loop-count": newValue })} value={actionData["loop-count"]} placeholder="Loop count" />
                </div>
            </GroupBox>
            {component}
            <div className="row">
                <BasicButton onClick={save}>Save</BasicButton>
                <BasicButton className="cancel" onClick={onCancel}>Cancel</BasicButton>
            </div>
        </div>
    )
});

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = {
    updateActionCall
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(ActionEditForm);