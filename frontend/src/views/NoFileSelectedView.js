import BasicButton from "components/inputs/BasicButton";
import { Link } from "react-router-dom";
import "styles/views/nofileselectedview.scss"
import actionScriptAPI from "apis/actionScriptAPI";

const NoFileSelectedView = (props) => {

    const newEmptyActionScript = () => {
        actionScriptAPI.newActionScript();
    }

    return (
        <div className="no-file-selected-view">
            <div className="selection-buttons">
                <Link to={"/script-editor"}><BasicButton onClick={newEmptyActionScript} className="button">Create a new script</BasicButton></Link>
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

export default NoFileSelectedView;