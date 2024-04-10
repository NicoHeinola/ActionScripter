import BasicButton from "components/inputs/BasicButton";
import "styles/views/nofileselectedview.scss"
import actionScriptAPI from "apis/actionScriptAPI";
import { useNavigate } from 'react-router-dom';

import { connect } from 'react-redux';
import { setActionsCall } from "store/reducers/actionsReducer";
import { getScriptCall, updateScriptCall } from "store/reducers/actionScriptReducer";

const NoFileSelectedView = (props) => {
    const navigate = useNavigate();

    const newEmptyActionScript = () => {
        actionScriptAPI.newActionScript();
        props.setActionsCall([]);
        props.getScriptCall();
        navigate('/script-editor');
    }

    const selectFileFromDisk = () => {
        var input = document.createElement('input');
        input.type = 'file';
        input.multiple = false

        input.onchange = e => {
            let file = e.target.files[0];

            if (!file) {
                return;
            }
            let reader = new FileReader();
            reader.onload = function (e) {
                let contents = JSON.parse(e.target.result);

                actionScriptAPI.newActionScript();

                let actions = contents["actions"]
                props.setActionsCall(actions);
                delete contents["actions"];

                props.updateScriptCall(contents);
                props.getScriptCall();
                navigate('/script-editor');

            };
            reader.readAsText(file);
        }

        input.click();
    }

    return (
        <div className="no-file-selected-view">
            <div className="selection-buttons">
                <BasicButton className="button" onClick={newEmptyActionScript}>Create a new script</BasicButton>
                <BasicButton className="button" onClick={selectFileFromDisk}>Open a script from disk</BasicButton>
            </div>
            <div className="recent-scripts">
                <h1 className="title">Recent scripts</h1>
                <div className="recent-list">
                    <p className="recent">file 1</p>
                    <p className="recent">file 1</p>
                    <p className="recent">file 1</p>
                    <p className="recent">file 1</p>
                    <p className="recent">file 1</p>
                    <p className="recent">file 1</p>
                    <p className="recent">file 1</p>
                    <p className="recent">file 1</p>
                    <p className="recent">file 1</p>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = {
    setActionsCall,
    getScriptCall,
    updateScriptCall,
};

export default connect(mapStateToProps, mapDispatchToProps)(NoFileSelectedView);