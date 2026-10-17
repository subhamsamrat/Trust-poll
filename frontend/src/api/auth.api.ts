import axiosClient from './axios.config.ts'
import type { LoginFormInputs } from '../types/auth.type';



//Login Api
export const loginApi = async (loginData: LoginFormInputs) => {
    console.log("login api called")
        const response = await axiosClient.post('/auth/login', { email: loginData.email, password: loginData.password });
        console.log("response=",response);
        
        return response.data;
}