import { useNavigate } from "react-router-dom";
import AuthService from "../services/authService";

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await AuthService.logout();
    navigate("/login");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}>
        <h1>SwiftRide ERP — Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}>
        {[
          { label: "Fleet", path: "/fleet" },
          { label: "CRM", path: "/crm" },
          { label: "Bookings", path: "/bookings" },
          { label: "Billing", path: "/billing" },
        ].map(({ label, path }) => (
          <div
            key={path}
            onClick={() => navigate(path)}
            style={{
              padding: "2rem",
              border: "1px solid #ddd",
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "center",
              fontSize: "1.25rem",
            }}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
