import BasicButton from "components/inputs/BasicButton";
import "styles/views/nofileselectedview.scss"
import actionScriptAPI from "apis/actionScriptAPI";
import { useNavigate } from 'react-router-dom';

import { connect } from 'react-redux';
import { setActionsCall } from "store/reducers/actionsReducer";
import { getScriptCall } from "store/reducers/actionScriptReducer";

const NoFileSelectedView = (props) => {
    const navigate = useNavigate();

    const newEmptyActionScript = () => {
        actionScriptAPI.newActionScript();
        props.setActionsCall([]);
        props.getScriptCall();
        navigate('/script-editor');
    }

    return (
        <div className="no-file-selected-view">
            <div className="selection-buttons">
                <BasicButton className="button" onClick={newEmptyActionScript}>Create a new script</BasicButton>
                <BasicButton className="button">Open a script from disk</BasicButton>
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
};

export default connect(mapStateToProps, mapDispatchToProps)(NoFileSelectedView);