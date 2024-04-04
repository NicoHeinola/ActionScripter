import TextInput from "components/inputs/TextInput";
import "styles/views/scripteditorview.scss";

const ScriptEditorView = (props) => {
    return (
        <div className="script-editor-view">
            <div className="action-add-container">
                <TextInput type={"text"} placeholder={"First Name"}></TextInput>
            </div>
        </div>
    );
}

export default ScriptEditorView;