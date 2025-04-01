import axios from "axios";

const ApiClient = axios.create({
    baseURL: "http://10.10.55.57",
});

ApiClient.interceptors.request.use((config)=>{
    const token = localStorage.getItem("accessToken");
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    // console.log(token);
    return config;
},(error)=>{
  return Promise.reject(error);
});
export default ApiClient;