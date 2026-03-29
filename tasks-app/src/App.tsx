import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PlantPage from "./pages/PlantPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plant" element={<PlantPage />} />
      </Routes>
    </BrowserRouter>
  );
}
