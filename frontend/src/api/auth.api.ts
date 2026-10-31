import axiosClient from './axios.config.ts'
import type { LoginFormInputs } from '../types/auth.type';
import type { SignupFormInputs } from '../types/auth.type';



//sign-up Api
export const signupApi = async (signupData: SignupFormInputs) => {
    const response = await axiosClient.post('/auth/register', { email: signupData.email, password: signupData.password, name: signupData.FullName });
    return response.data;
}

//Login Api
export const loginApi = async (loginData: LoginFormInputs) => {
    const response = await axiosClient.post('/auth/login', { email: loginData.email, password: loginData.password });
    return response.data;
}

//Get Current User Api
export const getMeApi = async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
}

//Refresh Token Api
export const refreshTokenApi = async () => {
    const response = await axiosClient.post('/auth/refresh-token');
    return response.data;
}

//Logout Api
export const logoutApi = async () => {
    const response = await axiosClient.post('/auth/logout');
    return response.data;
}

//get All polls
export const getAllPollsApi = async () => {
  console.log('get poll API call....');
  const response = await axiosClient.get('/poll/all-polls');
  console.log('get all polls response=',response);
  return response.data.data;
};
