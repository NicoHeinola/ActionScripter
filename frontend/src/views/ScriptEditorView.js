import BasicButton from "components/inputs/BasicButton";
import SelectBox from "components/inputs/SelectBox";
import TextInput from "components/inputs/TextInput";
import { useEffect, useMemo, useState } from "react";
import "styles/views/scripteditorview.scss";

import actionAPI from "apis/actionAPI";

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

        actionAPI.addAction(selectedActionType);
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
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ScriptEditorView;
