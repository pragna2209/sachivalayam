import axiosClient from './axiosClient';

export const getAnalyticsSummary = (params) => axiosClient.get('/analytics/summary', { params });

export const getAnalyticsByCategory = (params) => axiosClient.get('/analytics/by-category', { params });

export const getAnalyticsByGeo = (params) => axiosClient.get('/analytics/by-geo', { params });

export const getStaffPerformance = (params) => axiosClient.get('/analytics/staff-performance', { params });

export const getResolutionTime = (params) => axiosClient.get('/analytics/resolution-time', { params });

export const exportReport = (params) =>
  axiosClient.get('/reports/export', { params, responseType: 'blob' });
