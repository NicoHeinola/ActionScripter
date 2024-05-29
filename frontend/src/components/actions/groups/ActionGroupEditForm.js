import "styles/components/actions/groups/actiongroupeditform.scss";

import { connect } from "react-redux";
import { updateActionGroupCall } from "store/reducers/actionScriptReducer";
import GroupBox from "components/boxes/GroupBox";
import TextInput from "components/inputs/TextInput";
import { useCallback, useEffect, useState } from "react";
import PopupForm from "components/forms/PopupForm";

const ActionGroupEditForm = (props) => {

    const { data, visible, onVisibilityChange, updateActionGroupCall } = props;
    const [localData, setLocalData] = useState({ ...data });

    useEffect(() => {
        setLocalData({ ...data });
    }, [data])

    const close = useCallback(() => {
        if (!onVisibilityChange) {
            return;
        }

        onVisibilityChange(false);
    }, [onVisibilityChange]);

    const save = useCallback(() => {
        updateActionGroupCall(localData.id, localData);
    }, [localData, updateActionGroupCall]);

    const resetActionGroupData = useCallback(() => {
        setLocalData({ ...data });
    }, [data]);

    const cancel = useCallback(() => {
        resetActionGroupData();
    }, [resetActionGroupData]);

    const dataChanged = useCallback((key, value) => {
        let newData = { ...localData };
        newData[key] = value;
        setLocalData(newData);
    }, [localData, setLocalData]);

    return (
        <PopupForm allowSaving={true} onSave={save} onCancel={cancel} onVisibilityChange={close} visible={visible}>
            <div className="action-group-edit-form">
                <GroupBox title="General">
                    <TextInput placeholder="Name" onChange={newValue => dataChanged("name", newValue)} value={localData["name"]} />
                </GroupBox>
            </div>
        </PopupForm>
    )
};


const mapStateToProps = (state) => {
    return {
    };
};

const mapDispatchToProps = {
    updateActionGroupCall
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionGroupEditForm);