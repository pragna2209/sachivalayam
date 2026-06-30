import axiosClient from './axiosClient';

export const listCategories = (params) => axiosClient.get('/categories', { params });

export const createCategory = (payload) => axiosClient.post('/categories', payload);

export const updateCategory = (id, payload) => axiosClient.patch(`/categories/${id}`, payload);

export const listDepartments = (params) => axiosClient.get('/departments', { params });

export const createDepartment = (payload) => axiosClient.post('/departments', payload);

export const updateDepartment = (id, payload) => axiosClient.patch(`/departments/${id}`, payload);

export const listCategoryDepartmentMappings = (params) =>
  axiosClient.get('/category-department-mappings', { params });

export const createCategoryDepartmentMapping = (payload) =>
  axiosClient.post('/category-department-mappings', payload);
