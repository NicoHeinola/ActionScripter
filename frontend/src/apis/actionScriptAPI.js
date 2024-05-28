import axiosInstance from "./axiosInstance";

const BASE_ROUTE = "/action-script"

const getActionScript = () => {
    return axiosInstance.get(`${BASE_ROUTE}`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const getRecentActionScripts = () => {
    return axiosInstance.get(`${BASE_ROUTE}/recent`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const newRecentActionScript = (scriptPath) => {
    return axiosInstance.post(`${BASE_ROUTE}/recent`, { "path": scriptPath }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const getSerializedActionScript = () => {
    return axiosInstance.get(`${BASE_ROUTE}/serialize`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const newActionScript = () => {
    return axiosInstance.post(`${BASE_ROUTE}`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const updateActionScript = (scriptData) => {
    return axiosInstance.put(`${BASE_ROUTE}`, scriptData).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const startActionScript = (groupId) => {
    return axiosInstance.post(`${BASE_ROUTE}/start`, { "group-id": groupId }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const pauseActionScript = () => {
    return axiosInstance.post(`${BASE_ROUTE}/pause`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const stopActionScript = () => {
    return axiosInstance.post(`${BASE_ROUTE}/stop`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const saveActionScript = () => {
    return axiosInstance.post(`${BASE_ROUTE}/save`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const saveAsActionScript = () => {
    return axiosInstance.post(`${BASE_ROUTE}/save-as`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const loadActionScript = (path) => {
    return axiosInstance.post(`${BASE_ROUTE}/load`, { "path": path }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const createAction = (groupId, actionType) => {
    return axiosInstance.post(`${BASE_ROUTE}/create-new-action`, { "group-id": groupId, "action-type": actionType }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const addActions = (groupId, actionDatas, index) => {
    return axiosInstance.post(`${BASE_ROUTE}/add-new-actions`, { "group-id": groupId, "actions": actionDatas, "index": index }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const removeActions = (groupId, actionIds) => {
    return axiosInstance.post(`${BASE_ROUTE}/remove-actions`, { "group-id": groupId, "actions": actionIds }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const updateAction = (groupId, updatedAction) => {
    return axiosInstance.put(`${BASE_ROUTE}/update-action`, { "group-id": groupId, "action": updatedAction }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const swapActionIndexes = (groupId, indexA, indexB) => {
    return axiosInstance.post(`${BASE_ROUTE}/swap-two-actions`, { "group-id": groupId, "index-a": indexA, "index-b": indexB }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const undoHistory = (groupId) => {
    return axiosInstance.post(`${BASE_ROUTE}/undo`, { "group-id": groupId }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const redoHistory = (groupId) => {
    return axiosInstance.post(`${BASE_ROUTE}/redo`, { "group-id": groupId }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const addActionGroup = () => {
    return axiosInstance.post(`${BASE_ROUTE}/action-group`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const updateActionGroup = (groupId, groupData) => {
    return axiosInstance.put(`${BASE_ROUTE}/action-group`, { "group-id": groupId, "group-data": groupData }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const removeActionGroup = (groupId) => {
    return axiosInstance.delete(`${BASE_ROUTE}/action-group/${groupId}`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const updateSelectedActionGroup = (groupId) => {
    return axiosInstance.post(`${BASE_ROUTE}/action-group/select/${groupId}`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const functions = {
    getActionScript,
    getSerializedActionScript,
    newActionScript,
    updateActionScript,
    startActionScript,
    pauseActionScript,
    stopActionScript,
    getRecentActionScripts,
    newRecentActionScript,
    saveActionScript,
    saveAsActionScript,
    loadActionScript,
    undoHistory,
    redoHistory,
    createAction,
    addActions,
    removeActions,
    updateAction,
    swapActionIndexes,
    addActionGroup,
    updateActionGroup,
    removeActionGroup,
    updateSelectedActionGroup
};
export default functions; 
