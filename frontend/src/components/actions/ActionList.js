import "styles/components/actions/actionlist.scss";

import { connect } from 'react-redux';
import { Reorder } from "framer-motion";
import ActionItem from "./ActionItem";
import { swapActionIndexesCall } from "store/reducers/actionsReducer";

const ActionList = (props) => {
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
                <Reorder.Group style={{ overflowY: "auto", height: "100%" }} values={props.allActions} onReorder={onReorder}>
                    {props.allActions.map((action, index) =>
                        <ActionItem data={action} key={`action-item-${action.id}`} />
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