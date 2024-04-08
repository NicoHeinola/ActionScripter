import "styles/components/actions/actionitem.scss";

import { addActionCall, removeActionCall, setActionsCall, swapActionIndexesCall } from "store/reducers/actionsReducer";
import { connect } from 'react-redux';
import { Reorder, useDragControls } from "framer-motion";
import BasicButton from "components/inputs/BasicButton";


const ActionItem = (props) => {
    const action = props.data;
    const dragControls = useDragControls();

    const removeAction = (id) => {
        props.removeActionCall(id);
    }

    return (
        <Reorder.Item value={action} dragListener={false} dragControls={dragControls} className="action-item-container">
            <div className={"action-item" + ((props.className) ? ` ${props.className}` : "")}>
                <div onPointerDown={(e) => dragControls.start(e)} className="data drag">
                    <img alt="Drag Icon" draggable="false" className="icon" src="images/icons/drag.png"></img>
                </div>
                <div className="data">{action["name"]}</div>
                <div className="data">{action["type"]}</div>
                <div className="data">{action["start-delay-ms"]}</div>
                <div className="data">{action["end-delay-ms"]}</div>
                <div className="data buttons">
                    <BasicButton className="button" icon="images/icons/edit.png"></BasicButton>
                    <BasicButton onClick={() => removeAction(action.id)} className="button" icon="images/icons/delete.png"></BasicButton>
                </div>
            </div>
        </Reorder.Item>
    )
}


const mapStateToProps = (state) => {
    return {
        allActions: state.actions.allActions,
    };
};

const mapDispatchToProps = {
    addActionCall,
    removeActionCall,
    setActionsCall,
    swapActionIndexesCall
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionItem);