import "styles/components/actions/actionitem.scss";

import { addActionCall, removeActionCall, setActionsCall, swapActionIndexesCall } from "store/reducers/actionsReducer";
import { connect } from 'react-redux';
import { Reorder, useDragControls } from "framer-motion";
import BasicButton from "components/inputs/BasicButton";

import { useRef } from "react";
import PopupWindow from "components/popup/PopupWindow";
import ActionEditForm from "./edit/ActionEditForm";


const ActionItem = (props) => {
    const action = props.data;
    const dragControls = useDragControls();

    const popupWindow = useRef(null);
    const actionEditForm = useRef(null);

    const canModify = props.currentScript["play-state"] === "stopped";
    const performingActionClass = (canModify) ? "" : (props.performing) ? "performing" : "disabled";

    const removeAction = (id) => {
        props.removeActionCall(id);
    }

    const openEditWindow = () => {
        popupWindow.current.setVisible(true);
    }

    const closeEditWindow = () => {
        popupWindow.current.setVisible(false);
    }

    const onPopupClose = () => {
        actionEditForm.current.resetActionData();
    }

    const startDragging = (e) => {
        // We can't modify anything when the actions are running
        if (!canModify) {
            return;
        }

        dragControls.start(e);
    }

    return (
        <div className="action-item-wrapper">
            <PopupWindow onManualClose={onPopupClose} ref={popupWindow}>
                <ActionEditForm ref={actionEditForm} onCancel={closeEditWindow} actionType={action.type} actionData={action}></ActionEditForm>
            </PopupWindow>
            <Reorder.Item value={action} dragListener={false} dragControls={dragControls} className="action-item-container">
                <div className={"action-item" + ((props.className) ? ` ${props.className}` : "") + ` ${performingActionClass}`}>
                    <div onPointerDown={startDragging} className="data drag">
                        <img alt="Drag Icon" draggable="false" className="icon" src="images/icons/drag.png"></img>
                    </div>
                    <div className="data">{action["name"]}</div>
                    <div className="data">{action["type-display-name"]}</div>
                    <div className="data">{action["start-delay-ms"]}</div>
                    <div className="data">{action["end-delay-ms"]}</div>
                    <div className="data">{action["loop-count"]}</div>
                    <div className="data buttons">
                        <BasicButton disabled={!canModify} onClick={openEditWindow} className="button" icon="images/icons/edit.png"></BasicButton>
                        <BasicButton disabled={!canModify} onClick={() => removeAction(action.id)} className="button" icon="images/icons/delete.png"></BasicButton>
                    </div>
                </div>
            </Reorder.Item>

        </div>
    )
}


const mapStateToProps = (state) => {
    return {
        allActions: state.actions.allActions,
        currentScript: state.actionScript.currentScript,
    };
};

const mapDispatchToProps = {
    addActionCall,
    removeActionCall,
    setActionsCall,
    swapActionIndexesCall
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionItem);