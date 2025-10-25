import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === 'development' ? 'https://dsa2z-yltf.onrender.com/api/v1' : 'https://dsa2z-yltf.onrender.com/api/v1',
    withCredentials : true,
})
