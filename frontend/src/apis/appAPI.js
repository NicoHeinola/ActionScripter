import axiosInstance from "./axiosInstance";

const BASE_ROUTE = "/app"

const quitBackend = () => {
    return axiosInstance.post(`${BASE_ROUTE}/quit`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const functions = {
    quitBackend,
};
export default functions;
