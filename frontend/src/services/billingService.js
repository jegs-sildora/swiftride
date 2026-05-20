import api from "./apiClient";

const BillingService = {
  // Invoices
  listInvoices: (params = {}) => api.get("/billing/invoices", { params }),
  getInvoice: (id) => api.get(`/billing/invoices/${id}`),
  createInvoice: (data) => api.post("/billing/invoices", data),
  updateInvoice: (id, data) => api.put(`/billing/invoices/${id}`, data),
  voidInvoice: (id) => api.delete(`/billing/invoices/${id}`),
  summary: (customerId) =>
    api.get("/billing/invoices/summary", {
      params: { customer_id: customerId },
    }),

  // Payments
  listPayments: (invoiceId) =>
    api.get("/billing/payments", { params: { invoice_id: invoiceId } }),
  getPayment: (id) => api.get(`/billing/payments/${id}`),
  recordPayment: (data) => api.post("/billing/payments", data),
  reversePayment: (id) => api.delete(`/billing/payments/${id}`),

  // Refunds
  listRefunds: () => api.get("/billing/refunds"),
  createRefund: (data) => api.post("/billing/refunds", data),
};

export default BillingService;
