import BasicButton from "components/inputs/BasicButton";
import "styles/views/nofileselectedview.scss"
import actionScriptAPI from "apis/actionScriptAPI";
import { useNavigate } from 'react-router-dom';

import { connect } from 'react-redux';
import { getRecentScriptsCall, getScriptCall, loadActionScriptCall, newRecentScriptCall, setIsLoadingActionsCall, setScriptIsModifiedCall, updateScriptCall } from "store/reducers/actionScriptReducer";
import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { open } from '@tauri-apps/api/dialog';
import { readTextFile } from '@tauri-apps/api/fs';

const NoFileSelectedView = (props) => {
    const navigate = useNavigate();
    const { getRecentScriptsCall, recentScripts, getScriptCall, loadActionScriptCall, newRecentScriptCall, setIsLoadingActionsCall, setScriptIsModifiedCall, updateScriptCall } = props;

    const newEmptyActionScript = async () => {
        await actionScriptAPI.newActionScript();
        await getScriptCall();
        navigate('/script-editor');
        setScriptIsModifiedCall(true);
    }

    const selectFileFromDisk = useCallback(async () => {
        const filePath = await open({
            multiple: false,
            title: "Choose an action script",
            filters: [
                {
                    name: "ActionScript",
                    extensions: ["acsc"]
                }
            ]
        });

        const fileContentsPlain = await readTextFile(filePath);
        const fileContents = JSON.parse(fileContentsPlain);

        await actionScriptAPI.newActionScript();
        await getScriptCall();
        await setIsLoadingActionsCall(true);
        navigate('/script-editor');
        await updateScriptCall(fileContents);
        await getScriptCall();
        newRecentScriptCall(filePath);
        setScriptIsModifiedCall(false);
        setIsLoadingActionsCall(false);
    }, [getScriptCall, navigate, newRecentScriptCall, setIsLoadingActionsCall, setScriptIsModifiedCall, updateScriptCall]);

    const openRecentFile = async (path) => {
        await actionScriptAPI.newActionScript();
        await getScriptCall();
        navigate('/script-editor');
        loadActionScriptCall(path);
    }

    useEffect(() => {
        getRecentScriptsCall();
    }, [getRecentScriptsCall])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="no-file-selected-view page">
            <div className="selection-buttons">
                <BasicButton theme="add" className="button" onClick={newEmptyActionScript}>Create a new script</BasicButton>
                <BasicButton className="button" onClick={selectFileFromDisk}>Open a script from disk</BasicButton>
            </div>
            <div className="recent-scripts">
                <h1 className="title">Recent scripts</h1>
                <div className="recent-list">
                    <div className="items">
                        {
                            (recentScripts.length > 0) ?
                                recentScripts.map(recentScript =>
                                    <div onClick={() => openRecentFile(recentScript.path)} className="recent" key={`recent-script-${recentScript.id}`}><div className="bg"></div><p>{recentScript.path}</p></div>
                                ) : <p>No recent scripts</p>
                        }
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

const mapStateToProps = (state) => {
    return {
        recentScripts: state.actionScript.recentScripts,
    };
};

const mapDispatchToProps = {
    getScriptCall,
    updateScriptCall,
    getRecentScriptsCall,
    newRecentScriptCall,
    loadActionScriptCall,
    setScriptIsModifiedCall,
    setIsLoadingActionsCall,
};

export default connect(mapStateToProps, mapDispatchToProps)(NoFileSelectedView);