import "styles/components/actions/actionlist.scss";

import { connect } from 'react-redux';
import { Reorder } from "framer-motion";
import ActionItem from "./ActionItem";
import { addActionCall, removeActionCall, setActionsCall, swapActionIndexesCall } from "store/reducers/actionsReducer";
import socket from "socket/socketManager";
import { useEffect, useRef, useState } from "react";
import ContextMenu from "components/contextmenu/contextMenu";
import clipboardUtil from "utils/clipboardUtil";

const ActionList = (props) => {
    const [currentActionIndex, setCurrentActionIndex] = useState(0);
    const [selectedActionIds, setSelectedActionIds] = useState([]);
    const contextMenuRef = useRef(null);
    const actionGroupRef = useRef(null);
    const actionRefs = useRef({});

    useEffect(() => {
        socket.on("performed-action", (actionIndex) => {
            setCurrentActionIndex(actionIndex);
        });

        socket.on("finished-actions", () => {
            setCurrentActionIndex(0);
        });

        return (() => {
            socket.off("performed-action");
            socket.off("finished-actions");
        })
    }, []);

    const onReorder = (reorderedActions) => {
        // Find what items were swapped
        const swappedItems = [];
        for (let i = 0; i < reorderedActions.length; i++) {
            if (reorderedActions[i] !== props.allActions[i]) {
                swappedItems.push(i);
            }
        }

        if (swappedItems.length < 2) {
            return;
        }

        props.swapActionIndexesCall(swappedItems[0], swappedItems[1]);
    };

    const moveActionUp = async (id) => {
        let index = props.allActions.findIndex(action => action.id === id);

        // Couldn't find action index
        if (index === null) {
            return null;
        }

        // If action would go out of bounds
        if (index - 1 < 0) {
            return null;
        }

        await props.swapActionIndexesCall(index, index - 1);

        return index - 1;
    }

    const moveActionDown = async (id) => {
        let index = props.allActions.findIndex((action) => action.id === id);

        // Couldn't find action index
        if (index === null) {
            return null;
        }

        // If action would go out of bounds
        if (index + 1 >= props.allActions.length) {
            return null;
        }

        await props.swapActionIndexesCall(index, index + 1);

        return index + 1;
    }

    const selectActionItem = (id) => {
        const newSelectedActionIds = [...selectedActionIds];
        newSelectedActionIds.push(id);
        setSelectedActionIds(newSelectedActionIds);
    }

    const unselectActionItem = (id) => {
        const newSelectedActionIds = selectedActionIds.filter(idInArray => idInArray !== id);
        setSelectedActionIds(newSelectedActionIds);
    }

    const onRightClick = (e) => {
        // If button isn't rigth click
        if (e.button !== 2) {
            return;
        }

        e.preventDefault();

        // We need to press shift to modify multiple actions at once
        if (!e.shiftKey) {
            return;
        }

        contextMenuRef.current.setOpen(true);
        contextMenuRef.current.setPosition(e.clientX + 10, e.clientY - 10);
    }

    const deleteAllSelectedActions = () => {
        for (let id of selectedActionIds) {
            props.removeActionCall(id);
        }

        contextMenuRef.current.setOpen(false);
    }

    const moveAllSelectedActionsUp = async () => {
        let selectedIdsSorted = [];

        for (let action of props.allActions) {
            let id = action.id;

            if (selectedActionIds.includes(id)) {
                selectedIdsSorted.push(id);
            }
        }

        let topIndex = -1;
        for (let id of selectedIdsSorted) {
            let index = props.allActions.findIndex((action) => action.id === id);

            // If the next index would overlap with the limit, let's skip this one
            if (index - 1 === topIndex) {
                topIndex = index;
                continue;
            }

            let newIndex = await moveActionUp(id);

            // We didn't move so we found the limit
            if (newIndex === null) {
                topIndex = index;
            }
        }
    }

    const moveAllSelectedActionsDown = async () => {
        let selectedIdsSorted = [];

        for (let action of props.allActions) {
            let id = action.id;

            if (selectedActionIds.includes(id)) {
                selectedIdsSorted.push(id);
            }
        }

        selectedIdsSorted.reverse();

        let bottomIndex = -1;
        for (let id of selectedIdsSorted) {
            let index = props.allActions.findIndex((action) => action.id === id);

            // If the next index would overlap with the limit, let's skip this one
            if (index + 1 === bottomIndex) {
                bottomIndex = index;
                continue;
            }

            let newIndex = await moveActionDown(id);

            // We didn't move so we found the limit
            if (newIndex === null) {
                bottomIndex = index;
            }
        }
    }

    const selectAllActions = () => {
        let newSelectedActionIds = props.allActions.map(action => action.id);
        setSelectedActionIds(newSelectedActionIds);
        contextMenuRef.current.setOpen(false);
    }

    const unselectAllActions = () => {
        setSelectedActionIds([]);
        contextMenuRef.current.setOpen(false);
    }

    const contextMenuItems = [
        {
            "name": "delete-all",
            "text": "Delete all",
            "onClick": deleteAllSelectedActions
        },
        {
            "name": "sep-2",
            "type": "separator",
        },
        {
            "name": "select-all",
            "text": "Select all",
            "onClick": selectAllActions
        },
        {
            "name": "unselect-all",
            "text": "Unselect all",
            "onClick": unselectAllActions
        },
        {
            "name": "sep-1",
            "type": "separator",
        },
        {
            "name": "move-up",
            "text": "Move all up",
            "onClick": moveAllSelectedActionsUp
        },
        {
            "name": "move-down",
            "text": "Move all down",
            "onClick": moveAllSelectedActionsDown
        },
    ]

    const onPaste = (index = -1) => {
        let copiedActions = clipboardUtil.getCopiedActions();
        if (!copiedActions) {
            return;
        }

        for (let action of copiedActions) {
            props.addActionCall(action, index);
        }
    }

    return (
        <div className="action-table">
            <ContextMenu ref={contextMenuRef} items={contextMenuItems} />
            <div className="headers row">
                <div className="header"></div>
                <div className="header">Name</div>
                <div className="header">Type</div>
                <div className="header">Start delay (ms)</div>
                <div className="header">End delay (ms)</div>
                <div className="header">Loop count</div>
                <div className="header center">Actions</div>
            </div>
            <div className="actions" onMouseUp={onRightClick}>
                <Reorder.Group ref={actionGroupRef} values={props.allActions} onReorder={onReorder}>
                    {props.allActions.map((action, index) =>
                        <ActionItem onPaste={() => onPaste(index + 1)} ref={(el) => actionRefs.current[action.id] = el} isSelected={selectedActionIds.includes(action.id)} moveDown={() => moveActionDown(action.id)} moveUp={() => moveActionUp(action.id)} onUnselect={() => unselectActionItem(action.id)} onSelect={() => selectActionItem(action.id)} performing={index === currentActionIndex} data={action} key={`action-item-${action.id}`} />
                    )}
                </Reorder.Group>
            </div>
        </div>
    )
}


const mapStateToProps = (state) => {
    return {
        allActions: state.actions.allActions,
    };
};

const mapDispatchToProps = {
    swapActionIndexesCall,
    removeActionCall,
    setActionsCall,
    addActionCall
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionList);