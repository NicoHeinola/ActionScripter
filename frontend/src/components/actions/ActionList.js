import "styles/components/actions/actionlist.scss";

import { connect } from 'react-redux';
import { Reorder } from "framer-motion";
import ActionItem from "./ActionItem";
import { swapActionIndexesCall } from "store/reducers/actionsReducer";
import socket from "socket/socketManager";
import { useEffect, useState } from "react";

const ActionList = (props) => {
    const [currentActionIndex, setCurrentActionIndex] = useState(0);
    const [selectedActionIds, setSelectedActionIds] = useState({});

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

    const moveActionUp = (id) => {
        let index = props.allActions.findIndex(action => action.id === id);

        // Couldn't find action index
        if (index === null) {
            return;
        }

        // If action would go out of bounds
        if (index - 1 < 0) {
            return
        }

        props.swapActionIndexesCall(index, index - 1);
    }

    const moveActionDown = (id) => {
        let index = props.allActions.findIndex((action) => action.id === id);

        // Couldn't find action index
        if (index === null) {
            return;
        }

        // If action would go out of bounds
        if (index + 1 >= props.allActions.length) {
            return
        }

        props.swapActionIndexesCall(index, index + 1);
    }

    const selectActionItem = (id) => {
        const newSelectedActionIds = { ...selectedActionIds };
        newSelectedActionIds[`${id}`] = null;
        setSelectedActionIds(newSelectedActionIds);
    }

    const unselectActionItem = (id) => {
        const newSelectedActionIds = { ...selectedActionIds };
        delete newSelectedActionIds[`${id}`];
        setSelectedActionIds(newSelectedActionIds);
    }

    return (
        <div className="action-table">
            <div className="headers row">
                <div className="header"></div>
                <div className="header">Name</div>
                <div className="header">Type</div>
                <div className="header">Start delay (ms)</div>
                <div className="header">End delay (ms)</div>
                <div className="header">Loop count</div>
                <div className="header center">Actions</div>
            </div>
            <div className="actions">
                <Reorder.Group style={{ height: "100%" }} values={props.allActions} onReorder={onReorder}>
                    {props.allActions.map((action, index) =>
                        <ActionItem moveDown={() => moveActionDown(action.id)} moveUp={() => moveActionUp(action.id)} onUnselect={() => unselectActionItem(action.id)} onSelect={() => selectActionItem(action.id)} performing={index === currentActionIndex} data={action} key={`action-item-${action.id}`} />
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
    swapActionIndexesCall
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionList);