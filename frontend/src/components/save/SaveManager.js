import { useEffect } from "react";

import actionScriptAPI from "apis/actionScriptAPI.js";

const SaveManager = () => {
    const handleSaveFile = async () => {
        const fileName = "Action Script.acsc";

        const fileContent = JSON.stringify((await actionScriptAPI.getSerializedActionScript()).data);
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                handleSaveFile();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [])

    return (
        <div className="save-manager">

        </div>
    )
};

export default SaveManager;