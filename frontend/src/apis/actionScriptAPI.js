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

const startActionScript = () => {
    return axiosInstance.post(`${BASE_ROUTE}/start`).then(response => {
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

const undoHistory = () => {
    return axiosInstance.post(`${BASE_ROUTE}/undo`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const redoHistory = () => {
    return axiosInstance.post(`${BASE_ROUTE}/redo`).then(response => {
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
    redoHistory
};
export default functions; 
