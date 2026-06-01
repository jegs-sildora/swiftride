/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';
import FleetService from '../services/fleetService';
import CrmService from '../services/crmService';
import BookingService from '../services/bookingService';
import BillingService from '../services/billingService';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import SearchableDropdown from '../components/SearchableDropdown';
import { Home, Truck, Users, Calendar, CreditCard, Plus, LogOut, Check, X, Wrench, FileText, DollarSign, Car, Shield, Clock, MoreVertical, Edit, Trash, AlertTriangle, Loader, Menu } from '../components/Icons';

const POPULAR_MAKES = ["TOYOTA", "NISSAN", "MITSUBISHI", "HONDA", "FORD", "MAZDA", "ISUZU", "SUZUKI", "HYUNDAI", "KIA", "MG", "BYD"];
const POPULAR_MODELS = ["VIOS", "CIVIC", "MONTERO SPORT", "FORTUNER", "ALMERA", "NAVARA", "EVEREST", "HIACE", "ERTIGA", "MU-X", "CITY", "ACCORD"];
const POPULAR_COLORS = ["SILVER", "WHITE", "BLACK", "GRAY", "RED", "BLUE", "BROWN", "YELLOW", "ORANGE", "GREEN"];

export default function DashboardPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  const [currentUser, setCurrentUser] = useState(null);

  // Data states
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Stats states
  const [stats, setStats] = useState({
    vehicles: 0,
    customers: 0,
    bookings: 0,
    revenue: 0,
  });

  // UI/Modal States
  const [loading, setLoading] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddLicense, setShowAddLicense] = useState(false);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showEditInvoice, setShowEditInvoice] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Edit / Actions state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeActionsMenu, setActiveActionsMenu] = useState({ type: null, id: null, rect: null, data: null });

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: '', message: '', variant: 'warning',
    confirmLabel: 'Confirm', loading: false, onConfirm: () => {}
  });

  // Simulated Role State
  const [simulatedRole, setSimulatedRole] = useState(() => localStorage.getItem("swiftride_simulated_role") || "");

  // New Modals UI States
  const [showInspectionsModal, setShowInspectionsModal] = useState(false);
  const [selectedVehicleForInspections, setSelectedVehicleForInspections] = useState(null);
  const [inspectionsList, setInspectionsList] = useState([]);
  const [loadingInspections, setLoadingInspections] = useState(false);

  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedCustomerForDocs, setSelectedCustomerForDocs] = useState(null);
  const [documentsList, setDocumentsList] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState(null);
  const [receiptDetails, setReceiptDetails] = useState(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedInvoiceForRefund, setSelectedInvoiceForRefund] = useState(null);

  // Form states
  const [vehicleForm, setVehicleForm] = useState({
    make: "", model: "", year: new Date().getFullYear(),
    plate_number: "", color: "", type: "car", status: "available", daily_rate: "",
    current_odometer: "", fuel_tank_capacity_liters: "50", insurance_policy_number: "", insurance_expiry_date: ""
  });
  const [customerForm, setCustomerForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    billing_address: "", city: "", state: "", postal_code: "", country: "Philippines"
  });
  const [licenseForm, setLicenseForm] = useState({
    customer_id: "", license_number: "", expiry_date: "",
    issuing_authority: "", license_class: "B"
  });
  const [bookingForm, setBookingForm] = useState({
    customer_id: "", vehicle_id: "", start_date: "", end_date: "", notes: "",
    pickup_location_id: "1", return_location_id: "1",
    addon_gps: false, addon_wifi: false, addon_driver: false
  });
  const [paymentForm, setPaymentForm] = useState({ invoice_id: "", amount_paid: "", payment_method: "cash" });
  const [invoiceForm, setInvoiceForm] = useState({
    amount: "", due_date: "", notes: ""
  });

  const [inspectionForm, setInspectionForm] = useState({
    booking_id: "",
    inspection_type: "checkout",
    odometer_reading: "",
    fuel_level_percent: "100",
    body_damage_notes: "",
    interior_clean_status: "EXCELLENT",
    safety_check_passed: true
  });
  const [documentForm, setDocumentForm] = useState({
    document_type: "LICENSE_PHOTO",
    s3_file_path: ""
  });
  const [refundForm, setRefundForm] = useState({
    refund_amount: "",
    refund_method: "GCASH",
    notes: "",
    reference_code: ""
  });

  // Confirm modal helpers
  const openConfirm = ({ title, message, variant = 'warning', confirmLabel = 'Confirm', onConfirm }) => {
    setConfirmModal({ isOpen: true, title, message, variant, confirmLabel, loading: false, onConfirm });
  };
  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  // Escape key handler for form modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowAddVehicle(false);
        setShowAddCustomer(false);
        setShowAddLicense(false);
        setShowAddBooking(false);
        setShowRecordPayment(false);
        setShowEditInvoice(false);
        setShowInspectionsModal(false);
        setShowDocumentsModal(false);
        setShowReceiptModal(false);
        setShowRefundModal(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Close actions dropdown on outside clicks
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.actions-dropdown-wrapper') && !e.target.closest('.actions-dropdown-menu-portal')) {
        setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Close actions dropdown on scroll or resize
  useEffect(() => {
    const handleScroll = () => {
      setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
    };
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // ID Formatters
  const formatCustomerId = (id) => id ? `CUSTOMER-${String(id).padStart(4, '0')}` : '';
  const formatVehicleId = (id) => id ? `VEHICLE-${String(id).padStart(4, '0')}` : '';
  const formatInvoiceId = (id) => id ? `INVOICE-${String(id).padStart(4, '0')}` : '';

  // Lookups and Date formatters for Manila Asia Timezone
  const getCustomerName = (id) => {
    if (!id) return '—';
    const c = customers.find(item => item.id === parseInt(id));
    return c ? `${c.first_name} ${c.last_name} (${formatCustomerId(c.id)})` : `Customer #${id}`;
  };

  const getVehicleName = (id) => {
    if (!id) return '—';
    const v = vehicles.find(item => item.id === parseInt(id));
    return v ? `${v.make} ${v.model} (${formatVehicleId(v.id)})` : `Vehicle #${id}`;
  };

  const formatManilaDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    try {
      const hasTime = dateStr.includes('T') || dateStr.includes(':') || dateStr.includes(' ');
      if (!hasTime) {
        return new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Manila',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(date);
      }

      const options = {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      
      const formatted = new Intl.DateTimeFormat('en-US', options).format(date);
      return formatted.replace(',', '');
    } catch (e) {
      return dateStr;
    }
  };

  const formatManilaDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Always fetch customers and vehicles to support lookups across tabs
      const [vRes, cRes] = await Promise.all([
        FleetService.listVehicles().catch(() => ({ data: { data: [] } })),
        CrmService.listCustomers().catch(() => ({ data: { data: [] } }))
      ]);
      const vList = vRes.data?.data || [];
      const cList = cRes.data?.data || [];
      setVehicles(vList);
      setCustomers(cList);

      if (activeTab === "overview") {
        const [bRes, iRes] = await Promise.all([
          BookingService.listBookings().catch(() => ({ data: { data: [] } })),
          BillingService.listInvoices().catch(() => ({ data: { data: [] } })),
        ]);

        const bList = bRes.data?.data || [];
        const iList = iRes.data?.data || [];

        setBookings(bList);
        setInvoices(iList);

        // Calculate revenue
        const paidTotal = iList
          .filter(inv => inv.status === "Paid" || inv.status === "paid")
          .reduce((sum, inv) => sum + parseFloat(inv.amount || inv.total_amount || 0), 0);

        setStats({
          vehicles: vRes.data?.total || vList.length,
          customers: cRes.data?.total || cList.length,
          bookings: bRes.data?.total || bList.length,
          revenue: paidTotal,
        });
      } else if (activeTab === "fleet") {
        // Already loaded by the shared fetch!
      } else if (activeTab === "crm") {
        // Already loaded by the shared fetch!
      } else if (activeTab === "bookings") {
        const res = await BookingService.listBookings();
        setBookings(res.data?.data || []);
      } else if (activeTab === "billing") {
        const res = await BillingService.listInvoices();
        setInvoices(res.data?.data || []);
      }
    } catch {
      toast.error("Error fetching data from downstream services. Make sure they are running.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch {
      // Ignored
    }
    navigate("/login");
  };

  const handleLogoutClick = () => openConfirm({
    title: 'Sign Out',
    message: 'Are you sure you want to sign out?',
    confirmLabel: 'Sign Out',
    variant: 'warning',
    onConfirm: async () => {
      closeConfirm();
      await handleLogout();
    }
  });

  // Modal close helpers to reset Edit/Form states
  const handleCloseAddVehicle = () => {
    setShowAddVehicle(false);
    setIsEditing(false);
    setEditingId(null);
    setVehicleForm({
      make: "", model: "", year: new Date().getFullYear(), plate_number: "", color: "", type: "car", status: "available", daily_rate: "",
      current_odometer: "", fuel_tank_capacity_liters: "50", insurance_policy_number: "", insurance_expiry_date: ""
    });
  };

  const handleCloseAddCustomer = () => {
    setShowAddCustomer(false);
    setIsEditing(false);
    setEditingId(null);
    setCustomerForm({ first_name: "", last_name: "", email: "", phone: "", billing_address: "", city: "", state: "", postal_code: "", country: "Philippines" });
  };

  const handleCloseAddBooking = () => {
    setShowAddBooking(false);
    setIsEditing(false);
    setEditingId(null);
    setBookingForm({
      customer_id: "", vehicle_id: "", start_date: "", end_date: "", notes: "",
      pickup_location_id: "1", return_location_id: "1",
      addon_gps: false, addon_wifi: false, addon_driver: false
    });
  };

  const handleCloseEditInvoice = () => {
    setShowEditInvoice(false);
    setEditingId(null);
    setInvoiceForm({ amount: "", due_date: "", notes: "" });
  };

  // Edit Prefill helpers
  const handleEditVehicle = (v) => {
    setVehicleForm({
      make: v.make || "",
      model: v.model || "",
      year: v.year || new Date().getFullYear(),
      plate_number: v.plate_number || "",
      color: v.color || "",
      type: v.type || "car",
      status: v.status || "available",
      daily_rate: v.daily_rate || "",
      current_odometer: v.current_odometer || "",
      fuel_tank_capacity_liters: v.fuel_tank_capacity_liters || "50",
      insurance_policy_number: v.insurance_policy_number || "",
      insurance_expiry_date: v.insurance_expiry_date || ""
    });
    setIsEditing(true);
    setEditingId(v.id);
    setShowAddVehicle(true);
  };

  const handleEditCustomer = (c) => {
    setCustomerForm({
      first_name: c.first_name || "",
      last_name: c.last_name || "",
      email: c.email || "",
      phone: c.phone || "",
      billing_address: c.billing_address || "",
      city: c.city || "",
      state: c.state || "",
      postal_code: c.postal_code || "",
      country: c.country || "Philippines"
    });
    setIsEditing(true);
    setEditingId(c.id);
    setShowAddCustomer(true);
  };

  const handleEditBooking = (b) => {
    // Determine which addons are checked
    const hasGPS = b.booking_addons?.some(a => a.addon_type === 'GPS_PREMIUM') || false;
    const hasWiFi = b.booking_addons?.some(a => a.addon_type === 'WIFI_ROUTER') || false;
    const hasDriver = b.booking_addons?.some(a => a.addon_type === 'PERSONAL_DRIVER') || false;

    setBookingForm({
      customer_id: b.customer_id || "",
      vehicle_id: b.vehicle_id || "",
      start_date: b.start_date ? b.start_date.substring(0, 10) : "",
      end_date: b.end_date ? b.end_date.substring(0, 10) : "",
      notes: b.notes || "",
      pickup_location_id: String(b.pickup_location_id || "1"),
      return_location_id: String(b.return_location_id || "1"),
      addon_gps: hasGPS,
      addon_wifi: hasWiFi,
      addon_driver: hasDriver
    });
    setIsEditing(true);
    setEditingId(b.id);
    setShowAddBooking(true);
  };

  const handleEditInvoice = (inv) => {
    setInvoiceForm({
      amount: inv.amount || inv.total_amount || "",
      due_date: inv.due_date ? inv.due_date.substring(0, 10) : "",
      notes: inv.notes || ""
    });
    setEditingId(inv.id);
    setShowEditInvoice(true);
  };

  // Fleet Actions
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await FleetService.updateVehicle(editingId, vehicleForm);
        toast.success('Vehicle updated successfully!');
      } else {
        await FleetService.createVehicle(vehicleForm);
        toast.success('Vehicle added successfully!');
      }
      handleCloseAddVehicle();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} vehicle.`);
    }
  };

  const handleUpdateVehicleStatus = async (id, status) => {
    try {
      await FleetService.updateStatus(id, status);
      toast.success('Vehicle status updated.');
      fetchData();
    } catch {
      toast.error("Failed to update vehicle status.");
    }
  };

  // CRM Actions
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await CrmService.updateCustomer(editingId, customerForm);
        toast.success('Customer updated successfully!');
      } else {
        await CrmService.createCustomer(customerForm);
        toast.success('Customer registered successfully!');
      }
      handleCloseAddCustomer();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'register'} customer.`);
    }
  };

  const handleAddLicense = async (e) => {
    e.preventDefault();
    try {
      const res = await CrmService.createLicense(licenseForm);
      if (res.data && res.data.id) {
        await CrmService.verifyLicense(res.data.id);
      }
      setShowAddLicense(false);
      setLicenseForm({ customer_id: "", license_number: "", expiry_date: "", issuing_authority: "", license_class: "B" });
      toast.success("Driver's license saved and verified!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to save driver's license.");
    }
  };

  const handleVerifyCustomer = async (id) => {
    setVerificationResult(null);
    try {
      const res = await CrmService.verifyCustomer(id);
      setVerificationResult({ customerId: id, ...res.data });
    } catch (err) {
      setVerificationResult({
        customerId: id,
        eligible: false,
        reason: err.response?.data?.message || "Failed to connect to verification backend."
      });
    }
  };

  const handleVerifyLicense = async (id) => {
    try {
      await CrmService.verifyLicense(id);
      toast.success('License marked as verified!');
      fetchData();
    } catch {
      toast.error("Failed to verify license.");
    }
  };

  // Booking Actions
  const handleAddBooking = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await BookingService.updateBooking(editingId, bookingForm);
        toast.success('Booking updated successfully!');
      } else {
        await BookingService.createBooking(bookingForm);
        toast.success('Booking created successfully!');
      }
      handleCloseAddBooking();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} booking.`);
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await BookingService.updateBooking(id, { status });
      toast.success('Booking status updated.');
      fetchData();
    } catch {
      toast.error("Failed to update booking status.");
    }
  };

  // Billing Actions
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        invoice_id: paymentForm.invoice_id,
        amount: parseFloat(paymentForm.amount_paid),
        method: paymentForm.payment_method,
      };
      await BillingService.recordPayment(payload);
      setShowRecordPayment(false);
      setPaymentForm({ invoice_id: "", amount_paid: "", payment_method: "cash" });
      toast.success('Payment recorded successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to record payment.");
    }
  };

  const handleUpdateInvoice = async (e) => {
    e.preventDefault();
    try {
      await BillingService.updateInvoice(editingId, invoiceForm);
      toast.success('Invoice updated successfully!');
      handleCloseEditInvoice();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to update invoice.");
    }
  };

  const handleDeleteVehicle = async (id) => {
    openConfirm({
      title: 'Delete Vehicle',
      message: 'Are you sure you want to permanently delete this vehicle from inventory? This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await FleetService.deleteVehicle(id);
          toast.success('Vehicle deleted successfully!');
          fetchData();
        } catch (err) {
          toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to delete vehicle.');
        }
        closeConfirm();
      }
    });
  };

  const handleDeleteCustomer = async (id) => {
    openConfirm({
      title: 'Delete Customer Record',
      message: 'Are you sure you want to permanently delete this customer? All associated data will be removed. This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await CrmService.deleteCustomer(id);
          toast.success('Customer deleted successfully!');
          fetchData();
        } catch (err) {
          toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to delete customer.');
        }
        closeConfirm();
      }
    });
  };

  const handleDeleteBooking = async (id) => {
    openConfirm({
      title: 'Delete Booking Record',
      message: 'Are you sure you want to permanently delete this booking record? This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await BookingService.cancelBooking(id);
          toast.success('Booking record deleted successfully!');
          fetchData();
        } catch (err) {
          toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to delete booking record.');
        }
        closeConfirm();
      }
    });
  };

  const handleVoidInvoice = async (id) => {
    openConfirm({
      title: 'Void Invoice',
      message: 'Are you sure you want to void this invoice? This will mark the invoice as voided/inactive.',
      variant: 'danger',
      confirmLabel: 'Void',
      onConfirm: async () => {
        try {
          await BillingService.voidInvoice(id);
          toast.success('Invoice voided successfully!');
          fetchData();
        } catch (err) {
          toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to void invoice.');
        }
        closeConfirm();
      }
    });
  };

  // Fetch initial profile
  useEffect(() => {
    AuthService.me()
      .then((res) => setCurrentUser(res.data))
      .catch(() => handleLogout());
  }, []);

  // Fetch data depending on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const getActiveRole = () => {
    return (simulatedRole || currentUser?.role?.name || 'staff').toLowerCase();
  };

  const isTabVisible = (tab) => {
    const role = getActiveRole();
    if (role === 'admin' || role === 'administrator') return true;
    if (tab === 'overview') return true;
    if (role === 'accountant') {
      return tab === 'billing';
    }
    if (role === 'mechanic' || role === 'maintenance' || role === 'maintenance engineer') {
      return tab === 'fleet';
    }
    if (role === 'dispatcher') {
      return tab === 'fleet' || tab === 'crm' || tab === 'bookings';
    }
    return true;
  };

  const getHubName = (id) => {
    switch (String(id)) {
      case '1': return 'Manila Hub';
      case '2': return 'NAIA Airport T3 Hub';
      case '3': return 'Cebu Hub';
      case '4': return 'Davao Hub';
      case '5': return 'Bacolod Hub';
      default: return `Hub #${id}`;
    }
  };

  // Redirect to overview if active tab is restricted on role switch
  useEffect(() => {
    if (!isTabVisible(activeTab)) {
      setActiveTab("overview");
    }
  }, [simulatedRole, currentUser]);

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          <img 
            src="/logo.png" 
            alt="SwiftRide Logo" 
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              objectFit: 'contain',
              background: 'transparent'
            }} 
          />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
            SwiftRide ERP
          </h2>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-list">
            {isTabVisible("overview") && (
              <li>
                <a href="#" className={`nav-link ${activeTab === "overview" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("overview"); setIsSidebarOpen(false); }}>
                  <Home size={18} />
                  Overview
                </a>
              </li>
            )}
            {isTabVisible("fleet") && (
              <li>
                <a href="#" className={`nav-link ${activeTab === "fleet" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("fleet"); setIsSidebarOpen(false); }}>
                  <Truck size={18} />
                  Fleet Manager
                </a>
              </li>
            )}
            {isTabVisible("crm") && (
              <li>
                <a href="#" className={`nav-link ${activeTab === "crm" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("crm"); setIsSidebarOpen(false); }}>
                  <Users size={18} />
                  Customer Directory
                </a>
              </li>
            )}
            {isTabVisible("bookings") && (
              <li>
                <a href="#" className={`nav-link ${activeTab === "bookings" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("bookings"); setIsSidebarOpen(false); }}>
                  <Calendar size={18} />
                  Bookings
                </a>
              </li>
            )}
            {isTabVisible("billing") && (
              <li>
                <a href="#" className={`nav-link ${activeTab === "billing" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("billing"); setIsSidebarOpen(false); }}>
                  <CreditCard size={18} />
                  Billing & Accounts
                </a>
              </li>
            )}
          </ul>
        </nav>
      </aside>

      {/* Main View Area */}
      <main className="main-content" style={{ position: "relative" }}>
        {/* Global Dashboard Header */}
        <header className="global-header" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "1.25rem",
          borderBottom: "1px solid var(--border-color)",
          marginBottom: "2rem",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem" }}>
            <button 
              className="menu-btn" 
              onClick={() => setIsSidebarOpen(true)}
              style={{
                background: "transparent",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
                borderRadius: "8px",
                padding: "0.5rem",
                cursor: "pointer",
                display: "none" // Displayed via CSS on mobile
              }}
            >
              <Menu size={20} />
            </button>
            <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
              SwiftRide Operations
            </span>
            <span style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--text-primary)" }}>
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "fleet" && "Fleet Manager"}
              {activeTab === "crm" && "Customer Directory"}
              {activeTab === "bookings" && "Rental Bookings"}
              {activeTab === "billing" && "Billing & Accounts"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            {/* Elegant Header Loading Indicator */}
            {loading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '20px',
                background: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                animation: 'pulse 2s infinite ease-in-out'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  animation: 'spin 1s infinite linear'
                }} />
                Updating...
              </div>
            )}

            {/* Dark/Light mode switch */}
            <button 
              type="button"
              onClick={toggleTheme} 
              className="theme-switch-track"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {/* Sun Icon */}
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ 
                  color: theme === 'light' ? '#ffffff' : 'var(--text-muted)',
                  zIndex: 2,
                  marginLeft: '2px',
                  transition: 'color 0.3s ease'
                }}
              >
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>

              {/* Moon Icon */}
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ 
                  color: theme === 'dark' ? '#ffffff' : 'var(--text-muted)',
                  zIndex: 2,
                  marginRight: '2px',
                  transition: 'color 0.3s ease'
                }}
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>

              <span className="theme-switch-thumb" />
            </button>


            {/* User Profile Card */}
            {currentUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.25rem', borderLeft: '1px solid var(--border-color)' }}>
                <div className="user-avatar" style={{ margin: 0 }}>
                  {currentUser.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1.2 }}>{currentUser.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'capitalize', lineHeight: 1.2 }}>
                    {simulatedRole ? `Sim: ${simulatedRole}` : (currentUser.role?.name || 'staff')}
                  </div>
                </div>
              </div>
            )}

            {/* Premium Sign Out Icon Button */}
            <button 
              type="button"
              onClick={handleLogoutClick}
              title="Sign Out"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--danger)';
                e.currentTarget.style.borderColor = 'var(--danger)';
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Overview View */}
        {activeTab === "overview" && (
          <div className="animate-fade" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="page-header">
              <div className="page-header-text">
                <h1>Overview</h1>
                <p>System-wide performance metrics and status.</p>
              </div>
            </div>

            <div className="stat-grid">
              <div className="card stat-card stagger-1">
                <div className="stat-icon"><Car size={20} /></div>
                <span className="label">Total Fleet Size</span>
                <span className="value">{stats.vehicles}</span>
              </div>
              <div className="card stat-card stagger-2">
                <div className="stat-icon"><Calendar size={20} /></div>
                <span className="label">Active Bookings</span>
                <span className="value">{stats.bookings}</span>
              </div>
              <div className="card stat-card stagger-3">
                <div className="stat-icon"><Users size={20} /></div>
                <span className="label">Total Customers</span>
                <span className="value">{stats.customers}</span>
              </div>
              <div className="card stat-card stagger-4">
                <div className="stat-icon"><DollarSign size={20} /></div>
                <span className="label">Total Revenue Paid</span>
                <span className="value">₱{stats.revenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>Quick Actions</h2>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <button onClick={() => setShowAddBooking(true)} className="btn-primary"><Plus size={16} /> New Booking</button>
                <button onClick={() => setShowAddCustomer(true)} className="btn-secondary"><Plus size={16} /> Register Customer</button>
                <button onClick={() => setShowAddVehicle(true)} className="btn-secondary"><Plus size={16} /> Add Vehicle</button>
              </div>
            </div>

            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>Recent Bookings</h2>
              {bookings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><Calendar size={28} /></div>
                  <div className="empty-state-title">No bookings yet</div>
                  <div className="empty-state-desc">Create your first booking to start tracking rentals.</div>
                  <button onClick={() => setShowAddBooking(true)} className="btn-primary" style={{ marginTop: '0.5rem' }}>
                    <Plus size={16} /> Create Your First Booking
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Vehicle</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Cost</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id}>
                          <td>#{b.id}</td>
                          <td>{getCustomerName(b.customer_id)}</td>
                          <td>{getVehicleName(b.vehicle_id)}</td>
                          <td>{formatManilaDateTime(b.start_date)}</td>
                          <td>{formatManilaDateTime(b.end_date)}</td>
                          <td>₱{parseFloat(b.total_cost || 0).toLocaleString()}</td>
                          <td>
                            <span className={`badge ${
                              b.status === "completed" ? "badge-success" : 
                              b.status === "confirmed" ? "badge-info" :
                              b.status === "active" ? "badge-warning" :
                              b.status === "cancelled" ? "badge-danger" : "badge-secondary"
                            }`}>{b.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fleet View */}
        {activeTab === "fleet" && (
          <div className="animate-fade" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="page-header">
              <div className="page-header-text">
                <h1>Fleet Management</h1>
                <p>Track and update your vehicle fleet.</p>
              </div>
              <div className="page-header-actions">
                <button onClick={() => setShowAddVehicle(true)} className="btn-primary"><Plus size={16} /> Add Vehicle</button>
              </div>
            </div>

            <div className="card">
              {vehicles.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><Truck size={28} /></div>
                  <div className="empty-state-title">No vehicles in inventory</div>
                  <div className="empty-state-desc">Add your first vehicle to start managing your fleet.</div>
                  <button onClick={() => setShowAddVehicle(true)} className="btn-primary" style={{ marginTop: '0.5rem' }}>
                    <Plus size={16} /> Add Your First Vehicle
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Make & Model</th>
                        <th>Year</th>
                        <th>Plate No.</th>
                        <th>Color</th>
                        <th>Type</th>
                        <th>Odometer</th>
                        <th>Fuel Cap.</th>
                        <th>Insurance</th>
                        <th>Daily Rate</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((v) => (
                        <tr key={v.id}>
                          <td style={{ fontWeight: "bold" }}>
                            <div>{v.make} {v.model}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "normal" }}>{formatVehicleId(v.id)}</div>
                          </td>
                          <td>{v.year}</td>
                          <td><code>{v.plate_number}</code></td>
                          <td>{v.color || "—"}</td>
                          <td>{v.type}</td>
                          <td>{v.current_odometer ? `${parseInt(v.current_odometer).toLocaleString()} KM` : "—"}</td>
                          <td>{v.fuel_tank_capacity_liters ? `${v.fuel_tank_capacity_liters} L` : "—"}</td>
                          <td>
                            {v.insurance_policy_number ? (
                              <div style={{ fontSize: "0.8rem" }}>
                                <div><code>{v.insurance_policy_number}</code></div>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                  Exp: {formatManilaDate(v.insurance_expiry_date)}
                                </div>
                              </div>
                            ) : "—"}
                          </td>
                          <td>₱{parseFloat(v.daily_rate || 0).toLocaleString()}</td>
                          <td>
                            <span className={`badge ${
                              v.status === "available" ? "badge-success" :
                              v.status === "maintenance" ? "badge-warning" : "badge-danger"
                            }`}>{v.status}</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="actions-dropdown-wrapper">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setActiveActionsMenu(prev => 
                                    prev.type === 'fleet' && prev.id === v.id 
                                      ? { type: null, id: null, rect: null, data: null } 
                                      : { type: 'fleet', id: v.id, rect, data: v }
                                  );
                                }} 
                                className="btn-actions-toggle"
                                title="Actions"
                              >
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CRM View */}
        {activeTab === "crm" && (
          <div className="animate-fade" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="page-header">
              <div className="page-header-text">
                <h1>Customer Directory</h1>
                <p>Manage client profiles, records, and licenses.</p>
              </div>
              <div className="page-header-actions">
                <button onClick={() => setShowAddLicense(true)} className="btn-secondary"><FileText size={16} /> Record License</button>
                <button onClick={() => setShowAddCustomer(true)} className="btn-primary"><Plus size={16} /> Register Customer</button>
              </div>
            </div>

            <div className="card">
              {customers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><Users size={28} /></div>
                  <div className="empty-state-title">No customer records found</div>
                  <div className="empty-state-desc">Register your first customer to start building your directory.</div>
                  <button onClick={() => setShowAddCustomer(true)} className="btn-primary" style={{ marginTop: '0.5rem' }}>
                    <Plus size={16} /> Register Your First Customer
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Loyalty Program</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c.id}>
                          <td>{formatCustomerId(c.id)}</td>
                          <td style={{ fontWeight: "bold" }}>{c.first_name} {c.last_name}</td>
                          <td>{c.email}</td>
                          <td>{c.phone || "—"}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span className={`badge ${
                                c.loyalty_tier === 'gold' ? 'badge-warning' : 
                                c.loyalty_tier === 'silver' ? 'badge-info' : 'badge-secondary'
                              }`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                {c.loyalty_tier || 'bronze'}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {c.loyalty_points || 0} pts
                              </span>
                            </div>
                          </td>
                          <td>{c.city ? `${c.city}, ${c.country}` : "—"}</td>
                          <td>
                            <span className={`badge ${
                              c.status === "active" ? "badge-success" : "badge-danger"
                            }`}>{c.status}</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="actions-dropdown-wrapper">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setActiveActionsMenu(prev => 
                                    prev.type === 'crm' && prev.id === c.id 
                                      ? { type: null, id: null, rect: null, data: null } 
                                      : { type: 'crm', id: c.id, rect, data: c }
                                  );
                                }} 
                                className="btn-actions-toggle"
                                title="Actions"
                              >
                                <MoreVertical size={16} />
                              </button>
                            </div>
                            {verificationResult?.customerId === c.id && (
                              <div style={{ 
                                marginTop: "0.5rem", 
                                padding: "0.5rem", 
                                borderRadius: 8, 
                                background: verificationResult.eligible ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                border: verificationResult.eligible ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)",
                                fontSize: "0.75rem",
                                color: verificationResult.eligible ? "var(--success)" : "var(--danger)",
                                textAlign: "left"
                              }}>
                                {verificationResult.eligible ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <div>✔ Eligible. Valid License ID: #{verificationResult.license_id}</div>
                                    {!c.government_id_verified && (
                                      <button onClick={() => handleVerifyLicense(verificationResult.license_id)} className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', width: 'fit-content', marginTop: '0.25rem' }}>
                                        <Shield size={12} /> Mark License Verified
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div>✘ Ineligible: {verificationResult.reason}</div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings View */}
        {activeTab === "bookings" && (
          <div className="animate-fade" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="page-header">
              <div className="page-header-text">
                <h1>Rental Bookings</h1>
                <p>Track customer reservations and manage renting cycles.</p>
              </div>
              <div className="page-header-actions">
                <button onClick={() => setShowAddBooking(true)} className="btn-primary"><Plus size={16} /> New Booking</button>
              </div>
            </div>

            <div className="card">
              {bookings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><Calendar size={28} /></div>
                  <div className="empty-state-title">No bookings registered</div>
                  <div className="empty-state-desc">Create your first booking to start managing rentals.</div>
                  <button onClick={() => setShowAddBooking(true)} className="btn-primary" style={{ marginTop: '0.5rem' }}>
                    <Plus size={16} /> Create Your First Booking
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Vehicle</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Route (Hubs)</th>
                        <th>Deposit</th>
                        <th>Total Cost</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id}>
                          <td>#{b.id}</td>
                          <td>{getCustomerName(b.customer_id)}</td>
                          <td>{getVehicleName(b.vehicle_id)}</td>
                          <td>{formatManilaDateTime(b.start_date)}</td>
                          <td>{formatManilaDateTime(b.end_date)}</td>
                          <td>
                            <div style={{ fontSize: '0.8rem' }}>
                              <div><span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>→</span> {getHubName(b.pickup_location_id || 1)}</div>
                              <div><span style={{ color: 'var(--success)', fontWeight: 'bold' }}>←</span> {getHubName(b.return_location_id || 1)}</div>
                            </div>
                          </td>
                          <td>
                            {b.security_deposit_amount ? (
                              <div style={{ fontSize: '0.8rem' }}>
                                <div>₱{parseFloat(b.security_deposit_amount).toLocaleString()}</div>
                                <span className={`badge ${
                                  b.security_deposit_status === 'refunded' ? 'badge-success' :
                                  b.security_deposit_status === 'held' ? 'badge-warning' : 'badge-danger'
                                }`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem' }}>
                                  {b.security_deposit_status || 'held'}
                                </span>
                              </div>
                            ) : "—"}
                          </td>
                          <td style={{ fontWeight: "bold" }}>
                            <div>₱{parseFloat(b.total_cost || 0).toLocaleString()}</div>
                            {b.booking_addons && b.booking_addons.length > 0 && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                                + {b.booking_addons.length} Add-on(s)
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${
                              b.status === "completed" ? "badge-success" : 
                              b.status === "confirmed" ? "badge-info" :
                              b.status === "active" ? "badge-warning" :
                              b.status === "cancelled" ? "badge-danger" : "badge-secondary"
                            }`}>{b.status}</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="actions-dropdown-wrapper">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setActiveActionsMenu(prev => 
                                    prev.type === 'bookings' && prev.id === b.id 
                                      ? { type: null, id: null, rect: null, data: null } 
                                      : { type: 'bookings', id: b.id, rect, data: b }
                                  );
                                }} 
                                className="btn-actions-toggle"
                                title="Actions"
                              >
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Billing View */}
        {activeTab === "billing" && (
          <div className="animate-fade" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="page-header">
              <div className="page-header-text">
                <h1>Billing & Invoices</h1>
                <p>Track customer payments, invoices, and payment cycles.</p>
              </div>
              <div className="page-header-actions">
                <button onClick={() => setShowRecordPayment(true)} className="btn-primary"><DollarSign size={16} /> Record Payment</button>
              </div>
            </div>

            <div className="card">
              {invoices.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><CreditCard size={28} /></div>
                  <div className="empty-state-title">No generated invoices</div>
                  <div className="empty-state-desc">Invoices will appear here once bookings are completed.</div>
                </div>
              ) : (
                <div className="table-container">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Invoice ID</th>
                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Notes</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td>{formatInvoiceId(inv.id)}</td>
                          <td>Booking #{inv.booking_id}</td>
                          <td>{getCustomerName(inv.customer_id)}</td>
                          <td style={{ fontWeight: "bold" }}>₱{parseFloat(inv.amount || inv.total_amount || 0).toLocaleString()}</td>
                          <td>{formatManilaDateTime(inv.due_date)}</td>
                          <td>
                            <span className={`badge ${
                              inv.status === "Paid" || inv.status === "paid" ? "badge-success" : "badge-danger"
                            }`}>{inv.status}</span>
                          </td>
                          <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                            {inv.notes || "—"}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="actions-dropdown-wrapper">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setActiveActionsMenu(prev => 
                                    prev.type === 'billing' && prev.id === inv.id 
                                      ? { type: null, id: null, rect: null, data: null } 
                                      : { type: 'billing', id: inv.id, rect, data: inv }
                                  );
                                }} 
                                className="btn-actions-toggle"
                                title="Actions"
                              >
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div className="modal-overlay" onClick={handleCloseAddVehicle}>
          <div className="card modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon"><Truck size={20} /></div>
              <h2>{isEditing ? "Edit Vehicle Details" : "Add New Vehicle"}</h2>
            </div>
            <form onSubmit={handleAddVehicle}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1rem" }}>
                <div className="form-group">
                  <label>Make</label>
                  <SearchableDropdown
                    required
                    value={vehicleForm.make}
                    onChange={(val) => setVehicleForm({...vehicleForm, make: val})}
                    options={POPULAR_MAKES}
                    placeholder="Toyota"
                    allowCustom={true}
                  />
                </div>
                <div className="form-group">
                  <label>Model</label>
                  <SearchableDropdown
                    required
                    value={vehicleForm.model}
                    onChange={(val) => setVehicleForm({...vehicleForm, model: val})}
                    options={POPULAR_MODELS}
                    placeholder="Vios"
                    allowCustom={true}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1rem" }}>
                <div className="form-group">
                  <label>Year</label>
                  <input required type="number" className="input-control" value={vehicleForm.year} onChange={(e) => setVehicleForm({...vehicleForm, year: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Plate Number</label>
                  <input required className="input-control" value={vehicleForm.plate_number} onChange={(e) => setVehicleForm({...vehicleForm, plate_number: e.target.value})} placeholder="ABC-1234" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1rem" }}>
                <div className="form-group">
                  <label>Type</label>
                  <select className="input-control" value={vehicleForm.type} onChange={(e) => setVehicleForm({...vehicleForm, type: e.target.value})}>
                    <option value="car">Car</option>
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Daily Rate (PHP)</label>
                  <input required type="number" step="0.01" className="input-control" value={vehicleForm.daily_rate} onChange={(e) => setVehicleForm({...vehicleForm, daily_rate: e.target.value})} placeholder="1500" />
                </div>
              </div>
              <div className="form-group">
                <label>Color</label>
                <SearchableDropdown
                  value={vehicleForm.color}
                  onChange={(val) => setVehicleForm({...vehicleForm, color: val})}
                  options={POPULAR_COLORS}
                  placeholder="Silver"
                  allowCustom={true}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1rem" }}>
                <div className="form-group">
                  <label>Current Odometer (KM)</label>
                  <input type="number" className="input-control" value={vehicleForm.current_odometer} onChange={(e) => setVehicleForm({...vehicleForm, current_odometer: e.target.value})} placeholder="10000" />
                </div>
                <div className="form-group">
                  <label>Fuel Tank Capacity (Liters)</label>
                  <input type="number" step="0.1" className="input-control" value={vehicleForm.fuel_tank_capacity_liters} onChange={(e) => setVehicleForm({...vehicleForm, fuel_tank_capacity_liters: e.target.value})} placeholder="50" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1rem" }}>
                <div className="form-group">
                  <label>Insurance Policy Number</label>
                  <input className="input-control" value={vehicleForm.insurance_policy_number} onChange={(e) => setVehicleForm({...vehicleForm, insurance_policy_number: e.target.value})} placeholder="POL-12345" />
                </div>
                <div className="form-group">
                  <label>Insurance Expiry Date</label>
                  <input type="date" className="input-control" value={vehicleForm.insurance_expiry_date ? vehicleForm.insurance_expiry_date.substring(0, 10) : ""} onChange={(e) => setVehicleForm({...vehicleForm, insurance_expiry_date: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleCloseAddVehicle} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  {isEditing ? <Check size={16} /> : <Plus size={16} />} 
                  {isEditing ? "Save Changes" : "Add Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="modal-overlay" onClick={handleCloseAddCustomer}>
          <div className="card modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon"><Users size={20} /></div>
              <h2>{isEditing ? "Edit Customer Details" : "Register Customer"}</h2>
            </div>
            <form onSubmit={handleAddCustomer}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1rem" }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input required className="input-control" value={customerForm.first_name} onChange={(e) => setCustomerForm({...customerForm, first_name: e.target.value})} placeholder="JUAN" />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input required className="input-control" value={customerForm.last_name} onChange={(e) => setCustomerForm({...customerForm, last_name: e.target.value})} placeholder="DELA CRUZ" />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input required type="email" className="input-control" value={customerForm.email} onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})} placeholder="JUAN@GMAIL.COM" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input className="input-control" value={customerForm.phone} onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})} placeholder="09171234567" />
              </div>
              <div className="form-group">
                <label>Billing Address</label>
                <input className="input-control" value={customerForm.billing_address} onChange={(e) => setCustomerForm({...customerForm, billing_address: e.target.value})} placeholder="123 RIZAL ST" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>City</label>
                  <input className="input-control" value={customerForm.city} onChange={(e) => setCustomerForm({...customerForm, city: e.target.value})} placeholder="Bacolod City" />
                </div>
                <div className="form-group">
                  <label>State / Province</label>
                  <input className="input-control" value={customerForm.state} onChange={(e) => setCustomerForm({...customerForm, state: e.target.value})} placeholder="Negros Occidental" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input className="input-control" value={customerForm.postal_code} onChange={(e) => setCustomerForm({...customerForm, postal_code: e.target.value})} placeholder="6100" />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input className="input-control" value={customerForm.country} onChange={(e) => setCustomerForm({...customerForm, country: e.target.value})} placeholder="Philippines" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleCloseAddCustomer} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  {isEditing ? <Check size={16} /> : <Plus size={16} />} 
                  {isEditing ? "Save Changes" : "Register Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add License Modal */}
      {showAddLicense && (
        <div className="modal-overlay" onClick={() => setShowAddLicense(false)}>
          <div className="card modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon"><FileText size={20} /></div>
              <h2>Record Driver's License</h2>
            </div>
            <form onSubmit={handleAddLicense}>
              <div className="form-group">
                <label>Customer</label>
                <select required className="input-control" value={licenseForm.customer_id} onChange={(e) => {
                  const val = e.target.value;
                  setLicenseForm({...licenseForm, customer_id: val ? parseInt(val) : ""});
                }}>
                  <option value="">Select a customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} ({formatCustomerId(c.id)}) ({c.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>License Number</label>
                <input required className="input-control" value={licenseForm.license_number} onChange={(e) => setLicenseForm({...licenseForm, license_number: e.target.value})} placeholder="N01-23-456789" />
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input required type="date" className="input-control" value={licenseForm.expiry_date} onChange={(e) => setLicenseForm({...licenseForm, expiry_date: e.target.value})} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1rem" }}>
                <div className="form-group">
                  <label>Issuing Authority</label>
                  <input className="input-control" value={licenseForm.issuing_authority} onChange={(e) => setLicenseForm({...licenseForm, issuing_authority: e.target.value})} placeholder="LTO" />
                </div>
                <div className="form-group">
                  <label>License Class</label>
                  <input className="input-control" value={licenseForm.license_class} onChange={(e) => setLicenseForm({...licenseForm, license_class: e.target.value})} placeholder="B" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddLicense(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary"><Shield size={16} /> Save & Verify License</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddBooking && (
        <div className="modal-overlay" onClick={handleCloseAddBooking}>
          <div className="card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <div className="modal-header-icon"><Calendar size={20} /></div>
              <h2>{isEditing ? "Edit Booking Details" : "Create Booking"}</h2>
            </div>
            <form onSubmit={handleAddBooking}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1rem" }}>
                <div className="form-group">
                  <label>Customer</label>
                  <SearchableDropdown
                    required
                    value={bookingForm.customer_id}
                    onChange={(val) => setBookingForm({...bookingForm, customer_id: val ? parseInt(val) : ""})}
                    options={customers.map(c => ({
                      value: c.id,
                      label: `${c.first_name} ${c.last_name} (${formatCustomerId(c.id)})`,
                      searchTerms: `${c.first_name} ${c.last_name} ${c.email} ${formatCustomerId(c.id)}`
                    }))}
                    placeholder="Search Customer..."
                    allowCustom={false}
                  />
                </div>
                <div className="form-group">
                  <label>Vehicle</label>
                  <SearchableDropdown
                    required
                    value={bookingForm.vehicle_id}
                    onChange={(val) => setBookingForm({...bookingForm, vehicle_id: val ? parseInt(val) : ""})}
                    options={vehicles.map(v => ({
                      value: v.id,
                      label: `${v.make} ${v.model} (${v.plate_number}) (${formatVehicleId(v.id)})`,
                      searchTerms: `${v.make} ${v.model} ${v.plate_number} ${formatVehicleId(v.id)}`
                    }))}
                    placeholder="Search Vehicle..."
                    allowCustom={false}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1rem" }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input required type="date" className="input-control" value={bookingForm.start_date} onChange={(e) => setBookingForm({...bookingForm, start_date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input required type="date" className="input-control" value={bookingForm.end_date} onChange={(e) => setBookingForm({...bookingForm, end_date: e.target.value})} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1rem" }}>
                <div className="form-group">
                  <label>Pickup Location Hub</label>
                  <select className="input-control" value={bookingForm.pickup_location_id} onChange={(e) => setBookingForm({...bookingForm, pickup_location_id: e.target.value})}>
                    <option value="1">Manila Hub</option>
                    <option value="2">NAIA Airport T3 Hub</option>
                    <option value="3">Cebu Hub</option>
                    <option value="4">Davao Hub</option>
                    <option value="5">Bacolod Hub</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Return Location Hub</label>
                  <select className="input-control" value={bookingForm.return_location_id} onChange={(e) => setBookingForm({...bookingForm, return_location_id: e.target.value})}>
                    <option value="1">Manila Hub</option>
                    <option value="2">NAIA Airport T3 Hub</option>
                    <option value="3">Cebu Hub</option>
                    <option value="4">Davao Hub</option>
                    <option value="5">Bacolod Hub</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label style={{ marginBottom: "0.5rem", display: "block" }}>Add-on Services (Upsells)</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", background: "var(--bg-card)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem" }}>
                    <input type="checkbox" checked={bookingForm.addon_gps} onChange={(e) => setBookingForm({...bookingForm, addon_gps: e.target.checked})} />
                    GPS Premium Tracker (₱250.00 / day)
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem" }}>
                    <input type="checkbox" checked={bookingForm.addon_wifi} onChange={(e) => setBookingForm({...bookingForm, addon_wifi: e.target.checked})} />
                    Portable Pocket Wi-Fi Dongle (₱150.00 / day)
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem" }}>
                    <input type="checkbox" checked={bookingForm.addon_driver} onChange={(e) => setBookingForm({...bookingForm, addon_driver: e.target.checked})} />
                    Personal Professional Driver (₱1,500.00 / day)
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="input-control" value={bookingForm.notes} onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})} placeholder="SPECIAL REQUESTS..." style={{ height: "80px", resize: "none" }} />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleCloseAddBooking} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  {isEditing ? <Check size={16} /> : <Plus size={16} />} 
                  {isEditing ? "Save Changes" : "Create Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordPayment && (
        <div className="modal-overlay" onClick={() => setShowRecordPayment(false)}>
          <div className="card modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon"><DollarSign size={20} /></div>
              <h2>Record Payment</h2>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="form-group">
                <label>Invoice</label>
                <select required className="input-control" value={paymentForm.invoice_id} onChange={(e) => {
                  const val = e.target.value;
                  setPaymentForm({...paymentForm, invoice_id: val ? parseInt(val) : ""});
                }}>
                  <option value="">Select an invoice</option>
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {formatInvoiceId(inv.id)} - ₱{parseFloat(inv.amount || inv.total_amount || 0).toLocaleString()} ({inv.status})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Amount Paid (PHP)</label>
                <input required type="number" step="0.01" className="input-control" value={paymentForm.amount_paid} onChange={(e) => setPaymentForm({...paymentForm, amount_paid: e.target.value})} placeholder="3000" />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select className="input-control" value={paymentForm.payment_method} onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowRecordPayment(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary"><DollarSign size={16} /> Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {showEditInvoice && (
        <div className="modal-overlay" onClick={handleCloseEditInvoice}>
          <div className="card modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon"><CreditCard size={20} /></div>
              <h2>Edit Invoice Details</h2>
            </div>
            <form onSubmit={handleUpdateInvoice}>
              <div className="form-group">
                <label>Amount (PHP)</label>
                <input required type="number" step="0.01" className="input-control" value={invoiceForm.amount} onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})} placeholder="3000" />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input required type="date" className="input-control" value={invoiceForm.due_date} onChange={(e) => setInvoiceForm({...invoiceForm, due_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="input-control" value={invoiceForm.notes} onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})} placeholder="INVOICE NOTES..." style={{ height: "80px", resize: "none" }} />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleCloseEditInvoice} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary"><Check size={16} /> Update Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Actions Dropdown Menu */}
      {activeActionsMenu.type && activeActionsMenu.rect && (
        <div 
          className="actions-dropdown-menu actions-dropdown-menu-portal"
          style={{
            position: 'fixed',
            top: `${activeActionsMenu.rect.bottom + 8}px`,
            right: `${window.innerWidth - activeActionsMenu.rect.right}px`,
            zIndex: 99999,
            margin: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {activeActionsMenu.type === 'fleet' && (
            <>
              {(getActiveRole() === 'admin' || getActiveRole() === 'dispatcher') && (
                <button 
                  onClick={() => {
                    handleEditVehicle(activeActionsMenu.data);
                    setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                  }} 
                  className="actions-dropdown-item"
                >
                  <Edit size={14} /> Edit Vehicle
                </button>
              )}
              <button 
                onClick={() => {
                  setSelectedVehicleForInspections(activeActionsMenu.data);
                  setShowInspectionsModal(true);
                  setLoadingInspections(true);
                  FleetService.listInspections(activeActionsMenu.data.id)
                    .then(res => setInspectionsList(res.data?.data || []))
                    .catch(() => toast.error("Failed to load inspections."))
                    .finally(() => setLoadingInspections(false));
                  setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                }} 
                className="actions-dropdown-item"
              >
                <FileText size={14} /> Inspections Log
              </button>
              {activeActionsMenu.data.status !== "available" && (
                <button 
                  onClick={() => {
                    openConfirm({
                      title: 'Make Vehicle Available',
                      message: 'Are you sure you want to mark this vehicle as available?',
                      confirmLabel: 'Make Available',
                      onConfirm: async () => {
                        await handleUpdateVehicleStatus(activeActionsMenu.data.id, 'available');
                        closeConfirm();
                      }
                    });
                    setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                  }} 
                  className="actions-dropdown-item"
                >
                  <Check size={14} /> Make Available
                </button>
              )}
              {activeActionsMenu.data.status !== "maintenance" && (
                <button 
                  onClick={() => {
                    openConfirm({
                      title: 'Send to Maintenance',
                      message: 'Are you sure you want to send this vehicle to maintenance?',
                      confirmLabel: 'Send to Maintenance',
                      onConfirm: async () => {
                        await handleUpdateVehicleStatus(activeActionsMenu.data.id, 'maintenance');
                        closeConfirm();
                      }
                    });
                    setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                  }} 
                  className="actions-dropdown-item"
                >
                  <Wrench size={14} /> Send to Maintenance
                </button>
              )}
              {getActiveRole() === 'admin' && (
                <>
                  <div className="actions-dropdown-divider" />
                  <button 
                    onClick={() => {
                      handleDeleteVehicle(activeActionsMenu.data.id);
                      setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                    }} 
                    className="actions-dropdown-item actions-dropdown-item-danger"
                  >
                    <Trash size={14} /> Delete Vehicle
                  </button>
                </>
              )}
            </>
          )}

          {activeActionsMenu.type === 'crm' && (
            <>
              {(getActiveRole() === 'admin' || getActiveRole() === 'dispatcher') && (
                <>
                  <button 
                    onClick={() => {
                      handleEditCustomer(activeActionsMenu.data);
                      setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                    }} 
                    className="actions-dropdown-item"
                  >
                    <Edit size={14} /> Edit Customer
                  </button>
                </>
              )}

              {getActiveRole() === 'admin' && (
                <>
                  <div className="actions-dropdown-divider" />
                  <button 
                    onClick={() => {
                      handleDeleteCustomer(activeActionsMenu.data.id);
                      setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                    }} 
                    className="actions-dropdown-item actions-dropdown-item-danger"
                  >
                    <Trash size={14} /> Delete Customer
                  </button>
                </>
              )}
            </>
          )}

          {activeActionsMenu.type === 'bookings' && (
            <>
              {(getActiveRole() === 'admin' || getActiveRole() === 'dispatcher') && (
                <>
                  <button 
                    onClick={() => {
                      handleEditBooking(activeActionsMenu.data);
                      setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                    }} 
                    className="actions-dropdown-item"
                  >
                    <Edit size={14} /> Edit Booking
                  </button>
                  {activeActionsMenu.data.status === "pending" && (
                    <button 
                      onClick={() => {
                        openConfirm({
                          title: 'Confirm Booking',
                          message: 'Confirm this rental booking?',
                          confirmLabel: 'Confirm',
                          onConfirm: async () => {
                            await handleUpdateBookingStatus(activeActionsMenu.data.id, 'confirmed');
                            closeConfirm();
                          }
                        });
                        setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                      }} 
                      className="actions-dropdown-item"
                    >
                      <Check size={14} /> Confirm Booking
                    </button>
                  )}
                  {activeActionsMenu.data.status === "confirmed" && (
                    <button 
                      onClick={() => {
                        openConfirm({
                          title: 'Activate Rental',
                          message: 'Mark this booking as active/rented?',
                          confirmLabel: 'Activate',
                          onConfirm: async () => {
                            await handleUpdateBookingStatus(activeActionsMenu.data.id, 'active');
                            closeConfirm();
                          }
                        });
                        setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                      }} 
                      className="actions-dropdown-item"
                    >
                      <Clock size={14} /> Activate Rental
                    </button>
                  )}
                  {activeActionsMenu.data.status === "active" && (
                    <button 
                      onClick={() => {
                        openConfirm({
                          title: 'Complete Booking',
                          message: 'Complete this booking and generate an invoice?',
                          confirmLabel: 'Complete',
                          onConfirm: async () => {
                            await handleUpdateBookingStatus(activeActionsMenu.data.id, 'completed');
                            closeConfirm();
                          }
                        });
                        setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                      }} 
                      className="actions-dropdown-item"
                    >
                      <Check size={14} /> Complete Booking
                    </button>
                  )}
                  {activeActionsMenu.data.status !== "completed" && activeActionsMenu.data.status !== "cancelled" && (
                    <button 
                      onClick={() => {
                        openConfirm({
                          title: 'Cancel Booking',
                          message: 'Are you sure you want to cancel this booking? This cannot be undone.',
                          variant: 'danger',
                          confirmLabel: 'Cancel Booking',
                          onConfirm: async () => {
                            await handleUpdateBookingStatus(activeActionsMenu.data.id, 'cancelled');
                            closeConfirm();
                          }
                        });
                        setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                      }} 
                      className="actions-dropdown-item actions-dropdown-item-danger"
                    >
                      <X size={14} /> Cancel Booking
                    </button>
                  )}
                </>
              )}
              {getActiveRole() === 'admin' && (
                <>
                  <div className="actions-dropdown-divider" />
                  <button 
                    onClick={() => {
                      handleDeleteBooking(activeActionsMenu.data.id);
                      setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                    }} 
                    className="actions-dropdown-item actions-dropdown-item-danger"
                  >
                    <Trash size={14} /> Delete Record
                  </button>
                </>
              )}
            </>
          )}

          {activeActionsMenu.type === 'billing' && (
            <>
              {(getActiveRole() === 'admin' || getActiveRole() === 'accountant') && (
                <button 
                  onClick={() => {
                    handleEditInvoice(activeActionsMenu.data);
                    setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                  }} 
                  className="actions-dropdown-item"
                >
                  <Edit size={14} /> Edit Invoice
                </button>
              )}
              
              <button 
                onClick={() => {
                  setSelectedInvoiceForReceipt(activeActionsMenu.data);
                  setShowReceiptModal(true);
                  setLoadingReceipt(true);
                  BillingService.getInvoice(activeActionsMenu.data.id)
                    .then(res => setReceiptDetails(res.data))
                    .catch(() => toast.error("Failed to load receipt details."))
                    .finally(() => setLoadingReceipt(false));
                  setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                }} 
                className="actions-dropdown-item"
              >
                <FileText size={14} /> View Official Receipt
              </button>

              {(getActiveRole() === 'admin' || getActiveRole() === 'accountant' || getActiveRole() === 'dispatcher') && 
               (activeActionsMenu.data.status !== "Paid" && activeActionsMenu.data.status !== "paid" && activeActionsMenu.data.status !== "refunded") && (
                <button 
                  onClick={() => {
                    setPaymentForm({
                      invoice_id: activeActionsMenu.data.id,
                      amount_paid: activeActionsMenu.data.amount || activeActionsMenu.data.total_amount || "",
                      payment_method: "Cash"
                    });
                    setShowRecordPayment(true);
                    setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                  }} 
                  className="actions-dropdown-item"
                >
                  <DollarSign size={14} /> Record Payment
                </button>
              )}

              {(getActiveRole() === 'admin' || getActiveRole() === 'accountant') && 
               (activeActionsMenu.data.status === "Paid" || activeActionsMenu.data.status === "paid") && (
                <button 
                  onClick={() => {
                    setSelectedInvoiceForRefund(activeActionsMenu.data);
                    setRefundForm({
                      refund_amount: activeActionsMenu.data.amount || activeActionsMenu.data.total_amount || "",
                      refund_method: "GCASH",
                      notes: "",
                      reference_code: ""
                    });
                    setShowRefundModal(true);
                    setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                  }} 
                  className="actions-dropdown-item"
                >
                  <DollarSign size={14} /> Process Refund
                </button>
              )}

              {(getActiveRole() === 'admin' || getActiveRole() === 'accountant') && (
                <>
                  <div className="actions-dropdown-divider" />
                  <button 
                    onClick={() => {
                      handleVoidInvoice(activeActionsMenu.data.id);
                      setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                    }} 
                    className="actions-dropdown-item actions-dropdown-item-danger"
                  >
                    <Trash size={14} /> Void / Archive
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Vehicle Inspections Log Modal */}
      {showInspectionsModal && selectedVehicleForInspections && (
        <div className="modal-overlay" onClick={() => setShowInspectionsModal(false)}>
          <div className="card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <div className="modal-header-icon"><Wrench size={20} /></div>
              <h2>Inspections Log - {selectedVehicleForInspections.make} {selectedVehicleForInspections.model} ({selectedVehicleForInspections.plate_number})</h2>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Previous Inspections</h3>
              {loadingInspections ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}><Loader size={24} /></div>
              ) : inspectionsList.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  No logged inspections found for this vehicle.
                </div>
              ) : (
                <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Odometer</th>
                        <th>Fuel</th>
                        <th>Interior</th>
                        <th>Safety</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspectionsList.map(ins => (
                        <tr key={ins.id}>
                          <td>
                            <span className={`badge ${ins.inspection_type === 'checkout' ? 'badge-info' : 'badge-success'}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                              {ins.inspection_type}
                            </span>
                          </td>
                          <td>{parseInt(ins.odometer_reading).toLocaleString()} KM</td>
                          <td>{ins.fuel_level_percent}%</td>
                          <td>{ins.interior_clean_status}</td>
                          <td>
                            <span className={`badge ${ins.safety_check_passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                              {ins.safety_check_passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.75rem' }}>{formatManilaDateTime(ins.created_at || ins.uploaded_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {(getActiveRole() === 'admin' || getActiveRole() === 'dispatcher' || getActiveRole() === 'mechanic') && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await FleetService.createInspection(selectedVehicleForInspections.id, inspectionForm);
                  toast.success("Inspection logged successfully.");
                  setLoadingInspections(true);
                  const res = await FleetService.listInspections(selectedVehicleForInspections.id);
                  setInspectionsList(res.data?.data || []);
                  setInspectionForm({
                    booking_id: "",
                    inspection_type: "checkout",
                    odometer_reading: "",
                    fuel_level_percent: "100",
                    body_damage_notes: "",
                    interior_clean_status: "EXCELLENT",
                    safety_check_passed: true
                  });
                  fetchData();
                } catch (err) {
                  toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to log inspection.");
                } finally {
                  setLoadingInspections(false);
                }
              }} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Log New Inspection</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Inspection Event Type</label>
                    <select className="input-control" value={inspectionForm.inspection_type} onChange={e => setInspectionForm({...inspectionForm, inspection_type: e.target.value})}>
                      <option value="checkout">Check-out (Release)</option>
                      <option value="checkin">Check-in (Return)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Odometer Reading (KM)</label>
                    <input required type="number" className="input-control" value={inspectionForm.odometer_reading} onChange={e => setInspectionForm({...inspectionForm, odometer_reading: e.target.value})} placeholder="e.g. 12500" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Fuel Level (%)</label>
                    <input required type="number" min="0" max="100" className="input-control" value={inspectionForm.fuel_level_percent} onChange={e => setInspectionForm({...inspectionForm, fuel_level_percent: e.target.value})} placeholder="100" />
                  </div>
                  <div className="form-group">
                    <label>Interior Clean Status</label>
                    <select className="input-control" value={inspectionForm.interior_clean_status} onChange={e => setInspectionForm({...inspectionForm, interior_clean_status: e.target.value})}>
                      <option value="EXCELLENT">Excellent</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="DIRTY">Dirty</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Booking Reference (Optional)</label>
                    <select className="input-control" value={inspectionForm.booking_id} onChange={e => setInspectionForm({...inspectionForm, booking_id: e.target.value})}>
                      <option value="">None / Walk-in / Maintenance</option>
                      {bookings.filter(b => b.vehicle_id === selectedVehicleForInspections.id).map(b => (
                        <option key={b.id} value={b.id}>Booking #{b.id} ({getCustomerName(b.customer_id)})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={inspectionForm.safety_check_passed} onChange={e => setInspectionForm({...inspectionForm, safety_check_passed: e.target.checked})} />
                      Safety Check Passed (Eligible to Rent)
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Body Damage & Notes</label>
                  <input className="input-control" value={inspectionForm.body_damage_notes} onChange={e => setInspectionForm({...inspectionForm, body_damage_notes: e.target.value})} placeholder="NO DENTS, MINOR SCRATCH ON FRONT BUMPER..." />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn-primary"><Check size={16} /> Submit Inspection Report</button>
                </div>
              </form>
            )}

            <div className="modal-footer" style={{ borderTop: 'none', padding: 0, marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setShowInspectionsModal(false)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Document Vault Modal */}
      {showDocumentsModal && selectedCustomerForDocs && (
        <div className="modal-overlay" onClick={() => setShowDocumentsModal(false)}>
          <div className="card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <div className="modal-header-icon"><Shield size={20} /></div>
              <h2>Document Vault - {selectedCustomerForDocs.first_name} {selectedCustomerForDocs.last_name}</h2>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Secure Document Vault</h3>
              {loadingDocs ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}><Loader size={24} /></div>
              ) : documentsList.length === 0 ? (
                <div 
                   onClick={() => document.getElementById('kyc-file-upload').click()}
                   style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-card)', border: '2px dashed var(--border-color)', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={24} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Click to upload government document (PNG, JPG)</span>
                </div>
              ) : (
                <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Document Type</th>
                        <th>File Location</th>
                        <th>Uploaded Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentsList.map(doc => (
                        <tr key={doc.id}>
                          <td>
                            <span className="badge badge-info" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                              {String(doc.document_type).replace('_', ' ')}
                            </span>
                          </td>
                          <td><code>{doc.file_path || doc.s3_file_path}</code></td>
                          <td style={{ fontSize: '0.75rem' }}>{formatManilaDateTime(doc.created_at || doc.uploaded_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {(getActiveRole() === 'admin' || getActiveRole() === 'dispatcher') && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!documentForm.file) {
                  toast.error("Please select a file to upload.");
                  return;
                }
                const formData = new FormData();
                formData.append('document_type', documentForm.document_type);
                formData.append('file', documentForm.file);

                try {
                  await CrmService.uploadDocument(selectedCustomerForDocs.id, formData);
                  toast.success("Document uploaded successfully.");
                  setLoadingDocs(true);
                  const res = await CrmService.listDocuments(selectedCustomerForDocs.id);
                  setDocumentsList(res.data?.data || []);
                  setDocumentForm({
                    document_type: "LICENSE_PHOTO",
                    file: null
                  });
                  fetchData();
                } catch (err) {
                  toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to upload document.");
                } finally {
                  setLoadingDocs(false);
                }
              }} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Secure Document Uploader</h3>
                <div className="form-group">
                  <label>Government ID Document Type</label>
                  <select className="input-control" value={documentForm.document_type} onChange={e => setDocumentForm({...documentForm, document_type: e.target.value})}>
                    <option value="LICENSE_PHOTO">Driver's License Photo</option>
                    <option value="PASSPORT_SCAN">Passport Scan</option>
                    <option value="UTILITY_BILL">Utility Billing (Address Proof)</option>
                    <option value="NATIONAL_ID">National ID Card Scan</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: documentsList.length === 0 ? 'none' : 'block' }}>
                  <label>Upload File (PNG, JPG)</label>
                  <input 
                    id="kyc-file-upload"
                    type="file" 
                    accept=".png, .jpg, .jpeg" 
                    className="input-control" 
                    onChange={e => setDocumentForm({...documentForm, file: e.target.files[0]})} 
                    style={{ padding: '0.5rem' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="submit" className="btn-primary"><Plus size={16} /> Upload Secure File</button>
                </div>
              </form>
            )}

            <div className="modal-footer" style={{ borderTop: 'none', padding: 0, marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setShowDocumentsModal(false)} className="btn-secondary">Close Vault</button>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt & Invoice Breakdown Modal */}
      {showReceiptModal && selectedInvoiceForReceipt && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', width: '90%' }}>
            <div className="modal-header" style={{ borderBottom: '2px dashed var(--border-color)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src="/logo.png" alt="SwiftRide" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>SWIFTRIDE RENTALS INC.</span>
                  </div>
                  <span className={`badge ${
                    selectedInvoiceForReceipt.status === 'Paid' || selectedInvoiceForReceipt.status === 'paid' ? 'badge-success' : 
                    selectedInvoiceForReceipt.status === 'refunded' ? 'badge-warning' : 'badge-danger'
                  }`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    {selectedInvoiceForReceipt.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.25rem' }}>
                  123 RIZAL AVENUE, MAKATI CITY, METRO MANILA, PHILIPPINES<br />
                  TIN: 009-123-456-0000 | VAT REGISTERED BUSINESS
                </div>
              </div>
            </div>

            {loadingReceipt ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader size={32} /></div>
            ) : receiptDetails ? (
              <div style={{ padding: '1rem 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>OFFICIAL RECEIPT NO.</div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{formatInvoiceId(receiptDetails.id)}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>DATE COMPLETED</div>
                    <div>{formatManilaDateTime(receiptDetails.updated_at || receiptDetails.created_at)}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>BILLED TO CUSTOMER</div>
                    <div style={{ fontWeight: 'bold' }}>{getCustomerName(receiptDetails.customer_id)}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>BOOKING ID REFERENCE</div>
                    <div>Booking #{receiptDetails.booking_id}</div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--text-primary)' }}>Particulars & Line Items</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                        <th style={{ padding: '0.4rem 0' }}>Description</th>
                        <th style={{ padding: '0.4rem 0', textAlign: 'center' }}>Days / Qty</th>
                        <th style={{ padding: '0.4rem 0', textAlign: 'right' }}>Price</th>
                        <th style={{ padding: '0.4rem 0', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receiptDetails.invoice_line_items && receiptDetails.invoice_line_items.length > 0 ? (
                        receiptDetails.invoice_line_items.map(item => (
                          <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-primary)', fontWeight: '500' }}>{item.description || item.item_description || "Base Rental / Add-on"}</td>
                            <td style={{ padding: '0.5rem 0', textAlign: 'center' }}>{item.quantity || 1}</td>
                            <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>₱{parseFloat(item.unit_price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: '600' }}>₱{parseFloat(item.subtotal || item.amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td style={{ padding: '0.5rem 0', color: 'var(--text-primary)', fontWeight: '500' }}>Car Rental Base Flat Rate Fee</td>
                          <td style={{ padding: '0.5rem 0', textAlign: 'center' }}>1</td>
                          <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>₱{(parseFloat(receiptDetails.amount || receiptDetails.total_amount || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                          <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: '600' }}>₱{(parseFloat(receiptDetails.amount || receiptDetails.total_amount || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {(() => {
                  const total = parseFloat(receiptDetails.amount || receiptDetails.total_amount || 0);
                  const vatExclusive = total / 1.12;
                  const vatAmount = total - vatExclusive;
                  return (
                    <div style={{ background: theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Vat-Exclusive Net Sales:</span>
                        <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>₱{vatExclusive.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Value Added Tax (12% VAT):</span>
                        <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>₱{vatAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.05rem', marginTop: '0.4rem', color: 'var(--primary)' }}>
                        <span>TOTAL PAID TRANSACTION:</span>
                        <span>₱{total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  );
                })()}

                {receiptDetails.refunds && receiptDetails.refunds.length > 0 && (
                  <div style={{ marginTop: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <AlertTriangle size={14} /> REFUND PROCESSED
                    </div>
                    {receiptDetails.refunds.map(ref => (
                      <div key={ref.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        <div>Refund Amount: <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>₱{parseFloat(ref.refund_amount).toLocaleString()}</span> via <span style={{ textTransform: 'uppercase' }}>{ref.refund_method}</span></div>
                        <div>Reference ID: <code>{ref.reference_code || 'REF-N/A'}</code></div>
                        <div>Processed Date: {formatManilaDateTime(ref.processed_at || ref.created_at)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Could not load receipt details.</div>
            )}

            <div className="modal-footer" style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '1rem', paddingBottom: 0 }}>
              <button type="button" onClick={() => setShowReceiptModal(false)} className="btn-secondary">Close Receipt</button>
              <button type="button" onClick={() => window.print()} className="btn-primary"><FileText size={16} /> Print Receipt</button>
            </div>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {showRefundModal && selectedInvoiceForRefund && (
        <div className="modal-overlay" onClick={() => setShowRefundModal(false)}>
          <div className="card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <div className="modal-header-icon"><DollarSign size={20} /></div>
              <h2>Process Invoice Refund</h2>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await BillingService.createRefund({
                  invoice_id: selectedInvoiceForRefund.id,
                  refund_amount: refundForm.refund_amount,
                  refund_method: refundForm.refund_method,
                  notes: refundForm.notes,
                  reference_code: refundForm.reference_code
                });
                toast.success("Refund processed successfully!");
                setShowRefundModal(false);
                setRefundForm({
                  refund_amount: "",
                  refund_method: "GCASH",
                  notes: "",
                  reference_code: ""
                });
                fetchData();
              } catch (err) {
                toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to process refund.");
              }
            }}>
              <div className="form-group">
                <label>Invoice Reference</label>
                <input readOnly disabled className="input-control" value={`${formatInvoiceId(selectedInvoiceForRefund.id)} - ₱${parseFloat(selectedInvoiceForRefund.amount || selectedInvoiceForRefund.total_amount || 0).toLocaleString()} (${selectedInvoiceForRefund.status})`} />
              </div>
              <div className="form-group">
                <label>Refund Amount (PHP)</label>
                <input required type="number" step="0.01" className="input-control" value={refundForm.refund_amount} onChange={e => setRefundForm({...refundForm, refund_amount: e.target.value})} placeholder="3000" />
              </div>
              <div className="form-group">
                <label>Refund Payment Channel</label>
                <select className="input-control" value={refundForm.refund_method} onChange={e => setRefundForm({...refundForm, refund_method: e.target.value})}>
                  <option value="GCASH">GCash E-Wallet</option>
                  <option value="MAYA">Maya Pay E-Wallet</option>
                  <option value="CASH">Cash Refund</option>
                  <option value="BANK_TRANSFER">Bank Direct Credit</option>
                </select>
              </div>
              <div className="form-group">
                <label>Transaction / Reference Authorization Code</label>
                <input required className="input-control" value={refundForm.reference_code} onChange={e => setRefundForm({...refundForm, reference_code: e.target.value})} placeholder="REF-GCASH-12345" />
              </div>
              <div className="form-group">
                <label>Refund Reason & Audit Notes</label>
                <textarea className="input-control" value={refundForm.notes} onChange={e => setRefundForm({...refundForm, notes: e.target.value})} placeholder="CUSTOMER TRIP CANCELLED, REFUND APPROVED BY FINANCE MANAGER..." style={{ height: "80px", resize: "none" }} />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowRefundModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}><DollarSign size={16} /> Authorize Refund</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmLabel={confirmModal.confirmLabel}
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
