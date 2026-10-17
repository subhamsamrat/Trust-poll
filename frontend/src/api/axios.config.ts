import axios from 'axios';


const BaseUrl=import.meta.env.VITE_BASE_URL
console.log("baseUrl=",BaseUrl);
const axiosClient = axios.create({
  baseURL: BaseUrl, 
  headers: {
    'Content-Type': 'application/json',
    
  },
});

export default axiosClient;
