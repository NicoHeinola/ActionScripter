import "styles/components/actions/edit/actioneditform.scss";
import MouseClickActionForm from "./forms/MouseClickActionForm";
import TextInput from "components/inputs/TextInput";
import { useCallback, useEffect, useState } from "react";
import { updateActionCall } from "store/reducers/actionScriptReducer";
import { connect } from 'react-redux';
import GroupBox from "components/boxes/GroupBox";
import PopupForm from "components/forms/PopupForm";

const ActionEditForm = (props) => {

    const { groupId, actionData, updateActionCall, visible, onVisibilityChange } = props;
    const actionType = actionData.type;

    const [localActionData, setLocalActionData] = useState({ ...actionData });

    useEffect(() => {
        setLocalActionData({ ...actionData });
    }, [actionData]);

    const onDataChanged = useCallback((newDatas) => {
        let newActionData = { ...localActionData };

        for (const keyword in newDatas) {
            const newValue = newDatas[keyword];
            newActionData[keyword] = newValue;
        }

        setLocalActionData(newActionData);
    }, [localActionData, setLocalActionData]);

    const close = useCallback(() => {
        onVisibilityChange(false);
    }, [onVisibilityChange]);

    const resetActionData = useCallback(() => {
        setLocalActionData(actionData);
    }, [setLocalActionData, actionData]);

    const cancel = useCallback(() => {
        resetActionData();
        close();
    }, [resetActionData, close]);

    const save = useCallback(() => {
        updateActionCall(groupId, localActionData);
        close();
    }, [updateActionCall, localActionData, groupId, close]);

    let component = null;
    switch (actionType) {
        case "mouse-click":
            component = <MouseClickActionForm actionData={localActionData} dataChanged={onDataChanged} />;
            break;
        default:
            component = <p>Action type "{actionType}" doesn't have a form.</p>;
    }

    return (
        <PopupForm allowSaving={true} onCancel={cancel} onSave={save} visible={visible} onVisibilityChange={cancel}>
            <div className="action-edit-form">
                <GroupBox title="General" className="box">
                    <TextInput onChange={newValue => onDataChanged({ "name": newValue })} value={localActionData["name"]} placeholder="Action name" />
                    <div className="row">
                        <TextInput min="0" type="number" onChange={newValue => onDataChanged({ "start-delay-ms": newValue })} value={localActionData["start-delay-ms"]} placeholder="Start delay (ms)" />
                        <TextInput min="0" type="number" onChange={newValue => onDataChanged({ "end-delay-ms": newValue })} value={localActionData["end-delay-ms"]} placeholder="End delay (ms)" />
                        <TextInput min="0" type="number" onChange={newValue => onDataChanged({ "loop-count": newValue })} value={localActionData["loop-count"]} placeholder="Loops" />
                    </div>
                </GroupBox>
                {component}
            </div>
        </PopupForm>
    )
};

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = {
    updateActionCall
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionEditForm);