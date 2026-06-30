import axiosClient from './axiosClient';

export const listAuditLogs = (params) => axiosClient.get('/audit-logs', { params });

export const listActivityLogs = (params) => axiosClient.get('/activity-logs', { params });

export const listSettings = () => axiosClient.get('/settings');

export const updateSetting = (key, payload) => axiosClient.patch(`/settings/${key}`, payload);
