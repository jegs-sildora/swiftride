import api from "./apiClient";

const FleetService = {
  // Vehicles
  listVehicles: (params = {}) => api.get("/fleet/vehicles", { params }),
  getVehicle: (id) => api.get(`/fleet/vehicles/${id}`),
  createVehicle: (data) => api.post("/fleet/vehicles", data),
  updateVehicle: (id, data) => api.put(`/fleet/vehicles/${id}`, data),
  deleteVehicle: (id) => api.delete(`/fleet/vehicles/${id}`),
  updateStatus: (id, status) =>
    api.patch(`/fleet/vehicles/${id}/status`, { status }),
  checkAvailability: (id) => api.get(`/fleet/vehicles/${id}/availability`),
  listInspections: (vehicleId) => api.get(`/fleet/vehicles/${vehicleId}/inspections`),
  createInspection: (vehicleId, data) => api.post(`/fleet/vehicles/${vehicleId}/inspections`, data),

  // Maintenance
  listLogs: (params = {}) => api.get("/fleet/maintenance-logs", { params }),
  getLog: (id) => api.get(`/fleet/maintenance-logs/${id}`),
  createLog: (data) => api.post("/fleet/maintenance-logs", data),
  updateLog: (id, data) => api.put(`/fleet/maintenance-logs/${id}`, data),
  deleteLog: (id) => api.delete(`/fleet/maintenance-logs/${id}`),
};

export default FleetService;
