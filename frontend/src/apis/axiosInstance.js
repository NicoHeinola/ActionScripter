import axios from 'axios';

console.log(process.env.REACT_APP_API_URL)

const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;