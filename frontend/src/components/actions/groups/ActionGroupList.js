import BasicButton from "components/inputs/BasicButton";
import PopupWindow from "components/popup/PopupWindow";
import { useRef, useState } from "react";
import { connect } from "react-redux";
import { addActionGroupCall, removeActionGroupCall, updateActionGroupCall } from "store/reducers/actionScriptReducer";
import "styles/components/actions/groups/actiongrouplist.scss";
import ActionGroupEditForm from "./ActionGroupEditForm";

const ActionGroupList = (props) => {

    const popupWindow = useRef(null);

    const currentScript = props.currentScript;
    const groups = currentScript["action-groups"];

    const currentGroupId = props.currentGroupId;

    const addActionGroupCall = props.addActionGroupCall;
    const updateActionGroupCall = props.updateActionGroupCall;
    const removeActionGroupCall = props.removeActionGroupCall;

    const [hoveringActionsGroupId, setHoveringActionsGroupId] = useState(-1);

    const onChangeGroup = props.onChangeGroup;

    const [selectedActionGroupId, setSelectedActionGroupId] = useState(-1);

    const onClickGroup = (groupId) => {
        if (hoveringActionsGroupId !== -1) {
            return;
        }

        if (!onChangeGroup) {
            return
        }

        onChangeGroup(groupId);
    }

    const showEditForm = () => {
        setSelectedActionGroupId(hoveringActionsGroupId);
        popupWindow.current.setVisible(true);
    }

    const hideEditForm = () => {
        popupWindow.current.setVisible(false);
    }

    return (
        <div className="action-group-list">
            <PopupWindow ref={popupWindow}>
                <ActionGroupEditForm closeWindow={hideEditForm} groupId={selectedActionGroupId} />
            </PopupWindow>
            <div className="header">
                <p>Action groups</p>
            </div>
            <div className="group-list">
                {Object.values(groups).map(group =>
                    <div onClick={() => onClickGroup(group.id)} className={"group" + ((hoveringActionsGroupId === group.id) ? " hovering-actions" : "") + ((group.id === currentGroupId) ? " selected" : "")} key={`group-${group.id}`}>
                        <p className="name">{group.name}</p>
                        <div className="actions" onMouseLeave={() => setHoveringActionsGroupId(-1)} onMouseEnter={() => setHoveringActionsGroupId(group.id)}>
                            <div className="bg"></div>
                            <BasicButton onClick={showEditForm} className="action" icon="images/icons/edit.png"></BasicButton>
                            <BasicButton onClick={() => removeActionGroupCall(group.id)} className={"action cancel" + ((currentGroupId === group.id) ? " hidden" : "")} icon="images/icons/delete.png"></BasicButton>
                        </div>
                    </div>
                )}
            </div>
            <div className="footer">
                <BasicButton onClick={addActionGroupCall} icon={"images/icons/new_group.png"}></BasicButton>
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
    removeActionGroupCall,
    updateActionGroupCall
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionGroupList);