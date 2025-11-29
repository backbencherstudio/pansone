"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authApi.login(email, password);
      
      if (response.success) {
        router.push("/");
      } else {
        setError(response.message || "Invalid email or password");
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_55%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.2),transparent_60%)]" />
      
      <div className="w-full max-w-md px-3 sm:px-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl shadow-[0_0_60px_-20px_rgba(15,118,235,0.35)] sm:rounded-3xl sm:p-8">
          <div className="mb-6 space-y-1.5 text-center sm:mb-8 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-200 shadow-[0_0_22px_rgba(16,185,129,0.45)] sm:gap-2 sm:px-3 sm:py-1 sm:text-[11px]">
              <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.9)] sm:h-1.5 sm:w-1.5" />
              VestControl Access
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
              Admin Login
            </h1>
            <p className="text-xs text-slate-400 sm:text-sm">
              Enter your credentials to access the control dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-300 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <label
                htmlFor="email"
                className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 font-mono sm:text-xs"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full truncate rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-mono text-slate-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
                placeholder="admin@website.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label
                htmlFor="password"
                className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 font-mono sm:text-xs"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full truncate rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-mono text-slate-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-indigo-500/80 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-50 shadow-[0_0_30px_-12px_rgba(99,102,241,0.8)] transition-all duration-150 hover:bg-indigo-400 hover:shadow-[0_0_36px_-10px_rgba(165,180,252,0.9)] disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-xl sm:py-3 sm:text-sm"
            >
              {isLoading ? "Authenticating..." : "Login"}
            </button>
          </form>

          <div className="mt-5 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5 text-[10px] font-mono text-slate-500 sm:mt-6 sm:rounded-xl sm:px-4 sm:py-3 sm:text-[11px]">
            <p className="text-center">
              Demo: <span className="text-slate-400">admin@website.com</span> / <span className="text-slate-400">AdminPassword123!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

