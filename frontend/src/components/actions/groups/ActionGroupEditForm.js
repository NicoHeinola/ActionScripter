import "styles/components/actions/groups/actiongroupeditform.scss";

import { connect } from "react-redux";
import { updateActionGroupCall } from "store/reducers/actionScriptReducer";
import GroupBox from "components/boxes/GroupBox";
import TextInput from "components/inputs/TextInput";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import BasicButton from "components/inputs/BasicButton";

const ActionGroupEditForm = forwardRef((props, ref) => {

    const groupId = props.groupId;
    const currentScript = props.currentScript;

    const originalActionGroupData = currentScript["action-groups"][`${groupId}`];

    const [actionGroupData, setActionGroupData] = useState({ ...originalActionGroupData });

    useEffect(() => {
        setActionGroupData({ ...originalActionGroupData });
    }, [originalActionGroupData])

    useImperativeHandle(ref, () => ({
        resetActionGroupData
    }));

    const updateActionGroupCall = props.updateActionGroupCall;
    const closeWindow = props.closeWindow;

    const save = () => {
        updateActionGroupCall(actionGroupData.id, actionGroupData);

        if (!closeWindow) {
            return;
        }

        closeWindow();
    }

    const resetActionGroupData = () => {
        setActionGroupData({ ...originalActionGroupData });
    }

    const cancel = () => {
        resetActionGroupData();

        if (!closeWindow) {
            return;
        }

        closeWindow();
    }

    const dataChanged = (key, value) => {
        let newActionGroupData = { ...actionGroupData };
        newActionGroupData[key] = value;
        setActionGroupData(newActionGroupData);
    }

    if (!(groupId in currentScript["action-groups"])) {
        return (
            <div className="action-group-edit-form">
                <p>No action group selected.</p>
            </div>
        )
    }

    return (
        <div className="action-group-edit-form">
            <GroupBox title="General">
                <TextInput placeholder="Name" onChange={newValue => dataChanged("name", newValue)} value={actionGroupData["name"]} />
            </GroupBox>
            <div className="row">
                <BasicButton onClick={save}>Save</BasicButton>
                <BasicButton className="cancel" onClick={cancel}>Cancel</BasicButton>
            </div>
        </div>
    )
});


const mapStateToProps = (state) => {
    return {
        currentScript: state.actionScript.currentScript,
    };
};

const mapDispatchToProps = {
    updateActionGroupCall
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(ActionGroupEditForm);