import "styles/components/actions/actionitem.scss";

import { addActionCall, removeActionCall, setActionsCall, swapActionIndexesCall } from "store/reducers/actionsReducer";
import { connect } from 'react-redux';
import { Reorder, useDragControls } from "framer-motion";
import BasicButton from "components/inputs/BasicButton";

import { useRef, useState } from "react";
import PopupWindow from "components/popup/PopupWindow";
import ActionEditForm from "./edit/ActionEditForm";
import ContextMenu from "components/contextmenu/contextMenu";

const ActionItem = (props) => {
    const action = props.data;
    const dragControls = useDragControls();

    const popupWindow = useRef(null);
    const actionEditForm = useRef(null);
    const contextMenuRef = useRef(null);
    const [contextMenuOpen, setContextMenuOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const canModify = props.currentScript["play-state"] === "stopped";
    const performingActionClass = (canModify) ? "" : (props.performing) ? "performing" : "disabled";

    const [isSelected, setIsSelected] = useState(false);

    const removeAction = () => {
        props.removeActionCall(action.id);
    }

    const openEditWindow = () => {
        setContextMenuOpen(false);
        contextMenuRef.current.setOpen(false);
        popupWindow.current.setVisible(true);
    }

    const closeEditWindow = () => {
        popupWindow.current.setVisible(false);
    }

    const onPopupClose = () => {
        actionEditForm.current.resetActionData();
    }

    const moveUp = () => {
        if (props.moveUp) {
            props.moveUp(action.id);
        }
    }

    const moveDown = () => {
        if (props.moveDown) {
            props.moveDown(action.id);
        }
    }

    const startDragging = (e) => {
        // We can't modify anything when the actions are running
        if (!canModify) {
            return;
        }

        dragControls.start(e);
    }

    const onRightClick = (e) => {
        // If button isn't rigth click
        if (e.button !== 2) {
            return;
        }

        e.preventDefault();
        contextMenuRef.current.setOpen(true);
        contextMenuRef.current.setPosition(e.clientX + 10, e.clientY - 10);
        setContextMenuOpen(true);
    }

    const setSelectionOfThisAction = (select) => {
        if (props.onSelect) {
            props.onSelect();
        }

        setIsSelected(select);
    }

    const contextMenuItems = [
        {
            "name": "edit",
            "text": "Edit",
            "onClick": openEditWindow
        },
        {
            "name": "delete",
            "text": "Delete",
            "onClick": removeAction
        },
        {
            "name": "sep-1",
            "type": "separator",
        },
        {
            "name": "move-up",
            "text": "Move up",
            "onClick": moveUp
        },
        {
            "name": "move-down",
            "text": "Move down",
            "onClick": moveDown
        },
    ]

    return (
        <div className="action-item-wrapper">
            <ContextMenu onClose={() => setContextMenuOpen(false)} ref={contextMenuRef} items={contextMenuItems} />
            <PopupWindow onManualClose={onPopupClose} ref={popupWindow}>
                <ActionEditForm ref={actionEditForm} onCancel={closeEditWindow} actionType={action.type} actionData={action}></ActionEditForm>
            </PopupWindow>
            <Reorder.Item value={action} dragListener={false} dragControls={dragControls} className="action-item-container">
                <div className={"action-item" + ((isHovering) ? " hover" : "") + ((contextMenuOpen === true) ? " context-menu-open" : "") + ((isSelected) ? " selected" : "") + ((props.className) ? ` ${props.className}` : "") + ` ${performingActionClass}`} onMouseUp={onRightClick} >
                    <div className="drag-items">
                        <div onPointerDown={startDragging} className="data drag">
                            <img alt="Drag Icon" draggable="false" className="icon" src="images/icons/drag.png"></img>
                        </div>
                    </div>
                    <div className="other-items" onClick={() => setSelectionOfThisAction(!isSelected)} onMouseLeave={() => setIsHovering(false)} onMouseEnter={() => setIsHovering(true)}>
                        <div className="data">{action["name"]}</div>
                        <div className="data">{action["type-display-name"]}</div>
                        <div className="data">{action["start-delay-ms"]}</div>
                        <div className="data">{action["end-delay-ms"]}</div>
                        <div className="data">{action["loop-count"]}</div>
                    </div>
                    <div className="action-buttons">
                        <div className="data buttons">
                            <BasicButton disabled={!canModify} onClick={openEditWindow} className="button" icon="images/icons/edit.png"></BasicButton>
                            <BasicButton disabled={!canModify} onClick={removeAction} className="button cancel" icon="images/icons/delete.png"></BasicButton>
                        </div>
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