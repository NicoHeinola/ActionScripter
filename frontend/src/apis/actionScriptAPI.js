import axiosInstance from "./axiosInstance";

const BASE_ROUTE = "/action-script"

const newActionScript = () => {
    return axiosInstance.post(`${BASE_ROUTE}`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const functions = { newActionScript };
export default functions; 
