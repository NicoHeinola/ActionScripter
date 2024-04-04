import BasicButton from "components/inputs/BasicButton";
import SelectBox from "components/inputs/SelectBox";
import TextInput from "components/inputs/TextInput";
import { useEffect, useState } from "react";
import "styles/views/scripteditorview.scss";

const ScriptEditorView = (props) => {
    let actionTypes = [
        { "text": "Mouse Click", "value": "mouse-click" },
    ]

    const [actionFilterKeyword, setActionFilterKeyword] = useState("");
    const [filteredActions, setFilteredActions] = useState([]);

    useEffect(() => {
        const filterActions = () => {
            let newFilteredActions = [];
            newFilteredActions = actionTypes.filter(action => action.value.includes(actionFilterKeyword));
            setFilteredActions(newFilteredActions);
        }

        filterActions();
    }, [actionFilterKeyword])

    return (
        <div className="script-editor-view">
            <div className="add-action-container">
                <TextInput onChange={e => setActionFilterKeyword(e.target.value)} type={"text"} placeholder={"Filter Actions"}></TextInput>
                <div className="actions">
                    <SelectBox className="action-list" placeholder="Actions" options={filteredActions} />
                    <BasicButton className="add-button">Add</BasicButton>
                </div>
                <div className="action-table">
                    <table>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Start Delay (ms)</th>
                            <th>End Delay (ms)</th>
                            <th></th>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ScriptEditorView;
