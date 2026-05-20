/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from './Icons';

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, 4000);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, onRemove]);

  const handleClose = () => {
    clearTimeout(timerRef.current);
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const IconComponent = TOAST_ICONS[toast.type] || Info;

  return (
    <div className={`toast toast-${toast.type} ${exiting ? 'toast-exit' : ''}`}>
      <span className="toast-icon"><IconComponent size={20} /></span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={handleClose} aria-label="Close">
        <X size={16} />
      </button>
      <div className="toast-progress" />
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => {
      const next = [...prev, { id, type, message }];
      return next.slice(-5); // max 5 visible
    });
  }, []);

  const toast = {
    success: useCallback((msg) => addToast('success', msg), [addToast]),
    error: useCallback((msg) => addToast('error', msg), [addToast]),
    warning: useCallback((msg) => addToast('warning', msg), [addToast]),
    info: useCallback((msg) => addToast('info', msg), [addToast]),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
