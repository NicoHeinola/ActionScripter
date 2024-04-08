import axiosInstance from "./axiosInstance";

const BASE_ROUTE = "/action"

const addAction = (actionType) => {
    return axiosInstance.post(`${BASE_ROUTE}`, { "action-type": actionType }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const removeAction = (actionId) => {
    return axiosInstance.delete(`${BASE_ROUTE}/${actionId}`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const updateAction = (actionId) => {
    return axiosInstance.post(`${BASE_ROUTE}`, { "id": actionId }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const swapActionIndexes = (indexA, indexB) => {
    return axiosInstance.post(`${BASE_ROUTE}/swap`, { "index-a": indexA, "index-b": indexB }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const setActions = (actions) => {
    return axiosInstance.post(`${BASE_ROUTE}/overwrite`, { "actions": actions }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const functions = {
    addAction,
    updateAction,
    removeAction,
    setActions,
    swapActionIndexes
};
export default functions;
