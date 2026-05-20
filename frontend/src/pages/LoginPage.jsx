import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/authService";
import { useToast } from "../components/Toast";
import { Eye, EyeOff, Loader } from "../components/Icons";

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthService.login(form);
      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Login failed. Check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
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

      <div className="card login-card">

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="SwiftRide Logo" className="login-logo" style={{ objectFit: 'contain', padding: '4px', background: 'transparent', boxShadow: 'none' }} />
          <h1 className="login-title">SwiftRide ERP</h1>
          <p className="login-subtitle">Access the centralized administration portal</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@swiftride.com"
              value={form.email}
              onChange={handleChange}
              required
              className="input-control"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="input-control"
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary ${loading ? 'btn-loading' : ''}`}
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
          >
            {loading ? (
              <>
                <Loader size={18} className="btn-spinner" /> Signing in...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', textAlign: 'center' }}>
            Demo Role Accounts (Click to Populate)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.5rem', justifyContent: 'center', borderRadius: '6px' }}
              onClick={() => setForm({ email: 'john.doe@swiftride.com', password: 'Admin2026!' })}
            >
              🔑 Admin
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.5rem', justifyContent: 'center', borderRadius: '6px' }}
              onClick={() => setForm({ email: 'alice.dispatcher@swiftride.com', password: 'Dispatcher2026!' })}
            >
              📋 Dispatcher
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.5rem', justifyContent: 'center', borderRadius: '6px' }}
              onClick={() => setForm({ email: 'bob.mechanic@swiftride.com', password: 'Mechanic2026!' })}
            >
              🔧 Mechanic
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.5rem', justifyContent: 'center', borderRadius: '6px' }}
              onClick={() => setForm({ email: 'charlie.accountant@swiftride.com', password: 'Accountant2026!' })}
            >
              💵 Accountant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
