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
import { Home, Truck, Users, Calendar, CreditCard, Plus, LogOut, Check, X, Wrench, FileText, DollarSign, Car, Shield, Clock, MoreVertical, Edit, Trash } from '../components/Icons';

const POPULAR_MAKES = ["TOYOTA", "NISSAN", "MITSUBISHI", "HONDA", "FORD", "MAZDA", "ISUZU", "SUZUKI", "HYUNDAI", "KIA", "MG", "BYD"];
const POPULAR_MODELS = ["VIOS", "CIVIC", "MONTERO SPORT", "FORTUNER", "ALMERA", "NAVARA", "EVEREST", "HIACE", "ERTIGA", "MU-X", "CITY", "ACCORD"];
const POPULAR_COLORS = ["SILVER", "WHITE", "BLACK", "GRAY", "RED", "BLUE", "BROWN", "YELLOW", "ORANGE", "GREEN"];

export default function DashboardPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

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

  // Form states
  const [vehicleForm, setVehicleForm] = useState({
    make: "", model: "", year: new Date().getFullYear(),
    plate_number: "", color: "", type: "car", status: "available", daily_rate: ""
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
    customer_id: "", vehicle_id: "", start_date: "", end_date: "", notes: ""
  });
  const [paymentForm, setPaymentForm] = useState({
    invoice_id: "", amount_paid: "", payment_method: "Cash"
  });
  const [invoiceForm, setInvoiceForm] = useState({
    amount: "", due_date: "", notes: ""
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
    setVehicleForm({ make: "", model: "", year: new Date().getFullYear(), plate_number: "", color: "", type: "car", status: "available", daily_rate: "" });
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
    setBookingForm({ customer_id: "", vehicle_id: "", start_date: "", end_date: "", notes: "" });
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
      daily_rate: v.daily_rate || ""
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
    setBookingForm({
      customer_id: b.customer_id || "",
      vehicle_id: b.vehicle_id || "",
      start_date: b.start_date ? b.start_date.substring(0, 10) : "",
      end_date: b.end_date ? b.end_date.substring(0, 10) : "",
      notes: b.notes || ""
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
      toast.error(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} vehicle.`);
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
      toast.error(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'register'} customer.`);
    }
  };

  const handleAddLicense = async (e) => {
    e.preventDefault();
    try {
      await CrmService.createLicense(licenseForm);
      setShowAddLicense(false);
      setLicenseForm({ customer_id: "", license_number: "", expiry_date: "", issuing_authority: "", license_class: "B" });
      toast.success("Driver's license saved.");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save driver's license.");
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
      toast.error(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} booking.`);
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
      await BillingService.recordPayment(paymentForm);
      setShowRecordPayment(false);
      setPaymentForm({ invoice_id: "", amount_paid: "", payment_method: "Cash" });
      toast.success('Payment recorded successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record payment.");
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
      toast.error(err.response?.data?.message || "Failed to update invoice.");
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
          toast.error(err.response?.data?.message || 'Failed to delete vehicle.');
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
          toast.error(err.response?.data?.message || 'Failed to delete customer.');
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
          toast.error(err.response?.data?.message || 'Failed to delete booking record.');
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
          toast.error(err.response?.data?.message || 'Failed to void invoice.');
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

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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

        </div>

        {currentUser && (
          <div style={{ padding: '0.75rem', borderRadius: 8, background: theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="user-avatar">
                {currentUser.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'capitalize' }}>{currentUser.role?.name || 'staff'}</div>
              </div>
            </div>
          </div>
        )}

        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-list">
            <li>
              <a href="#" className={`nav-link ${activeTab === "overview" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("overview"); }}>
                <Home size={18} />
                Overview
              </a>
            </li>
            <li>
              <a href="#" className={`nav-link ${activeTab === "fleet" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("fleet"); }}>
                <Truck size={18} />
                Fleet Manager
              </a>
            </li>
            <li>
              <a href="#" className={`nav-link ${activeTab === "crm" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("crm"); }}>
                <Users size={18} />
                Customer Directory
              </a>
            </li>
            <li>
              <a href="#" className={`nav-link ${activeTab === "bookings" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("bookings"); }}>
                <Calendar size={18} />
                Bookings
              </a>
            </li>
            <li>
              <a href="#" className={`nav-link ${activeTab === "billing" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("billing"); }}>
                <CreditCard size={18} />
                Billing & Accounts
              </a>
            </li>
          </ul>
        </nav>

        <button onClick={handleLogoutClick} className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* Main View Area */}
      <main className="main-content" style={{ position: "relative" }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: '1.5rem',
            right: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '20px',
            background: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            animation: 'pulse 2s infinite ease-in-out',
            zIndex: 10
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--primary)',
              animation: 'spin 1s infinite linear'
            }} />
            Refreshing data...
          </div>
        )}

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
                                    <button onClick={() => handleVerifyLicense(verificationResult.license_id)} className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', width: 'fit-content', marginTop: '0.25rem' }}>
                                      <Shield size={12} /> Mark License Verified
                                    </button>
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
                          <td style={{ fontWeight: "bold" }}>₱{parseFloat(b.total_cost || 0).toLocaleString()}</td>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>Year</label>
                  <input required type="number" className="input-control" value={vehicleForm.year} onChange={(e) => setVehicleForm({...vehicleForm, year: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Plate Number</label>
                  <input required className="input-control" value={vehicleForm.plate_number} onChange={(e) => setVehicleForm({...vehicleForm, plate_number: e.target.value.toUpperCase()})} placeholder="ABC-1234" style={{ textTransform: 'uppercase' }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input required className="input-control" value={customerForm.first_name} onChange={(e) => setCustomerForm({...customerForm, first_name: e.target.value.toUpperCase()})} placeholder="JUAN" style={{ textTransform: 'uppercase' }} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input required className="input-control" value={customerForm.last_name} onChange={(e) => setCustomerForm({...customerForm, last_name: e.target.value.toUpperCase()})} placeholder="DELA CRUZ" style={{ textTransform: 'uppercase' }} />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input required type="email" className="input-control" value={customerForm.email} onChange={(e) => setCustomerForm({...customerForm, email: e.target.value.toUpperCase()})} placeholder="JUAN@GMAIL.COM" style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input className="input-control" value={customerForm.phone} onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value.toUpperCase()})} placeholder="09171234567" style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label>Billing Address</label>
                <input className="input-control" value={customerForm.billing_address} onChange={(e) => setCustomerForm({...customerForm, billing_address: e.target.value.toUpperCase()})} placeholder="123 RIZAL ST" style={{ textTransform: 'uppercase' }} />
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
                <input required className="input-control" value={licenseForm.license_number} onChange={(e) => setLicenseForm({...licenseForm, license_number: e.target.value.toUpperCase()})} placeholder="N01-23-456789" style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input required type="date" className="input-control" value={licenseForm.expiry_date} onChange={(e) => setLicenseForm({...licenseForm, expiry_date: e.target.value})} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>Issuing Authority</label>
                  <input className="input-control" value={licenseForm.issuing_authority} onChange={(e) => setLicenseForm({...licenseForm, issuing_authority: e.target.value.toUpperCase()})} placeholder="LTO" style={{ textTransform: 'uppercase' }} />
                </div>
                <div className="form-group">
                  <label>License Class</label>
                  <input className="input-control" value={licenseForm.license_class} onChange={(e) => setLicenseForm({...licenseForm, license_class: e.target.value.toUpperCase()})} placeholder="B" style={{ textTransform: 'uppercase' }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddLicense(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary"><FileText size={16} /> Save License</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddBooking && (
        <div className="modal-overlay" onClick={handleCloseAddBooking}>
          <div className="card modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon"><Calendar size={20} /></div>
              <h2>{isEditing ? "Edit Booking Details" : "Create Booking"}</h2>
            </div>
            <form onSubmit={handleAddBooking}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input required type="date" className="input-control" value={bookingForm.start_date} onChange={(e) => setBookingForm({...bookingForm, start_date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input required type="date" className="input-control" value={bookingForm.end_date} onChange={(e) => setBookingForm({...bookingForm, end_date: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="input-control" value={bookingForm.notes} onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value.toUpperCase()})} placeholder="SPECIAL REQUESTS..." style={{ height: "80px", resize: "none", textTransform: 'uppercase' }} />
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
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Transfer">Bank Transfer</option>
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
                <textarea className="input-control" value={invoiceForm.notes} onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value.toUpperCase()})} placeholder="INVOICE NOTES..." style={{ height: "80px", resize: "none", textTransform: 'uppercase' }} />
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
              <button 
                onClick={() => {
                  handleEditVehicle(activeActionsMenu.data);
                  setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                }} 
                className="actions-dropdown-item"
              >
                <Edit size={14} /> Edit Vehicle
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

          {activeActionsMenu.type === 'crm' && (
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
              <button 
                onClick={() => {
                  handleVerifyCustomer(activeActionsMenu.data.id);
                  setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                }} 
                className="actions-dropdown-item"
              >
                <Shield size={14} /> Verify Eligibility
              </button>
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

          {activeActionsMenu.type === 'bookings' && (
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

          {activeActionsMenu.type === 'billing' && (
            <>
              <button 
                onClick={() => {
                  handleEditInvoice(activeActionsMenu.data);
                  setActiveActionsMenu({ type: null, id: null, rect: null, data: null });
                }} 
                className="actions-dropdown-item"
              >
                <Edit size={14} /> Edit Invoice
              </button>
              {(activeActionsMenu.data.status !== "Paid" && activeActionsMenu.data.status !== "paid") && (
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
