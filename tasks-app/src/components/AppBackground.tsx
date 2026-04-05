import type { CSSProperties, ReactNode } from "react";
import { useSettings, type Background } from "../context/SettingsContext";

interface BgConfig {
  style: CSSProperties;
  overlay?: string; // rgba color string, or undefined for no overlay
}

const base = import.meta.env.BASE_URL; // "/tasks/" in production, "/" in dev

const BG_CONFIG: Record<Background, BgConfig> = {
  default: {
    style: { backgroundColor: "#f8fafc" },
  },
  jungle: {
    style: {
      backgroundImage: `url('${base}bg-jungle.png')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    },
    overlay: "rgba(0,0,0,0.35)",
  },
  night: {
    style: {
      backgroundImage: `url('${base}bg-night.jpg')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    },
    overlay: "rgba(0,0,20,0.45)",
  },
  ocean: {
    style: {
      backgroundImage: `url('${base}bg-ocean.jpg')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    },
    overlay: "rgba(0,30,60,0.30)",
  },
};

export default function AppBackground({ children }: { children: ReactNode }) {
  const { background } = useSettings();
  const config = BG_CONFIG[background] ?? BG_CONFIG.default;

  return (
    <div className="min-h-screen transition-all duration-700" style={config.style}>
      {config.overlay && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{ background: config.overlay }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
