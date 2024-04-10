import BasicButton from "components/inputs/BasicButton";
import "styles/views/nofileselectedview.scss"
import actionScriptAPI from "apis/actionScriptAPI";
import { useNavigate } from 'react-router-dom';

import { connect } from 'react-redux';
import { setActionsCall } from "store/reducers/actionsReducer";
import { getRecentScriptsCall, getScriptCall, loadActionScriptCall, newRecentScriptCall, updateScriptCall } from "store/reducers/actionScriptReducer";
import { useEffect } from "react";

const NoFileSelectedView = (props) => {
    const navigate = useNavigate();
    const getRecentScriptsCall = props.getRecentScriptsCall;

    const newEmptyActionScript = () => {
        actionScriptAPI.newActionScript();
        props.setActionsCall([]);
        props.getScriptCall();
        navigate('/script-editor');
    }

    const selectFileFromDisk = () => {
        // Create a temporary input to open the file dialog
        var input = document.createElement('input');
        input.type = 'file';
        input.multiple = false

        input.onchange = e => {
            // Get the selected file
            let file = e.target.files[0];

            if (!file) {
                return;
            }

            // Read the contents of that file
            let reader = new FileReader();
            reader.onload = function (e) {
                let contents = JSON.parse(e.target.result);

                // Create a new action script according to the opened file
                actionScriptAPI.newActionScript();

                let actions = contents["actions"];
                props.setActionsCall(actions);
                delete contents["actions"];

                props.updateScriptCall(contents);
                props.getScriptCall();
                navigate('/script-editor');
                props.newRecentScriptCall(file.path);
            };
            reader.readAsText(file);
        }

        input.click();
    }

    const openRecentFile = (path) => {
        props.loadActionScriptCall(path);
        navigate('/script-editor');
    }

    useEffect(() => {
        getRecentScriptsCall();
    }, [getRecentScriptsCall])

    return (
        <div className="no-file-selected-view">
            <div className="selection-buttons">
                <BasicButton className="button" onClick={newEmptyActionScript}>Create a new script</BasicButton>
                <BasicButton className="button" onClick={selectFileFromDisk}>Open a script from disk</BasicButton>
            </div>
            <div className="recent-scripts">
                <h1 className="title">Recent scripts</h1>
                <div className="recent-list">
                    <div className="items">
                        {
                            (props.recentScripts.length > 0) ?
                                props.recentScripts.map(recentScript =>
                                    <div onClick={() => openRecentFile(recentScript.path)} className="recent" key={`recent-script-${recentScript.id}`}><div className="bg"></div><p>{recentScript.path}</p></div>
                                ) : <p>No recent scripts</p>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        recentScripts: state.actionScript.recentScripts,
    };
};

const mapDispatchToProps = {
    setActionsCall,
    getScriptCall,
    updateScriptCall,
    getRecentScriptsCall,
    newRecentScriptCall,
    loadActionScriptCall,
};

export default connect(mapStateToProps, mapDispatchToProps)(NoFileSelectedView);