import "styles/components/actions/actionitem.scss";

import { createActionCall, swapActionIndexesCall } from "store/reducers/actionScriptReducer";
import { connect } from 'react-redux';
import { Reorder, useDragControls } from "framer-motion";
import BasicButton from "components/inputs/BasicButton";

import { useCallback, useEffect, useRef, useState } from "react";
import ContextMenu from "components/contextmenu/contextMenu";
import clipboardUtil from "utils/clipboardUtil";

const ActionItem = (props) => {
    const dragControls = useDragControls();

    const { onRemoveAction, currentScriptPlayState, groupActionAmount, data, index, groupId, isSelected, className, onPaste, onContextMenuOpenChange, onMoveUp, onMoveDown, onStartDragging, onSelectionClick, performing, onOpenEditWindow, onDrag, onDragEnd } = props;

    const contextMenuRef = useRef(null);
    const [contextMenuOpen, setContextMenuOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isHoveringActionsWrapper, setIsHoveringActionsWrapper] = useState(false);
    const [isHoveringActions, setIsHoveringActions] = useState(false);
    const [contextMenuItems, setContextMenuItems] = useState([]);

    const canModify = currentScriptPlayState === "stopped";
    const performingActionClass = (canModify) ? "" : (performing) ? "performing" : "disabled";

    const removeAction = useCallback(() => {

        if (!onRemoveAction) {
            return;
        }

        onRemoveAction(groupId, data.id, index);
    }, [onRemoveAction, data.id, groupId, index]);

    const openEditWindow = useCallback(() => {
        setContextMenuOpen(false);
        onOpenEditWindow(data);
    }, [onOpenEditWindow, data]);

    const moveUp = useCallback(() => {
        if (onMoveUp) {
            onMoveUp(index);
        }
    }, [onMoveUp, index]);

    const moveDown = useCallback(() => {
        if (onMoveDown) {
            onMoveDown(index);
        }
    }, [onMoveDown, index]);

    const startDragging = useCallback((e) => {
        // We can't modify anything when the actions are running
        if (!canModify) {
            return;
        }

        dragControls.start(e);
    }, [dragControls, canModify]);

    const onDragContainerPointerDown = useCallback((e) => {
        if (onStartDragging) {
            onStartDragging(e);
        }

        startDragging(e);
    }, [onStartDragging, startDragging]);

    const onRightClick = useCallback((e) => {
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
    }, []);

    const copy = useCallback(() => {
        contextMenuRef.current.setOpen(false);
        setContextMenuOpen(false);
        clipboardUtil.copyActions([data]);
    }, [data]);

    const paste = useCallback(() => {
        if (onPaste) {
            onPaste(index + 1);
        }

        contextMenuRef.current.setOpen(false);
        setContextMenuOpen(false);
    }, [onPaste, index]);

    const cut = useCallback(() => {
        copy();
        removeAction();
    }, [copy, removeAction]);

    const onItemClicked = useCallback((e) => {
        if (!canModify) {
            return;
        }

        if (!onSelectionClick) {
            return;
        }

        onSelectionClick(e, data.id, index, isSelected);
    }, [canModify, onSelectionClick, index, isSelected, data.id]);

    const onDragEvent = useCallback((e, info) => {
        if (onDrag) {
            onDrag(e, info);
        }
    }, [onDrag]);

    const onDragEndEvent = useCallback((e, info) => {
        if (onDragEnd) {
            onDragEnd(e, info);
        }
    }, [onDragEnd]);

    const contextMenuOpenChange = useCallback((isOpen) => {
        if (onContextMenuOpenChange) {
            onContextMenuOpenChange(isOpen);
        }
    }, [onContextMenuOpenChange]);

    const isLastIndex = (index === groupActionAmount - 1);
    const isFirstIndex = (index === 0);

    // Update contextmenu items
    useEffect(() => {
        setContextMenuItems([
            { name: "edit", text: "Edit", onClick: openEditWindow },
            { name: "delete", text: "Delete", onClick: removeAction },
            { name: "sep-2", type: "separator" },
            { name: "cut", text: "Cut", onClick: cut },
            { name: "copy", text: "Copy", onClick: copy },
            { name: "paste", text: "Paste", onClick: paste, disabled: clipboardUtil.getCopiedActions().length === 0 },
            { name: "sep-1", type: "separator" },
            { name: "move-up", text: "Move up", onClick: moveUp, disabled: isFirstIndex },
            { name: "move-down", text: "Move down", onClick: moveDown, disabled: isLastIndex },
        ]);
    }, [isLastIndex, isFirstIndex, openEditWindow, removeAction, cut, copy, paste, moveUp, moveDown]);

    return (
        <div className="action-item-wrapper">
            <ContextMenu onOpenChange={contextMenuOpenChange} onClose={setContextMenuOpen} ref={contextMenuRef} items={contextMenuItems} />
            <Reorder.Item onDragEnd={onDragEndEvent} onDrag={onDragEvent} value={data} dragListener={false} dragControls={dragControls} className="action-item-container">
                <div className={"action-item" + ((isHoveringActionsWrapper) ? " hovering-actions-wrapper" : "") + ((isHoveringActions) ? " hovering-actions" : "") + ((isHovering) ? " hover" : "") + ((contextMenuOpen === true) ? " context-menu-open" : "") + ((isSelected) ? " selected" : "") + ((className) ? ` ${className}` : "") + ` ${performingActionClass}`} onMouseUp={onRightClick} >
                    <div className="drag-items">
                        <div onPointerDown={onDragContainerPointerDown} className="data drag">
                            <img alt="Drag Icon" draggable="false" className="icon" src="images/icons/drag.png"></img>
                        </div>
                    </div>
                    <div className="other-items" onClick={onItemClicked} onMouseLeave={() => setIsHovering(false)} onMouseEnter={() => setIsHovering(true)}>
                        <div className="data"><p className="text">{data["name"]}</p></div>
                        <div className="data"><p className="text">{data["type-display-name"]}</p></div>
                        <div className="data"><p className="text">{data["start-delay-ms"]}</p></div>
                        <div className="data"><p className="text">{data["end-delay-ms"]}</p></div>
                        <div className="data"><p className="text">{data["loop-count"]}</p></div>
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
};


const mapStateToProps = (state) => {
    return {
        currentScriptPlayState: state.actionScript.currentScript["play-state"],
    };
};

const mapDispatchToProps = {
    createActionCall,
    swapActionIndexesCall
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionItem);