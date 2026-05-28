// App.jsx
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/auth.context";
import { Navigate } from "react-router-dom";

import HomePage          from "./pages/HomePage";
import Login             from "./pages/auth/Login";
import Signup            from "./pages/auth/Signup";
import Simulation        from "./pages/Simulation";
import Dashboard         from "./pages/Dashboard";
import Profile           from "./pages/Profile";
import AdminPage         from "./pages/AdminPage";
import FundsExplorerPage from "./pages/FundsExplorerPage";

import Navbar      from "./components/Navbar";
import PrivateOnly from "./components/PrivateOnly";

// Wrapper admin : vérifie token + rôle admin
function AdminOnly({ children }) {
  const { isLoggedIn, loggedUserRole, isAuthenticating } = useContext(AuthContext);
  if (isAuthenticating) return null;
  if (!isLoggedIn)             return <Navigate to="/login" />;
  if (loggedUserRole !== "admin") return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        {/* ── Routes publiques ── */}
        <Route path="/"           element={<HomePage />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/signup"     element={<Signup />} />
        <Route path="/funds"      element={<FundsExplorerPage />} />

        {/* ── Routes privées utilisateur ── */}
        <Route path="/dashboard" element={<PrivateOnly><Dashboard /></PrivateOnly>} />
        <Route path="/profile"   element={<PrivateOnly><Profile /></PrivateOnly>} />

        {/* ── Route privée admin ── */}
        <Route path="/admin" element={<AdminOnly><AdminPage /></AdminOnly>} />

        {/* ── Fallback 404 ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
