import { useEffect } from 'react';
import { AlertTriangle, Trash, Loader } from './Icons';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  loading = false,
  onConfirm,
  onCancel,
  icon,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape' && !loading) onCancel?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, loading, onCancel]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const DefaultIcon = variant === 'danger' ? Trash : AlertTriangle;
  const IconEl = icon || <DefaultIcon size={24} />;

  return (
    <div className="confirm-overlay" onClick={() => !loading && onCancel?.()}>
      <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-icon confirm-icon-${variant}`}>
          {IconEl}
        </div>
        <div className="confirm-title">{title}</div>
        <div className="confirm-message">{message}</div>
        <div className="confirm-actions">
          <button
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <><Loader size={16} className="spin" /> Processing...</> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
