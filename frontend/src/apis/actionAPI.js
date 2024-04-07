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

const functions = { addAction, updateAction, removeAction };
export default functions;
