import BasicButton from "components/inputs/BasicButton";
import SelectBox from "components/inputs/SelectBox";
import TextInput from "components/inputs/TextInput";
import { useEffect, useMemo, useState } from "react";

import { connect } from 'react-redux';
import actionAPI from "apis/actionAPI";
import { addAction, removeAction } from "store/reducers/actionsReducer";

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

    const addNewAction = async () => {
        if (selectedActionType === "") {
            return;
        }

        let response = await actionAPI.addAction(selectedActionType);
        props.addAction(response.data);
    }

    return (
        <div className="script-editor-view">
            <div className="add-action-container">
                <TextInput onChange={e => setActionFilterKeyword(e.target.value)} type={"text"} placeholder={"Filter Actions"}></TextInput>
                <div className="actions">
                    <SelectBox onSelect={setSelectedActionType} className="action-list" placeholder="Actions" options={filteredActions} />
                    <BasicButton onClick={addNewAction} className="add-button">Add</BasicButton>
                </div>
                <div className="action-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Start Delay (ms)</th>
                                <th>End Delay (ms)</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.allActions.map(action =>
                                <tr className="action-row" key={'action-' + action.id}>
                                    <td className="action-data">{action["name"]}</td>
                                    <td className="action-data">{action["type"]}</td>
                                    <td className="action-data">{action["start-delay-ms"]}</td>
                                    <td className="action-data">{action["end-delay-ms"]}</td>
                                </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        allActions: state.actions.allActions,
    };
};

const mapDispatchToProps = {
    addAction, removeAction
};

export default connect(mapStateToProps, mapDispatchToProps)(ScriptEditorView);