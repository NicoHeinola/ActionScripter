import "styles/components/actions/actionlist.scss";

import { connect } from 'react-redux';
import { Reorder } from "framer-motion";
import ActionItem from "./ActionItem";
import { addActionsCall, removeActionsCall, swapActionIndexesCall } from "store/reducers/actionScriptReducer";
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

    const groupId = props.groupId;
    const actionsInGroup = props.currentScript["action-groups"][`${groupId}`]["actions"];

    const actionsPerPage = Number(props.allSettings["actions-per-page"]);
    const [currentPage, setCurrentPage] = useState(0);
    const pages = Math.ceil(actionsInGroup.length / actionsPerPage);

    const activeActions = actionsInGroup.slice(currentPage * actionsPerPage, (currentPage + 1) * actionsPerPage)

    const loadSettingsCall = props.loadSettingsCall;

    const [lastSelectedItemId, setLastSelectedItemId] = useState(-1);
    const [multiSelectedItemAmount, setMultiSelectedItemAmount] = useState(0);

    const [contextMenuOpenCount, setContextMenuOpenCount] = useState(0);

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

        props.swapActionIndexesCall(groupId, swappedItems[0], swappedItems[1]);
    };

    const closeEditWindow = () => {
        popupWindow.current.setVisible(false);
        actionEditForm.current.setIsActive(false);
    }

    const onPopupClose = () => {
        actionEditForm.current.resetActionData();
        actionEditForm.current.setIsActive(false);
    }

    const openEditWindow = (action) => {
        document.activeElement.blur();
        contextMenuRef.current.setOpen(false);
        popupWindow.current.setVisible(true);
        setOpenedAction({ ...action });
        actionEditForm.current.setIsActive(true);
    }

    const moveActionUp = async (id) => {
        let index = actionsInGroup.findIndex(action => action.id === id);

        // Couldn't find action index
        if (index === null) {
            return null;
        }

        // If action would go out of bounds
        if (index - 1 < 0) {
            return null;
        }

        await props.swapActionIndexesCall(groupId, index, index - 1);

        return index - 1;
    }

    const moveActionDown = async (id) => {
        let index = actionsInGroup.findIndex((action) => action.id === id);

        // Couldn't find action index
        if (index === null) {
            return null;
        }

        // If action would go out of bounds
        if (index + 1 >= actionsInGroup.length) {
            return null;
        }

        await props.swapActionIndexesCall(groupId, index, index + 1);

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
            setMultiSelectedItemAmount(0);
        }

        // If pressing ctrl, allow selection of multiple things
        if (isPressingCtrl) {
            if (isSelected) {
                unselectActionItem(id);
            } else {
                selectActionItem(id);
                setLastSelectedItemId(id);
                setMultiSelectedItemAmount(0);
            }
        }

        if (isPressingShift) {
            if (lastSelectedItemId === -1 || lastSelectedItemId === id) {
                setSelectedActionIds([id]);
                setLastSelectedItemId(id);
                setMultiSelectedItemAmount(0);
                return;
            }

            // New list of the selected ids
            let newSelectedIds = [];
            if (isPressingCtrl) {
                newSelectedIds = [...selectedActionIds];
            }

            let startedCounting = false;
            let multiselectedAmount = 0;
            for (let action of actionsInGroup) {
                const isEither = action.id === lastSelectedItemId || action.id === id;
                if (!isEither && !startedCounting) {
                    continue;
                }

                if (!newSelectedIds.includes(action.id)) {
                    multiselectedAmount++;
                    newSelectedIds.push(action.id);
                }

                if (isEither && startedCounting) {
                    break;
                }

                startedCounting = true;
            }

            setMultiSelectedItemAmount(multiselectedAmount);
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

    const deleteAllSelectedActions = useCallback(() => {
        props.removeActionsCall(groupId, selectedActionIds);
        contextMenuRef.current.setOpen(false);
    }, [props, groupId, selectedActionIds]);

    const moveAllSelectedActionsUp = async () => {
        let selectedIdsSorted = [];

        for (let action of actionsInGroup) {
            let id = action.id;

            if (selectedActionIds.includes(id)) {
                selectedIdsSorted.push(id);
            }
        }

        let topIndex = -1;
        for (let id of selectedIdsSorted) {
            let index = actionsInGroup.findIndex((action) => action.id === id);

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

        for (let action of actionsInGroup) {
            let id = action.id;

            if (selectedActionIds.includes(id)) {
                selectedIdsSorted.push(id);
            }
        }

        selectedIdsSorted.reverse();

        let bottomIndex = -1;
        for (let id of selectedIdsSorted) {
            let index = actionsInGroup.findIndex((action) => action.id === id);

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

    const selectactionsInGroup = useCallback(() => {
        let newSelectedActionIds = actionsInGroup.map(action => action.id);
        setSelectedActionIds(newSelectedActionIds);
        contextMenuRef.current.setOpen(false);
    }, [actionsInGroup]);

    const unselectactionsInGroup = () => {
        setSelectedActionIds([]);
        contextMenuRef.current.setOpen(false);
        setLastSelectedItemId(-1);
    }

    const copyAll = useCallback(() => {
        let actionsToCopy = actionsInGroup.filter(action => selectedActionIds.includes(action.id));
        clipboardUtil.copyActions(actionsToCopy);
        contextMenuRef.current.setOpen(false);
    }, [contextMenuRef, actionsInGroup, selectedActionIds]);

    const paste = useCallback((index = -1) => {
        let copiedActions = clipboardUtil.getCopiedActions();
        if (!copiedActions) {
            return;
        }

        props.addActionsCall(groupId, copiedActions, index);
    }, [props, groupId]);

    const cutAll = useCallback(() => {
        copyAll();
        deleteAllSelectedActions();
        contextMenuRef.current.setOpen(false);
    }, [copyAll, deleteAllSelectedActions]);

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
            "onClick": selectactionsInGroup
        },
        {
            "name": "unselect-all",
            "text": "Unselect all",
            "onClick": unselectactionsInGroup,
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

    const onClickedOutsideOfActions = () => {
        unselectactionsInGroup();
    }

    useClickOutside(actionGroupRef, onClickedOutsideOfActions, () => { return contextMenuOpenCount === 0 });

    const loadingIconElementMedium = <l-ring class={(!props.isLoadingActions) ? "hidden" : ""} size="40" stroke="5" bg-opacity="0" speed="2" color="white" />;
    const loadingIconElementSmall = <l-ring class={(!props.isLoadingActions) ? "hidden" : ""} size="25" stroke="4" bg-opacity="0" speed="2" color="white" />;
    const isStopped = props.currentScript["play-state"] === "stopped";

    const handleAnyContextMenuOpenChange = (isOpen) => {
        const dir = isOpen === true ? 1 : -1;
        const newOpenCount = Math.max(contextMenuOpenCount + 1 * dir, 0)
        setContextMenuOpenCount(newOpenCount);
    }

    const onKeyPress = useCallback((event) => {
        const keyCode = event.keyCode;
        const isCTRLPressed = event.ctrlKey;

        const a = 65;
        const c = 67;
        const v = 86;
        const x = 88;
        const del = 46

        switch (keyCode) {
            case del:
                deleteAllSelectedActions();
                break;
            default:
                break;
        }

        if (!isCTRLPressed) {
            return;
        }

        switch (keyCode) {
            case c:
                copyAll();
                break;
            case v:
                let pasteIndex = -1;
                if (lastSelectedItemId !== -1) {
                    pasteIndex = actionsInGroup.findIndex(action => action.id === lastSelectedItemId);
                    pasteIndex += Math.max(multiSelectedItemAmount - 1, 0);
                    pasteIndex++;
                }

                paste(pasteIndex);
                break;
            case x:
                cutAll();
                break;
            case a:
                selectactionsInGroup();
                break;
            default:
                break;
        }

    }, [copyAll, paste, cutAll, selectactionsInGroup, deleteAllSelectedActions, actionsInGroup, lastSelectedItemId, multiSelectedItemAmount]);

    useEffect(() => {
        document.addEventListener("keydown", onKeyPress);
        return () => {
            document.removeEventListener("keydown", onKeyPress);
        };
    }, [onKeyPress])

    return (
        <div className="action-table">
            <PopupWindow ref={popupWindow} onManualClose={onPopupClose} >
                <ActionEditForm groupId={groupId} ref={actionEditForm} onCancel={closeEditWindow} actionType={openedAction.type} actionData={openedAction}></ActionEditForm>
            </PopupWindow>
            <ContextMenu onOpenChange={handleAnyContextMenuOpenChange} ref={contextMenuRef} items={contextMenuItems} />

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
                <Reorder.Group ref={actionGroupRef} values={actionsInGroup} onReorder={onReorder}>
                    {activeActions.map((action, index) =>
                        <ActionItem groupId={groupId} onContextMenuOpenChange={handleAnyContextMenuOpenChange} index={(actionsPerPage * currentPage) + index} onOpenEditWindow={openEditWindow} onPaste={() => onPaste((actionsPerPage * currentPage) + index + 1)} ref={(el) => actionRefs.current[action.id] = el} isSelected={selectedActionIds.includes(action.id)} moveDown={() => moveActionDown(action.id)} moveUp={() => moveActionUp(action.id)} onSelectionClick={(e, isSelected) => onActionItemSelectionClick(e, action.id, isSelected)} performing={(actionsPerPage * currentPage + index) === currentActionIndex} data={action} key={`action-item-${action.id}`} />
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
        isLoadingActions: state.actionScript.isLoadingActions,
        currentScript: state.actionScript.currentScript,
        allSettings: state.settings.allSettings,
    };
};

const mapDispatchToProps = {
    swapActionIndexesCall,
    removeActionsCall,
    addActionsCall,
    loadSettingsCall
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionList);