import axiosInstance from "./axiosInstance";

const BASE_ROUTE = "/action-script"

const getActionScript = () => {
    return axiosInstance.get(`${BASE_ROUTE}`).then(response => {
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

const functions = {
    getActionScript,
    getSerializedActionScript,
    newActionScript,
    updateActionScript,
    startActionScript,
    pauseActionScript,
    stopActionScript,
};
export default functions; 
