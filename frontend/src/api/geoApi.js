import axiosClient from './axiosClient';

export const listDistricts = () => axiosClient.get('/geo/districts');

export const listMandalsByDistrict = (districtId) => axiosClient.get(`/geo/districts/${districtId}/mandals`);

export const listVillagesByMandal = (mandalId) => axiosClient.get(`/geo/mandals/${mandalId}/villages`);

export const listSachivalayamsByVillage = (villageId) => axiosClient.get(`/geo/villages/${villageId}/sachivalayams`);

export const createGeoNode = (level, payload) => axiosClient.post(`/geo/${level}`, payload);

export const updateGeoNode = (level, id, payload) => axiosClient.patch(`/geo/${level}/${id}`, payload);

export const deactivateGeoNode = (level, id) => axiosClient.delete(`/geo/${level}/${id}`);
