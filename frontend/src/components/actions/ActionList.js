import "styles/components/actions/actionlist.scss";

import { connect } from 'react-redux';
import { Reorder } from "framer-motion";
import { addActionsCall, removeActionsCall, swapActionIndexesCall } from "store/reducers/actionScriptReducer";
import { loadSettingsCall } from "store/reducers/settingsReducer";
import { useCallback, useEffect, useRef, useState } from "react";
import ActionItem from "./ActionItem";
import socket from "socket/socketManager";
import ContextMenu from "components/contextmenu/contextMenu";
import clipboardUtil from "utils/clipboardUtil";
import ActionEditForm from "./edit/ActionEditForm";
import BasicButton from "components/inputs/BasicButton";
import useClickOutside from "hooks/useClickOutside";
import HistoryManager from "components/save/HistoryManager";


const ActionList = (props) => {
    // Props and basic variables
    const { allSettings, groupId, currentScript, loadSettingsCall, swapActionIndexesCall, removeActionsCall, addActionsCall, isLoadingActions } = props;
    const actionsInGroup = currentScript["action-groups"][`${groupId}`]["actions"];

    // States
    const [currentActionIndex, setCurrentActionIndex] = useState(0);
    const [openedAction, setOpenedAction] = useState({});
    const [currentPage, setCurrentPage] = useState(0);

    const [selectedActionIds, setSelectedActionIds] = useState({});
    const [fromSelectedActionId, setFromSelectedActionId] = useState(-1);
    const [toSelectedActionId, setToSelectedActionId] = useState(-1);
    const [toggleSelectedActionIds, setToggleSelectedActionIds] = useState({});
    const [removedActionIds, setRemovedActionIds] = useState({});
    const [changesToSelected, setChangesToSelected] = useState(false);

    const [contextMenuOpenCount, setContextMenuOpenCount] = useState(0);
    const [actionEditFormVisisble, setActionEditFormVisisble] = useState(false);
    const [isTopElementSelected, setIsTopElementSelected] = useState(false);
    const [contextMenuItems, setContextMenuItems] = useState([]);

    // Use refs
    const contextMenuRef = useRef(null);
    const actionGroupRef1 = useRef(null);
    const actionGroupRef2 = useRef(null);
    const topElement = useRef(null);

    // Pages
    const actionsPerPage = Number(allSettings["actions-per-page"]);
    const pages = Math.ceil(actionsInGroup.length / actionsPerPage);
    const activeActions = actionsInGroup.slice(currentPage * actionsPerPage, (currentPage + 1) * actionsPerPage)
    const pageIndexPosition = actionsPerPage * currentPage;
    const firstActionOnPage = activeActions[0];
    const lastActionOnPage = activeActions[activeActions.length - 1];

    // Actions
    const selectedActionIdsCount = Object.keys(selectedActionIds).length;

    // Let's load settings when opening this page
    useEffect(() => {
        loadSettingsCall();
    }, [loadSettingsCall]);

    const resetSelectedActionIds = useCallback(() => {
        setSelectedActionIds({});
        setToSelectedActionId(-1);
        setFromSelectedActionId(-1);
        setToggleSelectedActionIds({});
        setRemovedActionIds({});
        setChangesToSelected(false);
    }, []);

    // Update selected action ids based on various action changes
    useEffect(() => {
        // Check for changes
        if (!changesToSelected) {
            return;
        }

        const toToggleKeys = Object.keys(toggleSelectedActionIds);
        if (toToggleKeys.length > 0 && fromSelectedActionId === -1 && toSelectedActionId === -1) {
            setFromSelectedActionId(Number(toToggleKeys[0]));
            setToSelectedActionId(Number(toToggleKeys[0]));
            setToggleSelectedActionIds({});
            return;
        }

        // Make sure we have a valid range selected
        if ((fromSelectedActionId !== -1 || toSelectedActionId !== -1) && (fromSelectedActionId === -1 || toSelectedActionId === -1)) {
            if (fromSelectedActionId !== -1) {
                setToSelectedActionId(fromSelectedActionId);
            } else {
                setFromSelectedActionId(toSelectedActionId);
            }

            return;
        }

        let start = Math.min(fromSelectedActionId, toSelectedActionId);
        let end = Math.max(fromSelectedActionId, toSelectedActionId);

        // If we have removed actions
        if (Object.keys(removedActionIds).length > 0) {
            let removedSelected = false;
            for (const removedId in removedActionIds) {
                if (removedId in selectedActionIds) {
                    removedSelected = true;
                    break;
                }
            }

            if (removedSelected) {

                let setFromFunc = (fromSelectedActionId > toSelectedActionId) ? setToSelectedActionId : setFromSelectedActionId;
                let setToFunc = (toSelectedActionId > fromSelectedActionId) ? setToSelectedActionId : setFromSelectedActionId;

                const ascListOfSelectedActionIds = Object.keys(selectedActionIds);

                // If we have removed all of the selected action ids
                if (ascListOfSelectedActionIds.length <= Object.keys(removedActionIds).length) {
                    resetSelectedActionIds();
                    return;
                }

                ascListOfSelectedActionIds.sort((a, b) => selectedActionIds[a] > selectedActionIds[b]);

                if (start in removedActionIds) {
                    const newIndex = Math.min(1, ascListOfSelectedActionIds.length - 1);
                    setFromFunc(ascListOfSelectedActionIds[newIndex]);
                }

                if (end in removedActionIds) {
                    const newIndex = Math.max(0, ascListOfSelectedActionIds.length - 2);
                    setToFunc(ascListOfSelectedActionIds[newIndex]);
                }

                setRemovedActionIds({});
                return;
            }
        }

        const newSelectedActionIds = {};
        const toToggle = { ...toggleSelectedActionIds };

        // Try to find any a range of selected actions from start to end
        if (start !== -1 || end !== -1) {
            let foundStart = false;

            // Add all ids to the new selected list
            for (let i = pageIndexPosition; i < pageIndexPosition + actionsPerPage; i++) {
                const action = actionsInGroup[i];
                const id = action.id;

                if ((id !== start && id !== end && !foundStart)) {
                    continue;
                }

                // Don't add the action if it should be toggled off
                if (id in toToggle) {
                    delete toToggle[`${id}`];
                } else {
                    newSelectedActionIds[`${id}`] = i;
                }

                // If we are at the end of the index range
                if ((id === end || id === start) && foundStart) {
                    break;
                }

                // If there is only 1 index to select from
                if (end === -1 || start === -1 || end === start) {
                    break;
                }

                foundStart = true;

            }
        }

        // Add all the actions that should be toggled on
        for (const id in toToggle) {
            newSelectedActionIds[`${id}`] = toToggle[`${id}`];
        }

        setSelectedActionIds(newSelectedActionIds);
        setChangesToSelected(false);
    }, [actionsPerPage, pageIndexPosition, fromSelectedActionId, toSelectedActionId, actionsInGroup, toggleSelectedActionIds, changesToSelected, removedActionIds, selectedActionIds, resetSelectedActionIds]);

    // If we change the group, we want to deselect every action
    useEffect(() => {
        resetSelectedActionIds();
    }, [resetSelectedActionIds, groupId]);


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
    }, [setCurrentActionIndex]);

    useEffect(() => {
        socket.on("performed-action", onPerformedAction);

        socket.on("finished-actions", onFinishedActions);

        return (() => {
            socket.off("performed-action", onPerformedAction);
            socket.off("finished-actions", onFinishedActions);
        })
    }, [onPerformedAction, onFinishedActions]);

    const closeEditWindow = useCallback(() => {
        setActionEditFormVisisble(false);
    }, []);

    const openEditWindow = useCallback((action) => {
        document.activeElement.blur();
        contextMenuRef.current.setOpen(false);
        setActionEditFormVisisble(true);
        setOpenedAction({ ...action });
    }, []);

    const moveActionUp = useCallback(async (index) => {
        // Couldn't find action index
        if (index === null || index === undefined) {
            return null;
        }

        await swapActionIndexesCall(groupId, index, index - 1);

        return index - 1;
    }, [swapActionIndexesCall, groupId]);

    const moveActionUpWithId = useCallback((id) => {
        let index = actionsInGroup.findIndex(action => action.id === id);
        moveActionUp(index);
    }, [moveActionUp, actionsInGroup]);

    const findActionIndex = useCallback((id) => {
        let index = actionsInGroup.findIndex((action) => action.id === id);
        return index;
    }, [actionsInGroup]);

    const moveActionDown = useCallback(async (index) => {
        // Couldn't find action index
        if (index === null || index === undefined) {
            return null;
        }

        const newIndex = index + 1;

        await swapActionIndexesCall(groupId, index, newIndex);

        return newIndex;
    }, [swapActionIndexesCall, groupId]);

    const moveActionDownWithId = useCallback(async (id) => {
        let index = findActionIndex(id);
        moveActionDown(index);
    }, [moveActionDown, findActionIndex])

    const onActionItemSelectionClick = useCallback((e, id, index, isSelected) => {

        const isPressingCtrl = e.ctrlKey;
        const isPressingShift = e.shiftKey;

        // Select a single actions and unselect everything else
        if ((!isPressingCtrl && !isPressingShift)) {
            resetSelectedActionIds();
            setFromSelectedActionId(id);
            setToSelectedActionId(id);
            setChangesToSelected(true);
            return;
        }

        // If pressing ctrl, select/unselect an action without affecting other selected actions
        if (isPressingCtrl) {
            setToggleSelectedActionIds(previous => {
                let newData = { ...previous };
                if (id in newData) {
                    delete newData[`${id}`];
                } else {
                    newData[`${id}`] = index;
                }

                return newData;
            });
            setChangesToSelected(true);
            return;
        }

        // If pressing shift, select an area
        if (isPressingShift) {
            setToSelectedActionId(id);
            setToggleSelectedActionIds({});
            setChangesToSelected(true);
            return;
        }

    }, [resetSelectedActionIds]);

    const onRightClick = useCallback((e) => {
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
    }, []);

    const removeActions = useCallback((groupId, actionIdsToRemove) => {
        // Inform the component what actions were removed
        setRemovedActionIds(prev => {
            for (const id of actionIdsToRemove) {
                prev[`${id}`] = -1;
            }
            return prev;
        });
        setChangesToSelected(true);

        removeActionsCall(groupId, actionIdsToRemove);
    }, [removeActionsCall]);

    const removeAction = useCallback((groupId, id, index) => {
        removeActions(groupId, [id]);
    }, [removeActions]);

    const deleteAllSelectedActions = useCallback(() => {
        removeActions(groupId, Object.keys(selectedActionIds).map(key => Number(key)));
        contextMenuRef.current.setOpen(false);
    }, [groupId, selectedActionIds, removeActions]);

    const moveAllSelectedActionsUp = useCallback(async () => {
        let selectedIdsSorted = [];

        for (let action of actionsInGroup) {
            let id = action.id;

            if (id in selectedActionIds) {
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

            let newIndex = await moveActionUpWithId(id);

            // We didn't move so we found the limit
            if (newIndex === null) {
                topIndex = index;
            }
        }
    }, [actionsInGroup, moveActionUpWithId, selectedActionIds]);

    const moveAllSelectedActionsDown = useCallback(async () => {
        let selectedIdsSorted = [];

        for (let action of actionsInGroup) {
            let id = action.id;

            if (id in selectedActionIds) {
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

            let newIndex = await moveActionDownWithId(id);

            // We didn't move so we found the limit
            if (newIndex === null) {
                bottomIndex = index;
            }
        }
    }, [actionsInGroup, moveActionDownWithId, selectedActionIds]);

    const selectActionsInGroup = useCallback(() => {
        if (!firstActionOnPage || !lastActionOnPage) {
            return;
        }

        resetSelectedActionIds();
        setFromSelectedActionId(firstActionOnPage.id);
        setToSelectedActionId(lastActionOnPage.id);
        setChangesToSelected(true);
        contextMenuRef.current.setOpen(false);
    }, [firstActionOnPage, lastActionOnPage, resetSelectedActionIds]);

    const unSelectActionsInGroup = useCallback(() => {
        resetSelectedActionIds();

        contextMenuRef.current.setOpen(false);
    }, [resetSelectedActionIds]);

    const copyAll = useCallback(() => {
        let actionsToCopy = actionsInGroup.filter(action => action.id in selectedActionIds);
        clipboardUtil.copyActions(actionsToCopy);
        contextMenuRef.current.setOpen(false);
    }, [actionsInGroup, selectedActionIds]);

    const paste = useCallback((index = -1) => {
        let copiedActions = clipboardUtil.getCopiedActions();
        if (!copiedActions) {
            return;
        }

        addActionsCall(groupId, copiedActions, index);
    }, [groupId, addActionsCall]);

    const cutAll = useCallback(() => {
        copyAll();
        deleteAllSelectedActions();
        contextMenuRef.current.setOpen(false);
    }, [copyAll, deleteAllSelectedActions]);

    const onPaste = useCallback((index = -1) => {
        paste(index);
        contextMenuRef.current.setOpen(false);
    }, [paste, contextMenuRef]);


    useEffect(() => {
        const zeroCount = selectedActionIdsCount === 0 || actionsInGroup.length === 0;
        const newContextMenuItems = [
            { name: "delete-selected", text: "Delete selected", onClick: deleteAllSelectedActions, disabled: zeroCount },
            { name: "sep-2", type: "separator" },
            { name: "select-all", text: "Select all", onClick: selectActionsInGroup, disabled: actionsInGroup.length === 0 },
            { name: "unselect-all", text: "Unselect all", onClick: unSelectActionsInGroup, disabled: zeroCount },
            { name: "sep-3", type: "separator" },
            { name: "cut-selected", text: "Cut selected", onClick: cutAll, disabled: zeroCount },
            { name: "copy-selected", text: "Copy selected", onClick: copyAll, disabled: zeroCount },
            { name: "paste", text: "Paste", onClick: onPaste, disabled: clipboardUtil.getCopiedActions().length === 0 },
            { name: "sep-1", type: "separator" },
            { name: "move-selected-up", text: "Move selected up", onClick: moveAllSelectedActionsUp, disabled: zeroCount || actionsInGroup[0].id in selectedActionIds },
            { name: "move-selected-down", text: "Move selected down", onClick: moveAllSelectedActionsDown, disabled: zeroCount || actionsInGroup[actionsInGroup.length - 1].id in selectedActionIds }
        ];
        setContextMenuItems(newContextMenuItems);
    }, [actionsInGroup, copyAll, cutAll, deleteAllSelectedActions, moveAllSelectedActionsDown, moveAllSelectedActionsUp, onPaste, selectActionsInGroup, selectedActionIds, selectedActionIdsCount, unSelectActionsInGroup]);

    const loadingIconElementMedium = <l-ring class={(!isLoadingActions) ? "hidden" : ""} size="40" stroke="5" bg-opacity="0" speed="2" color="white" />;
    const loadingIconElementSmall = <l-ring class={(!isLoadingActions) ? "hidden" : ""} size="25" stroke="4" bg-opacity="0" speed="2" color="white" />;
    const isStopped = currentScript["play-state"] === "stopped";

    const handleAnyContextMenuOpenChange = useCallback((isOpen) => {
        const dir = isOpen === true ? 1 : -1;
        const newOpenCount = Math.max(contextMenuOpenCount + 1 * dir, 0);
        setContextMenuOpenCount(newOpenCount);
    }, [contextMenuOpenCount, setContextMenuOpenCount]);

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
                const startIndex = findActionIndex(fromSelectedActionId);
                const endIndex = findActionIndex(toSelectedActionId);
                let pasteIndex = Math.max(startIndex, endIndex);

                if (pasteIndex > -1) {
                    pasteIndex++;
                }

                paste(pasteIndex);
                break;
            case x:
                cutAll();
                break;
            case a:
                selectActionsInGroup();
                break;
            default:
                break;
        }

    }, [copyAll, paste, cutAll, selectActionsInGroup, deleteAllSelectedActions, fromSelectedActionId, toSelectedActionId, findActionIndex]);

    // Such as undo, redo, copy, paste, etc. (Doesn't include starting, stopping and pausing script)
    const areHotkeysEnabled = currentScript["play-state"] === "stopped" && !actionEditFormVisisble && isTopElementSelected;

    useEffect(() => {
        if (!areHotkeysEnabled) {
            return
        }

        document.addEventListener("keydown", onKeyPress);

        return () => {
            document.removeEventListener("keydown", onKeyPress);
        };
    }, [onKeyPress, actionEditFormVisisble, currentScript, areHotkeysEnabled])

    // Outside click handlers
    useClickOutside([
        { "refs": [actionGroupRef1, actionGroupRef2], "handler": unSelectActionsInGroup, "preCheck": () => { return contextMenuOpenCount === 0 && !actionEditFormVisisble } },
        { "refs": [topElement], "handler": () => setIsTopElementSelected(false) },
    ]);

    const onReorder = useCallback((reorderedActions) => {
        // Find what items were swapped
        const swappedItemIndexes = [];
        for (let i = 0; i < reorderedActions.length; i++) {
            // User can only change 2 actions at a time so if 1 was found, it was moved down
            if (swappedItemIndexes.length >= 1) {
                break;
            }

            if (reorderedActions[i] !== activeActions[i]) {
                swappedItemIndexes.push((currentPage * actionsPerPage) + i);
            }
        }

        moveActionDown(swappedItemIndexes[0]);
    }, [actionsPerPage, activeActions, currentPage, moveActionDown]);

    return (
        <div ref={topElement} className={"action-table" + ((isTopElementSelected && areHotkeysEnabled) ? " selected" : "")} onMouseDown={() => setIsTopElementSelected(true)}>
            <ActionEditForm onVisibilityChange={closeEditWindow} visible={actionEditFormVisisble} groupId={groupId} actionData={openedAction}></ActionEditForm>
            <ContextMenu onOpenChange={handleAnyContextMenuOpenChange} ref={contextMenuRef} items={contextMenuItems} />
            <HistoryManager isActive={areHotkeysEnabled} groupId={groupId} />

            <div className="headers row">
                <div className="header"></div>
                <div className="header">Name</div>
                <div className="header">Type</div>
                <div className="header">Start delay (ms)</div>
                <div className="header">End delay (ms)</div>
                <div className="header">Loops</div>
            </div>
            <div ref={actionGroupRef2} className="actions" onMouseUp={onRightClick}>
                <Reorder.Group ref={actionGroupRef1} values={activeActions} onReorder={onReorder}>
                    {activeActions.map((action, index) =>
                        <ActionItem onRemoveAction={removeAction} groupActionAmount={actionsInGroup.length} groupId={groupId} onContextMenuOpenChange={handleAnyContextMenuOpenChange} index={pageIndexPosition + index} onOpenEditWindow={openEditWindow} onPaste={onPaste} isSelected={action.id in selectedActionIds} onMoveDown={moveActionDown} onMoveUp={moveActionUp} onSelectionClick={onActionItemSelectionClick} performing={(pageIndexPosition + index) === currentActionIndex} data={action} key={`action-item-${action.id}`} />
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