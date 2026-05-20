import api from "./apiClient";

const CrmService = {
  // Customers
  listCustomers: (params = {}) => api.get("/crm/customers", { params }),
  getCustomer: (id) => api.get(`/crm/customers/${id}`),
  createCustomer: (data) => api.post("/crm/customers", data),
  updateCustomer: (id, data) => api.put(`/crm/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/crm/customers/${id}`),
  verifyCustomer: (id) => api.get(`/crm/customers/${id}/verify`),
  listDocuments: (customerId) => api.get(`/crm/customers/${customerId}/documents`),
  uploadDocument: (customerId, data) => api.post(`/crm/customers/${customerId}/documents`, data),

  // Driver Licenses
  listLicenses: (params = {}) => api.get("/crm/driver-licenses", { params }),
  getLicense: (id) => api.get(`/crm/driver-licenses/${id}`),
  createLicense: (data) => api.post("/crm/driver-licenses", data),
  updateLicense: (id, data) => api.put(`/crm/driver-licenses/${id}`, data),
  deleteLicense: (id) => api.delete(`/crm/driver-licenses/${id}`),
  verifyLicense: (id) => api.patch(`/crm/driver-licenses/${id}/verify`),
};

export default CrmService;
