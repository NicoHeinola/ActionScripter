import "styles/components/actions/actionitem.scss";

import { createActionCall, removeActionCall, swapActionIndexesCall } from "store/reducers/actionsReducer";
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

    const canModify = props.currentScript["play-state"] === "stopped";
    const performingActionClass = (canModify) ? "" : (props.performing) ? "performing" : "disabled";

    const isSelected = props.isSelected === true ? true : false;

    const removeAction = () => {
        props.removeActionCall(action.id);
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

    const setSelectionOfThisAction = (select) => {
        if (!canModify) {
            return;
        }

        if (select && props.onSelect) {
            props.onSelect();
        } else if (props.onUnselect) {
            props.onUnselect()
        }
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
            "onClick": moveUp
        },
        {
            "name": "move-down",
            "text": "Move down",
            "onClick": moveDown
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

    return (
        <div className="action-item-wrapper">
            <ContextMenu onClose={() => setContextMenuOpen(false)} ref={contextMenuRef} items={contextMenuItems} />
            <Reorder.Item onDragEnd={onDragEnd} onDrag={onDrag} value={action} dragListener={false} dragControls={dragControls} className="action-item-container">
                <div className={"action-item" + ((isHovering) ? " hover" : "") + ((contextMenuOpen === true) ? " context-menu-open" : "") + ((isSelected) ? " selected" : "") + ((props.className) ? ` ${props.className}` : "") + ` ${performingActionClass}`} onMouseUp={onRightClick} >
                    <div className="drag-items">
                        <div onPointerDown={onDragContainerPointerDown} className="data drag">
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
});


const mapStateToProps = (state) => {
    return {
        allActions: state.actions.allActions,
        currentScript: state.actionScript.currentScript,
    };
};

const mapDispatchToProps = {
    createActionCall,
    removeActionCall,
    swapActionIndexesCall
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(ActionItem);