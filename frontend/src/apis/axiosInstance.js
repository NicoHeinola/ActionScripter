import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}`,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;