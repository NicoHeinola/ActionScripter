import BasicButton from "components/inputs/BasicButton";
import SelectBox from "components/inputs/SelectBox";
import TextInput from "components/inputs/TextInput";
import { useEffect, useMemo, useState } from "react";

import { connect } from 'react-redux';
import { addActionCall, removeActionCall, setActionsCall, swapActionIndexesCall } from "store/reducers/actionsReducer";
import ActionList from "components/actions/ActionList";

import "styles/views/scripteditorview.scss";

const ScriptEditorView = (props) => {
    let actionTypes = useMemo(() => [
        { "text": "Mouse Click", "value": "mouse-click" },
    ], []);

    const [actionFilterKeyword, setActionFilterKeyword] = useState("");
    const [filteredActions, setFilteredActions] = useState([]);
    const [selectedActionType, setSelectedActionType] = useState("");

    useEffect(() => {
        const filterActions = () => {
            let newFilteredActions = [];
            newFilteredActions = actionTypes.filter(action => action.value.toLowerCase().includes(actionFilterKeyword.toLowerCase()));
            setFilteredActions(newFilteredActions);
        }

        filterActions();
    }, [actionFilterKeyword, actionTypes])

    const addNewAction = () => {
        if (selectedActionType === "") {
            return;
        }

        props.addActionCall(selectedActionType);
    }

    return (
        <div className="script-editor-view">
            <div className="add-action-container">
                <TextInput onChange={e => setActionFilterKeyword(e.target.value)} type={"text"} placeholder={"Filter Actions"}></TextInput>
                <div className="actions">
                    <SelectBox onSelect={setSelectedActionType} className="action-list" placeholder="Actions" options={filteredActions} />
                    <BasicButton onClick={addNewAction} className="add-button">Add</BasicButton>
                </div>
            </div>
            <ActionList />
        </div>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(ScriptEditorView);