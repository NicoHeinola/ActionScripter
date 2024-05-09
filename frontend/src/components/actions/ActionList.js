import "styles/components/actions/actionlist.scss";

import { connect } from 'react-redux';
import { Reorder } from "framer-motion";
import ActionItem from "./ActionItem";
import { addActionsCall, removeActionCall, removeActionsCall, swapActionIndexesCall } from "store/reducers/actionsReducer";
import socket from "socket/socketManager";
import { useCallback, useEffect, useRef, useState } from "react";
import ContextMenu from "components/contextmenu/contextMenu";
import clipboardUtil from "utils/clipboardUtil";
import PopupWindow from "components/popup/PopupWindow";
import ActionEditForm from "./edit/ActionEditForm";
import BasicButton from "components/inputs/BasicButton";
import { ring } from 'ldrs'
import { loadSettingsCall } from "store/reducers/settingsReducer";
import useClickOutside from "hooks/useClickOutside";

ring.register()

const ActionList = (props) => {
    const [currentActionIndex, setCurrentActionIndex] = useState(0);
    const [selectedActionIds, setSelectedActionIds] = useState([]);
    const contextMenuRef = useRef(null);
    const actionGroupRef = useRef(null);
    const actionRefs = useRef({});

    const popupWindow = useRef(null);
    const actionEditForm = useRef(null);
    const [openedAction, setOpenedAction] = useState({});

    const actionsPerPage = Number(props.allSettings["actions-per-page"]);
    const [currentPage, setCurrentPage] = useState(0);
    const pages = Math.ceil(props.allActions.length / actionsPerPage);
    const activeActions = props.allActions.slice(currentPage * actionsPerPage, (currentPage + 1) * actionsPerPage)

    const loadSettingsCall = props.loadSettingsCall;

    const [lastSelectedItemId, setLastSelectedItemId] = useState(-1);

    useEffect(() => {
        loadSettingsCall();
    }, [loadSettingsCall])

    const onPerformedAction = useCallback((actionIndex) => {
        setCurrentActionIndex(actionIndex);

        // What page the index falls into
        const page = Math.floor(actionIndex / actionsPerPage);

        // Change the page if the page is different from the current one
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    }, [currentPage, actionsPerPage])

    const onFinishedActions = useCallback(() => {
        setCurrentActionIndex(0);
    }, []);

    useEffect(() => {
        socket.on("performed-action", onPerformedAction);

        socket.on("finished-actions", onFinishedActions);

        return (() => {
            socket.off("performed-action", onPerformedAction);
            socket.off("finished-actions", onFinishedActions);
        })
    }, [onPerformedAction, onFinishedActions]);

    const onReorder = (reorderedActions) => {
        // Find what items were swapped
        const swappedItems = [];
        for (let i = 0; i < reorderedActions.length; i++) {
            if (reorderedActions[i] !== activeActions[i]) {
                swappedItems.push((currentPage * actionsPerPage) + i);
            }
        }

        if (swappedItems.length < 2) {
            return;
        }

        props.swapActionIndexesCall(swappedItems[0], swappedItems[1]);
    };

    const closeEditWindow = () => {
        popupWindow.current.setVisible(false);
    }

    const onPopupClose = () => {
        actionEditForm.current.resetActionData();
    }

    const openEditWindow = (action) => {
        contextMenuRef.current.setOpen(false);
        popupWindow.current.setVisible(true);
        setOpenedAction({ ...action });
    }

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

    const onActionItemSelectionClick = (e, id, isSelected) => {

        const isPressingCtrl = e.ctrlKey;
        const isPressingShift = e.shiftKey;

        // If user is not pressing anything, we want to override any other selection
        if (!isPressingCtrl && !isPressingShift) {
            setSelectedActionIds([id]);
            setLastSelectedItemId(id);
        }

        // If pressing ctrl, allow selection of multiple things
        if (isPressingCtrl) {
            if (isSelected) {
                unselectActionItem(id);
            } else {
                selectActionItem(id);
                setLastSelectedItemId(id);
            }
        }

        if (isPressingShift) {
            if (lastSelectedItemId === -1 || lastSelectedItemId === id) {
                setSelectedActionIds([id]);
                setLastSelectedItemId(id);
                return;
            }

            // New list of the selected ids
            let newSelectedIds = [];
            if (isPressingCtrl) {
                newSelectedIds = [...selectedActionIds];
            }

            let startedCounting = false;
            for (let action of props.allActions) {
                const isEither = action.id === lastSelectedItemId || action.id === id;
                if (!isEither && !startedCounting) {
                    continue;
                }

                if (!newSelectedIds.includes(action.id)) {
                    newSelectedIds.push(action.id);
                }

                if (isEither && startedCounting) {
                    break;
                }

                startedCounting = true;
            }

            setSelectedActionIds(newSelectedIds);
        }
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
        props.removeActionsCall(selectedActionIds);
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

    const copyAll = () => {
        let actionsToCopy = props.allActions.filter(action => selectedActionIds.includes(action.id));
        clipboardUtil.copyActions(actionsToCopy);
        contextMenuRef.current.setOpen(false);
    }

    const paste = (index = -1) => {
        let copiedActions = clipboardUtil.getCopiedActions();
        if (!copiedActions) {
            return;
        }

        props.addActionsCall(copiedActions, index);
    }

    const cutAll = () => {
        copyAll();
        deleteAllSelectedActions();
        contextMenuRef.current.setOpen(false);
    }

    const onPaste = (index = -1) => {
        paste(index);
        contextMenuRef.current.setOpen(false);
    }

    const contextMenuItems = [
        {
            "name": "delete-selected",
            "text": "Delete selected",
            "onClick": deleteAllSelectedActions,
            "disabled": selectedActionIds.length === 0,
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
            "onClick": unselectAllActions,
            "disabled": selectedActionIds.length === 0,
        },
        {
            "name": "sep-3",
            "type": "separator",
        },
        {
            "name": "cut-selected",
            "text": "Cut selected",
            "onClick": cutAll,
            "disabled": selectedActionIds.length === 0,
        },
        {
            "name": "copy-selected",
            "text": "Copy selected",
            "onClick": copyAll,
            "disabled": selectedActionIds.length === 0,
        },
        {
            "name": "paste",
            "text": "Paste",
            "onClick": onPaste
        },
        {
            "name": "sep-1",
            "type": "separator",
        },
        {
            "name": "move-selected-up",
            "text": "Move selected up",
            "onClick": moveAllSelectedActionsUp,
            "disabled": selectedActionIds.length === 0,
        },
        {
            "name": "move-selected-down",
            "text": "Move selected down",
            "onClick": moveAllSelectedActionsDown,
            "disabled": selectedActionIds.length === 0,
        },
    ]

    useClickOutside(actionGroupRef, unselectAllActions);

    const loadingIconElementMedium = <l-ring class={(!props.isLoadingActions) ? "hidden" : ""} size="40" stroke="5" bg-opacity="0" speed="2" color="white" />;
    const loadingIconElementSmall = <l-ring class={(!props.isLoadingActions) ? "hidden" : ""} size="25" stroke="4" bg-opacity="0" speed="2" color="white" />;
    const isStopped = props.currentScript["play-state"] === "stopped";

    return (
        <div className="action-table">
            <PopupWindow ref={popupWindow} onManualClose={onPopupClose} >
                <ActionEditForm ref={actionEditForm} onCancel={closeEditWindow} actionType={openedAction.type} actionData={openedAction}></ActionEditForm>
            </PopupWindow>
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
                    {activeActions.map((action, index) =>
                        <ActionItem index={(actionsPerPage * currentPage) + index} onOpenEditWindow={openEditWindow} onPaste={() => onPaste((actionsPerPage * currentPage) + index + 1)} ref={(el) => actionRefs.current[action.id] = el} isSelected={selectedActionIds.includes(action.id)} moveDown={() => moveActionDown(action.id)} moveUp={() => moveActionUp(action.id)} onSelectionClick={(e, isSelected) => onActionItemSelectionClick(e, action.id, isSelected)} performing={(actionsPerPage * currentPage + index) === currentActionIndex} data={action} key={`action-item-${action.id}`} />
                    )}
                </Reorder.Group>
                <div className="centered-loading-icon">
                    {loadingIconElementMedium}
                </div>
            </div>
            <div className="pages-container">
                <div className="pages">
                    {Array.from({ length: pages }, (_, index) => (
                        <div className={"page" + ((currentPage === index) ? " active" : "")} key={`page-${index}`}>
                            <BasicButton disabled={!isStopped} className="page-button" onClick={() => setCurrentPage(index)}>P{index + 1}</BasicButton>
                        </div>
                    ))}
                </div>
                <div className="centered-loading-icon">
                    {loadingIconElementSmall}
                </div>
            </div>
        </div >
    )
}


const mapStateToProps = (state) => {
    return {
        allActions: state.actions.allActions,
        isLoadingActions: state.actionScript.isLoadingActions,
        currentScript: state.actionScript.currentScript,
        allSettings: state.settings.allSettings,
    };
};

const mapDispatchToProps = {
    swapActionIndexesCall,
    removeActionCall,
    removeActionsCall,
    addActionsCall,
    loadSettingsCall
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionList);