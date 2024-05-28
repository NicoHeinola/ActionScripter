import "styles/components/actions/actionitem.scss";

import { createActionCall, removeActionsCall, swapActionIndexesCall } from "store/reducers/actionScriptReducer";
import { connect } from 'react-redux';
import { Reorder, useDragControls } from "framer-motion";
import BasicButton from "components/inputs/BasicButton";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import ContextMenu from "components/contextmenu/contextMenu";
import clipboardUtil from "utils/clipboardUtil";

const ActionItem = forwardRef((props, ref) => {
    const action = props.data;
    const dragControls = useDragControls();

    const contextMenuRef = useRef(null);
    const [contextMenuOpen, setContextMenuOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isHoveringActionsWrapper, setIsHoveringActionsWrapper] = useState(false);
    const [isHoveringActions, setIsHoveringActions] = useState(false);

    const canModify = props.currentScript["play-state"] === "stopped";
    const performingActionClass = (canModify) ? "" : (props.performing) ? "performing" : "disabled";

    const isSelected = props.isSelected === true ? true : false;
    const index = props.index;

    const groupId = props.groupId;
    const actionsInGroup = props.currentScript["action-groups"][`${groupId}`]["actions"];

    const removeAction = () => {
        props.removeActionsCall(groupId, [action.id]);
    }

    const openEditWindow = () => {
        setContextMenuOpen(false);
        props.onOpenEditWindow(action);
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

    const onDragContainerPointerDown = (e) => {
        if (props.onStartDragging) {
            props.onStartDragging(e);
        }

        startDragging(e);
    }

    const onRightClick = (e) => {
        // If button isn't rigth click
        if (e.button !== 2) {
            return;
        }

        e.preventDefault();

        // If we want to modify multiple at the same time
        if (e.shiftKey) {
            return;
        }

        contextMenuRef.current.setOpen(true);
        contextMenuRef.current.setPosition(e.clientX + 10, e.clientY - 10);
        setContextMenuOpen(true);
    }

    const copy = () => {
        contextMenuRef.current.setOpen(false);
        setContextMenuOpen(false);
        clipboardUtil.copyActions([action]);
    }

    const paste = () => {
        if (props.onPaste) {
            props.onPaste();
        }

        contextMenuRef.current.setOpen(false);
        setContextMenuOpen(false);
    }

    const cut = () => {
        copy();
        removeAction();
    }

    const onItemClicked = (e) => {
        if (!canModify) {
            return;
        }

        if (!props.onSelectionClick) {
            return;
        }

        props.onSelectionClick(e, isSelected);
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
            "name": "sep-2",
            "type": "separator",
        },
        {
            "name": "cut",
            "text": "Cut",
            "onClick": cut
        },
        {
            "name": "copy",
            "text": "Copy",
            "onClick": copy
        },
        {
            "name": "paste",
            "text": "Paste",
            "onClick": paste
        },
        {
            "name": "sep-1",
            "type": "separator",
        },
        {
            "name": "move-up",
            "text": "Move up",
            "onClick": moveUp,
            "disabled": index === 0,
        },
        {
            "name": "move-down",
            "text": "Move down",
            "onClick": moveDown,
            "disabled": index === actionsInGroup.length - 1,
        },
    ]

    const onDrag = (e, info) => {
        if (props.onDrag) {
            props.onDrag(e, info);
        }
    }
    const onDragEnd = (e, info) => {
        if (props.onDragEnd) {
            props.onDragEnd(e, info);
        }
    }

    useImperativeHandle(ref, () => ({
        startDragging
    }));

    const onContextMenuOpenChange = (isOpen) => {
        if (props.onContextMenuOpenChange) {
            props.onContextMenuOpenChange(isOpen);
        }
    }

    return (
        <div className="action-item-wrapper">
            <ContextMenu onOpenChange={onContextMenuOpenChange} onClose={() => setContextMenuOpen(false)} ref={contextMenuRef} items={contextMenuItems} />
            <Reorder.Item onDragEnd={onDragEnd} onDrag={onDrag} value={action} dragListener={false} dragControls={dragControls} className="action-item-container">
                <div className={"action-item" + ((isHoveringActionsWrapper) ? " hovering-actions-wrapper" : "") + ((isHoveringActions) ? " hovering-actions" : "") + ((isHovering) ? " hover" : "") + ((contextMenuOpen === true) ? " context-menu-open" : "") + ((isSelected) ? " selected" : "") + ((props.className) ? ` ${props.className}` : "") + ` ${performingActionClass}`} onMouseUp={onRightClick} >
                    <div className="drag-items">
                        <div onPointerDown={onDragContainerPointerDown} className="data drag">
                            <img alt="Drag Icon" draggable="false" className="icon" src="images/icons/drag.png"></img>
                        </div>
                    </div>
                    <div className="other-items" onClick={onItemClicked} onMouseLeave={() => setIsHovering(false)} onMouseEnter={() => setIsHovering(true)}>
                        <div className="data"><p className="text">{action["name"]}</p></div>
                        <div className="data"><p className="text">{action["type-display-name"]}</p></div>
                        <div className="data"><p className="text">{action["start-delay-ms"]}</p></div>
                        <div className="data"><p className="text">{action["end-delay-ms"]}</p></div>
                        <div className="data"><p className="text">{action["loop-count"]}</p></div>
                    </div>
                    <div className="actions-wrapper" onMouseLeave={() => setIsHoveringActionsWrapper(false)} onMouseEnter={() => setIsHoveringActionsWrapper(true)}>
                        <div className="actions" onMouseLeave={() => setIsHoveringActions(false)} onMouseEnter={() => setIsHoveringActions(true)}>
                            <div className="bg"></div>
                            <BasicButton className="action" disabled={!canModify} onClick={openEditWindow} icon="images/icons/edit.png"></BasicButton>
                            <BasicButton className="action" theme="warning" disabled={!canModify} onClick={removeAction} icon="images/icons/delete.png"></BasicButton>
                        </div>
                    </div>
                </div>
            </Reorder.Item>

        </div>
    )
});


const mapStateToProps = (state) => {
    return {
        currentScript: state.actionScript.currentScript,
    };
};

const mapDispatchToProps = {
    createActionCall,
    removeActionsCall,
    swapActionIndexesCall
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(ActionItem);