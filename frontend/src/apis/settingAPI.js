import axiosInstance from "./axiosInstance";

const BASE_ROUTE = "/setting"

const updateSettings = (settingsToUpdate) => {
    return axiosInstance.post(`${BASE_ROUTE}`, settingsToUpdate).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const getSettingDefaults = () => {
    return axiosInstance.get(`${BASE_ROUTE}/default-values`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const getSettingDefault = (settingName) => {
    return axiosInstance.get(`${BASE_ROUTE}/default-value`, { "name": settingName }).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const getAllSettings = () => {
    return axiosInstance.get(`${BASE_ROUTE}/all`).then(response => {
        return response;
    }).catch(e => {
        throw e;
    })
}

const functions = {
    updateSettings,
    getSettingDefaults,
    getSettingDefault,
    getAllSettings
};

export default functions;
