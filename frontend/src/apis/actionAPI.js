import axiosInstance from "./axiosInstance";

const BASE_ROUTE = "/action"

const createAction = (actionType) => {
    return axiosInstance.post(`${BASE_ROUTE}`, { "action-type": actionType }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const addAction = (actionData, index) => {
    return axiosInstance.post(`${BASE_ROUTE}/add`, { "action": actionData, "index": index }).then(response => {
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

const updateAction = (updatedAction) => {
    return axiosInstance.put(`${BASE_ROUTE}/${updatedAction.id}`, updatedAction).then(response => {
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
    createAction,
    updateAction,
    removeAction,
    setActions,
    swapActionIndexes,
    addAction
};
export default functions;
