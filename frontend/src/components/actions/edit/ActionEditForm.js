import "styles/components/actions/edit/actioneditform.scss";
import MouseClickActionForm from "./forms/MouseClickActionForm";
import TextInput from "components/inputs/TextInput";
import { forwardRef, useImperativeHandle, useState } from "react";
import BasicButton from "components/inputs/BasicButton";
import { updateActionCall } from "store/reducers/actionsReducer";
import { connect } from 'react-redux';
import GroupBox from "components/boxes/GroupBox";

const ActionEditForm = forwardRef((props, ref) => {

    const [actionData, setActionData] = useState(props.actionData);

    const onDataChanged = (keyword, newValue) => {
        let newActionData = { ...actionData }
        newActionData[keyword] = newValue;
        setActionData(newActionData);
    }

    const onCancel = () => {
        resetActionData();

        if (!props.onCancel) {
            return;
        }

        props.onCancel();
    }

    const resetActionData = () => {
        setActionData(props.actionData);
    }

    const save = () => {
        props.updateActionCall(actionData);
        props.onCancel();
    }

    useImperativeHandle(ref, () => ({
        resetActionData
    }));

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
            <GroupBox title="Default" className="box">
                <TextInput onChange={e => onDataChanged("name", e.target.value)} value={actionData["name"]} placeholder="Action name" />
                <div className="row">
                    <TextInput min="0" type="number" onChange={e => onDataChanged("start-delay-ms", e.target.value)} value={actionData["start-delay-ms"]} placeholder="Start delay (ms)" />
                    <TextInput min="0" type="number" onChange={e => onDataChanged("end-delay-ms", e.target.value)} value={actionData["end-delay-ms"]} placeholder="End delay (ms)" />
                    <TextInput min="0" type="number" onChange={e => onDataChanged("loop-count", e.target.value)} value={actionData["loop-count"]} placeholder="Loop count" />
                </div>
            </GroupBox>
            {component}
            <div className="row">
                <BasicButton onClick={onCancel}>Cancel</BasicButton>
                <BasicButton onClick={save}>Save</BasicButton>
            </div>
        </div>
    )
});

const mapStateToProps = (state) => {
    return {
        allActions: state.actions.allActions,
    };
};

const mapDispatchToProps = {
    updateActionCall
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(ActionEditForm);