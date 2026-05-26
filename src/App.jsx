import "./App.css";
import { Routes, Route } from "react-router-dom";

// Pages publiques
import HomePage from "./pages/HomePage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import SimulationPage from "./pages/SimulationPage";

// Pages privées
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

// Layout
import Navbar from "./components/Navbar";
import PrivateOnly from "./components/PrivateOnly";

function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        {/* ── PUBLIQUES ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── PRIVÉES ── */}
        <Route
          path="/dashboard"
          element={<PrivateOnly><Dashboard /></PrivateOnly>}
        />
        {/* ✅ Route /profile ajoutée — reliée au lien "Configuration" de la Navbar */}
        <Route
          path="/profile"
          element={<PrivateOnly><Profile /></PrivateOnly>}
        />
      </Routes>
    </div>
  );
}

export default App;
