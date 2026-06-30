import axiosClient from './axiosClient';

export const createStaff = (payload) => axiosClient.post('/staff', payload);

export const listStaff = (params) => axiosClient.get('/staff', { params });

export const getStaff = (id) => axiosClient.get(`/staff/${id}`);

export const updateStaff = (id, payload) => axiosClient.patch(`/staff/${id}`, payload);

export const setStaffStatus = (id, isActive) => axiosClient.patch(`/staff/${id}/status`, { isActive });

export const getMyProfile = () => axiosClient.get('/users/me');

export const updateMyProfile = (payload) => axiosClient.patch('/users/me', payload);

export const listCitizens = (params) => axiosClient.get('/users', { params });

export const setCitizenStatus = (id, isActive) => axiosClient.patch(`/users/${id}/status`, { isActive });
