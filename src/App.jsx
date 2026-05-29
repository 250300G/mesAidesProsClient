// App.jsx
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/auth.context";

import HomePage          from "./pages/HomePage";
import Login             from "./pages/auth/Login";
import Signup            from "./pages/auth/Signup";
import Simulation        from "./pages/Simulation";
import Dashboard         from "./pages/Dashboard";
import Profile           from "./pages/Profile";
import AdminPage         from "./pages/AdminPage";
import FundsExplorerPage from "./pages/FundsExplorerPage";
import NotFound          from "./pages/NotFound";

import Navbar      from "./components/Navbar";
import PrivateOnly from "./components/PrivateOnly";

// Garde admin : vérifie token + rôle
function AdminOnly({ children }) {
  const { isLoggedIn, loggedUserRole, isAuthenticating } = useContext(AuthContext);
  if (isAuthenticating) return null;
  if (!isLoggedIn)                return <Navigate to="/login" replace />;
  if (loggedUserRole !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        {/* ── Publiques ── */}
        <Route path="/"           element={<HomePage />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/signup"     element={<Signup />} />
        <Route path="/funds"      element={<FundsExplorerPage />} />

        {/* ── Privées utilisateur ── */}
        <Route path="/dashboard" element={<PrivateOnly><Dashboard /></PrivateOnly>} />
        <Route path="/profile"   element={<PrivateOnly><Profile /></PrivateOnly>} />

        {/* ── Privée admin ── */}
        <Route path="/admin" element={<AdminOnly><AdminPage /></AdminOnly>} />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
