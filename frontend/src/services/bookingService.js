import api from "./apiClient";

const BookingService = {
  // Bookings
  listBookings: (params = {}) => api.get("/booking/bookings", { params }),
  getBooking: (id) => api.get(`/booking/bookings/${id}`),
  createBooking: (data) => api.post("/booking/bookings", data),
  updateBooking: (id, data) => api.put(`/booking/bookings/${id}`, data),
  cancelBooking: (id) => api.delete(`/booking/bookings/${id}`),

  // Schedules
  listSchedules: (bookingId) =>
    api.get("/booking/schedules", { params: { booking_id: bookingId } }),
  getSchedule: (id) => api.get(`/booking/schedules/${id}`),
  createSchedule: (data) => api.post("/booking/schedules", data),
  updateSchedule: (id, data) => api.put(`/booking/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/booking/schedules/${id}`),
};

export default BookingService;
