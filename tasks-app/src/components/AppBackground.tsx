import type { ReactNode } from "react";
import { useSettings } from "../context/SettingsContext";

export default function AppBackground({ children }: { children: ReactNode }) {
  const { background } = useSettings();

  return (
    <div
      className="min-h-screen transition-all duration-700"
      style={
        background === "jungle"
          ? {
              backgroundImage: "url('/bg-jungle.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }
          : { backgroundColor: "#f8fafc" }
      }
    >
      {/* Overlay to keep content readable when jungle bg is active */}
      {background === "jungle" && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{ background: "rgba(0,0,0,0.35)" }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
