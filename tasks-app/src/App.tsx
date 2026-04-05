import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PlantPage from "./pages/PlantPage";
import { SettingsProvider } from "./context/SettingsContext";
import SettingsPanel from "./components/SettingsPanel";
import AppBackground from "./components/AppBackground";

export default function App() {
  return (
    <SettingsProvider>
      <AppBackground>
        <BrowserRouter>
          <SettingsPanel />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plant" element={<PlantPage />} />
          </Routes>
        </BrowserRouter>
      </AppBackground>
    </SettingsProvider>
  );
}
