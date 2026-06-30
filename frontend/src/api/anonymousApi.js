import axiosClient from './axiosClient';

export const createAnonymousComplaint = (payload) => axiosClient.post('/anonymous/complaints', payload);

export const trackAnonymousComplaint = (payload) => axiosClient.post('/anonymous/track', payload);

export const listAnonymousNotifications = (payload) => axiosClient.post('/anonymous/notifications', payload);
