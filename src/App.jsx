import "./App.css";
import { Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import SimulationPage from "./pages/SimulationPage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

// Components
import Navbar from "./components/Navbar";
import PrivateOnly from "./components/PrivateOnly";

function App() {
  return (
    <div>
      {/* Ton Navbar propre et asymétrique */}
      <Navbar />

      {/* Le conteneur principal de tes pages */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        {/* Espaces privés protégés */}
        <Route path="/dashboard" element={<PrivateOnly><Dashboard /></PrivateOnly>} />
        <Route path="/profile" element={<PrivateOnly><Profile /></PrivateOnly>} />
      </Routes>
    </div>
  );
}

export default App;