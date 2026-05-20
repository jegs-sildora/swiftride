import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthService from "./services/authService";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

function PrivateRoute({ children }) {
  return AuthService.isAuthenticated() ? (
    children
  ) : (
    <Navigate
      to="/login"
      replace
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
