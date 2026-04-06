import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

type Mode = "login" | "signup";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const { language } = useSettings();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isHe = language === "he";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error);
      } else {
        setSuccessMsg(
          isHe
            ? "נשלח אימייל אימות — אנא בדוק את תיבת הדואר שלך ואשר את החשבון."
            : "Verification email sent — please check your inbox and confirm your account."
        );
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-200 p-8 flex flex-col gap-6">
        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">🌱</span>
          <h1 className="text-2xl font-bold text-slate-800">
            {isHe ? "המטלות שלי" : "My Tasks"}
          </h1>
          <p className="text-sm text-slate-500">
            {mode === "login"
              ? isHe ? "התחבר לחשבון שלך" : "Sign in to your account"
              : isHe ? "צור חשבון חדש" : "Create a new account"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-600">
              {isHe ? "אימייל" : "Email"}
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder={isHe ? "you@example.com" : "you@example.com"}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-600">
              {isHe ? "סיסמה" : "Password"}
            </label>
            <input
              type="password"
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="••••••••"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Success */}
          {successMsg && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 text-white font-semibold rounded-xl py-2.5 transition-colors"
          >
            {loading
              ? (isHe ? "טוען..." : "Loading...")
              : mode === "login"
              ? (isHe ? "התחבר" : "Sign in")
              : (isHe ? "הירשם" : "Sign up")}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-sm text-slate-500">
          {mode === "login"
            ? isHe ? "אין לך חשבון?" : "Don't have an account?"
            : isHe ? "כבר יש לך חשבון?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setSuccessMsg(null); }}
            className="text-indigo-500 hover:text-indigo-700 font-medium underline underline-offset-2"
          >
            {mode === "login"
              ? isHe ? "הירשם" : "Sign up"
              : isHe ? "התחבר" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
