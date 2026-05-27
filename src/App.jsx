import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/auth.context";

import HomePage from "./pages/HomePage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import SimulationPage from "./pages/SimulationPage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminPage from "./pages/AdminPage";

import Navbar from "./components/Navbar";
import PrivateOnly from "./components/PrivateOnly";
import { Navigate } from "react-router-dom";

// Wrapper admin : PrivateOnly + vérification rôle
function AdminOnly({ children }) {
  const { isLoggedIn, loggedUserRole, isAuthenticating } = useContext(AuthContext);
  if (isAuthenticating) return null;
  if (!isLoggedIn) return <Navigate to="/login" />;
  if (loggedUserRole !== "admin") return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        {/* Publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Privées user */}
        <Route path="/dashboard" element={<PrivateOnly><Dashboard /></PrivateOnly>} />
        <Route path="/profile" element={<PrivateOnly><Profile /></PrivateOnly>} />

        {/* ✅ Privée admin — route privée BE + FE */}
        <Route path="/admin" element={<AdminOnly><AdminPage /></AdminOnly>} />
      </Routes>
    </div>
  );
}

export default App;
