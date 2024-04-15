import axiosInstance from "./axiosInstance";

const BASE_ROUTE = "/util"

const startMousePositionPickerCountdown = (durationSeconds) => {
    return axiosInstance.post(`${BASE_ROUTE}/pick-mouse-position-countdown`, { "duration-s": durationSeconds }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const functions = {
    startMousePositionPickerCountdown,
};
export default functions;
