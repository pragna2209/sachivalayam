import axiosClient from './axiosClient';

export const createComplaint = (payload) => axiosClient.post('/complaints', payload);

export const listComplaints = (params) => axiosClient.get('/complaints', { params });

export const getComplaint = (id) => axiosClient.get(`/complaints/${id}`);

export const getComplaintTimeline = (id) => axiosClient.get(`/complaints/${id}/timeline`);

export const getComplaintEscalations = (id) => axiosClient.get(`/complaints/${id}/escalations`);

export const updateComplaintStatus = (id, payload) => axiosClient.patch(`/complaints/${id}/status`, payload);

export const reopenComplaint = (id, payload) => axiosClient.post(`/complaints/${id}/reopen`, payload);

export const submitComplaintFeedback = (id, payload) => axiosClient.post(`/complaints/${id}/feedback`, payload);

export const reassignComplaint = (id, payload) => axiosClient.patch(`/complaints/${id}/reassign`, payload);

export const escalateComplaint = (id, payload) => axiosClient.patch(`/complaints/${id}/escalate`, payload);

export const uploadEvidence = (complaintId, file, uploadedAtStage, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  if (uploadedAtStage) formData.append('uploadedAtStage', uploadedAtStage);
  return axiosClient.post(`/complaints/${complaintId}/evidence`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
};

export const getEvidenceSignedUrl = (evidenceId) => axiosClient.get(`/evidence/${evidenceId}`);
