import BasicButton from "components/inputs/BasicButton";
import PopupWindow from "components/popup/PopupWindow";
import { useState } from "react";
import { connect } from "react-redux";
import { addActionGroupCall, removeActionGroupCall } from "store/reducers/actionScriptReducer";
import "styles/components/actions/groups/actiongrouplist.scss";
import ActionGroupEditForm from "./ActionGroupEditForm";
import actionScriptAPI from "apis/actionScriptAPI";

const ActionGroupList = (props) => {
    const currentScript = props.currentScript;
    const groups = currentScript["action-groups"];

    const { currentGroupId, addActionGroupCall, removeActionGroupCall, onChangeGroup } = props;

    const [hoveringActionsGroupId, setHoveringActionsGroupId] = useState(-1);
    const [selectedActionGroupId, setSelectedActionGroupId] = useState(-1);
    const [groupEditFormVisible, setGroupEditFormVisible] = useState(false);

    const scriptPlayState = currentScript["play-state"];
    const enabled = scriptPlayState === "stopped";

    const onClickGroup = (groupId) => {
        if (hoveringActionsGroupId !== -1) {
            return;
        }

        if (!enabled) {
            return;
        }

        if (!onChangeGroup) {
            return
        }

        actionScriptAPI.updateSelectedActionGroup(groupId);
        onChangeGroup(groupId);
    }

    const showEditForm = () => {
        setSelectedActionGroupId(hoveringActionsGroupId);
        setGroupEditFormVisible(true);
    }

    const hideEditForm = () => {
        setGroupEditFormVisible(false);
    }

    return (
        <div className="action-group-list">
            <PopupWindow visible={groupEditFormVisible} onVisibilityChanged={setGroupEditFormVisible}>
                <ActionGroupEditForm closeWindow={hideEditForm} groupId={selectedActionGroupId} />
            </PopupWindow>
            <div className="header">
                <p>Action groups</p>
            </div>
            <div className="group-list">
                {Object.values(groups).map(group =>
                    <div onClick={() => onClickGroup(group.id)} className={"group" + ((!enabled) ? " disabled" : "") + ((hoveringActionsGroupId === group.id) ? " hovering-actions" : "") + ((group.id === currentGroupId) ? " selected" : "")} key={`group-${group.id}`}>
                        <p className="name">{group.name}</p>
                        <div className="actions" onMouseLeave={() => setHoveringActionsGroupId(-1)} onMouseEnter={() => setHoveringActionsGroupId(group.id)}>
                            <div className="bg"></div>
                            <BasicButton disabled={!enabled} onClick={showEditForm} className="action" icon="images/icons/edit.png"></BasicButton>
                            <BasicButton theme="warning" disabled={!enabled} onClick={() => removeActionGroupCall(group.id)} className={"action " + ((currentGroupId === group.id) ? " hidden" : "")} icon="images/icons/delete.png"></BasicButton>
                        </div>
                    </div>
                )}
            </div>
            <div className="footer">
                <BasicButton disabled={!enabled} theme="add" onClick={addActionGroupCall} icon={"images/icons/new_group.png"}></BasicButton>
            </div>
        </div>
    )
}


const mapStateToProps = (state) => {
    return {
        currentScript: state.actionScript.currentScript,
    };
};

const mapDispatchToProps = {
    addActionGroupCall,
    removeActionGroupCall
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionGroupList);