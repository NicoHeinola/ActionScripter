import SelectBox from "components/inputs/SelectBox";
import TextInput from "components/inputs/TextInput";
import "styles/views/scripteditorview.scss";

const ScriptEditorView = (props) => {
    return (
        <div className="script-editor-view">
            <div className="action-add-container">
                <TextInput type={"text"} placeholder={"First Name"}></TextInput>
                <div className="potato">
                    <SelectBox placeholder="Placeholder Text" options={[{ text: "Option 1", value: "opt1" }, { text: "Option 4", value: "opt4" }, { text: "Option 2", value: "opt2" }, { text: "Option 3", value: "opt3" }]} />
                </div>
            </div>
        </div>
    );
}

export default ScriptEditorView;