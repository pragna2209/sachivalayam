import axiosClient from './axiosClient';

export const requestOtp = (payload) => axiosClient.post('/auth/otp/request', payload);

export const verifyOtp = (payload) => axiosClient.post('/auth/otp/verify', payload);

export const loginWithPassword = (payload) => axiosClient.post('/auth/login/password', payload);

export const registerWithPassword = (payload) => axiosClient.post('/auth/register/password', payload);

export const setPassword = (payload) => axiosClient.post('/auth/password', payload);

export const refreshToken = (payload) => axiosClient.post('/auth/refresh-token', payload);

export const logout = () => axiosClient.post('/auth/logout');

export const getMe = () => axiosClient.get('/auth/me');
