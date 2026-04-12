import { HashRouter as BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PlantPage from "./pages/PlantPage";
import LoginPage from "./pages/LoginPage";
import { SettingsProvider } from "./context/SettingsContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SettingsPanel from "./components/SettingsPanel";
import AppBackground from "./components/AppBackground";

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <span className="text-4xl animate-spin">🌱</span>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <>
      <SettingsPanel />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plant" element={<PlantPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppBackground>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AppBackground>
      </SettingsProvider>
    </AuthProvider>
  );
}
