"use client";

import { useEffect, useMemo, useState } from "react";
import type { AppConfig, AppMode } from "../types/app";
import { MOCK_APPS } from "../types/app";

type DashboardApp = AppConfig;

const formatTime = (date: Date): string =>
  date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const formatLastUpdated = (date: Date): string =>
  date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

interface ModePillProps {
  mode: AppMode;
}

function ModePill({ mode }: ModePillProps) {
  const isWebview = mode === "webview";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium tracking-wide whitespace-nowrap truncate ${
        isWebview
          ? "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30"
          : "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
      }`}
      title={isWebview ? "Money Mode // WebView" : "Safe Mode // Native"}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isWebview ? "bg-rose-400 shadow-[0_0_12px_rgba(248,113,113,0.8)]" : "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
        }`}
      />
      {isWebview ? "Money Mode // WebView" : "Safe Mode // Native"}
    </span>
  );
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
}

function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`group relative flex h-10 w-20 items-center rounded-full border transition-all duration-200 ${
        checked
          ? "border-rose-500/60 bg-rose-950 shadow-[0_0_24px_rgba(248,113,113,0.6)]"
          : "border-emerald-500/60 bg-emerald-950 shadow-[0_0_24px_rgba(52,211,153,0.6)]"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute inset-0 rounded-full bg-linear-to-r opacity-40 transition-opacity duration-200 ${
          checked
            ? "from-rose-500/60 via-rose-400/20 to-rose-500/60"
            : "from-emerald-500/60 via-emerald-400/20 to-emerald-500/60"
        }`}
      />
      <span
        className={`relative z-10 ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-[10px] font-semibold tracking-wide shadow-lg ring-1 transition-all duration-200 ${
          checked
            ? "translate-x-9 ring-rose-400/70 text-rose-300"
            : "translate-x-0 ring-emerald-400/70 text-emerald-300"
        }`}
      >
        {checked ? "ON" : "OFF"}
      </span>
    </button>
  );
}

interface ControlCardProps {
  app: DashboardApp;
  onToggleMode: (id: string) => void;
  onUpdateField: (id: string, field: "targetUrl" | "geoFencing", value: string) => void;
  onFlushCache: (id: string) => void;
  onSaveConfig: (id: string) => void;
}

function ControlCard({
  app,
  onToggleMode,
  onUpdateField,
  onFlushCache,
  onSaveConfig,
}: ControlCardProps) {
  const isWebview = app.mode === "webview";
  const isNative = !isWebview;
  const isReadonly = isNative || app.status !== "active";

  const cardGlow = isWebview
    ? "shadow-[0_0_30px_-10px_rgba(244,63,94,0.35)] hover:shadow-[0_0_44px_-12px_rgba(244,63,94,0.55)]"
    : "shadow-[0_0_30px_-12px_rgba(16,185,129,0.25)] hover:shadow-[0_0_44px_-12px_rgba(16,185,129,0.4)]";

  const statusColor =
    app.status === "active"
      ? "text-emerald-400"
      : app.status === "inactive"
      ? "text-slate-400"
      : "text-rose-400";

  const statusLabel =
    app.status === "active"
      ? "Active"
      : app.status === "inactive"
      ? "Inactive"
      : "Banned";

  return (
    <section
      className={`group relative flex min-h-[420px] min-w-0 flex-col gap-5 rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 ${cardGlow}`}
    >
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <h2
              className="text-sm font-semibold tracking-wide text-slate-100 whitespace-nowrap truncate"
              title={app.name}
            >
              {app.name}
            </h2>
            <div className="shrink-0">
              <ModePill mode={app.mode} />
            </div>
          </div>
          <div className="flex min-w-0 flex-col">
            <p
              className="text-xs font-mono text-slate-400 whitespace-nowrap truncate"
              title={app.bundleId}
            >
              {app.bundleId}
            </p>
          </div>
        </div>
        <div className="flex min-w-0 flex-col items-end gap-1 text-xs text-slate-500">
          <span className={`${statusColor} font-mono whitespace-nowrap truncate`}>
            {statusLabel}
          </span>
          <span
            className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap truncate"
            title={`Last touch · ${formatLastUpdated(app.lastUpdated)}`}
          >
            Last touch · {formatLastUpdated(app.lastUpdated)}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 whitespace-nowrap truncate font-mono">
            Kill Switch
          </p>
          <p
            className="text-xs font-mono text-slate-300 whitespace-nowrap truncate"
            title={
              isWebview
                ? "Routing to WebView / Money Mode"
                : "Locked to Native Safe Utilities"
            }
          >
            {isWebview
              ? "Routing to WebView / Money Mode"
              : "Locked to Native Safe Utilities"}
          </p>
        </div>
        <div className="shrink-0 self-start sm:self-auto">
          <ToggleSwitch checked={isWebview} onChange={() => onToggleMode(app.id)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 font-mono">
              <span className="whitespace-nowrap truncate">Target URL</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono whitespace-nowrap truncate ${
                  isReadonly
                    ? "bg-white/5 text-slate-500"
                    : "bg-indigo-500/10 text-indigo-300"
                }`}
              >
                {isReadonly ? "Locked" : "Live"}
              </span>
            </div>
            <input
              type="url"
              value={app.targetUrl}
              onChange={(e) =>
                onUpdateField(app.id, "targetUrl", e.target.value)
              }
              readOnly={isReadonly}
              className={`w-full truncate rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-slate-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] outline-none transition-all duration-200 whitespace-nowrap placeholder:text-slate-500 ${
                isReadonly
                  ? "opacity-60"
                  : "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
              }`}
              placeholder="https://vest-shell.net/launcher/region"
              title={app.targetUrl}
            />
          </div>

            <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 font-mono">
              <span className="whitespace-nowrap truncate">Geo-Fence</span>
              <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap truncate">
                ISO / comma separated
              </span>
            </div>
            <input
              type="text"
              value={app.geoFencing}
              onChange={(e) =>
                onUpdateField(app.id, "geoFencing", e.target.value)
              }
              readOnly={isReadonly}
              className={`w-full truncate rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-slate-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] outline-none transition-all duration-200 whitespace-nowrap placeholder:text-slate-500 ${
                isReadonly
                  ? "opacity-60"
                  : "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
              }`}
              placeholder="US, CA, GB"
              title={app.geoFencing}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-xs text-slate-400 backdrop-blur-lg">
            <p className="font-semibold text-slate-100 whitespace-nowrap truncate">
              Runtime Signals
            </p>
            <ul className="mt-2 space-y-1 text-[11px] font-mono text-slate-400">
              <li className="flex items-center justify-between whitespace-nowrap gap-2">
                <span className="text-slate-500">MODE</span>
                <span
                  className={`${isWebview ? "text-rose-400" : "text-emerald-400"} whitespace-nowrap truncate`}
                >
                  {isWebview ? "WEBVIEW" : "NATIVE"}
                </span>
              </li>
              <li className="flex items-center justify-between whitespace-nowrap gap-2">
                <span className="text-slate-500">STATUS</span>
                <span className={`${statusColor} whitespace-nowrap truncate`}>
                  {statusLabel}
                </span>
              </li>
              <li className="flex items-center justify-between whitespace-nowrap gap-2">
                <span className="text-slate-500">GEO</span>
                <span
                  className="text-slate-300 whitespace-nowrap truncate"
                  title={app.geoFencing || "—"}
                >
                  {app.geoFencing || "—"}
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onFlushCache(app.id)}
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-rose-400/50 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-rose-200 shadow-[0_0_30px_-12px_rgba(244,63,94,0.6)] transition-all duration-150 hover:border-rose-300 hover:text-rose-50 hover:shadow-[0_0_36px_-10px_rgba(244,63,94,0.8)] disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/5 disabled:text-slate-500 disabled:shadow-none"
              disabled={app.status !== "active"}
            >
              Flush Cache
            </button>
            <button
              type="button"
              onClick={() => onSaveConfig(app.id)}
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-indigo-500/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-50 shadow-[0_0_30px_-12px_rgba(99,102,241,0.8)] transition-all duration-150 hover:bg-indigo-400 hover:shadow-[0_0_36px_-10px_rgba(165,180,252,0.9)] disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-slate-500 disabled:shadow-none"
              disabled={app.status === "banned"}
            >
              Save Config
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardGrid() {
  const [apps, setApps] = useState<DashboardApp[]>(() => [...MOCK_APPS]);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1_000);
    return () => clearInterval(timer);
  }, []);

  const onlineCount = useMemo(
    () => apps.filter((app) => app.status === "active").length,
    [apps],
  );

  const toggleAppMode = (id: string) => {
    setApps((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              mode: app.mode === "native" ? "webview" : "native",
              lastUpdated: new Date(),
            }
          : app,
      ),
    );
  };

  const updateField = (
    id: string,
    field: "targetUrl" | "geoFencing",
    value: string,
  ) => {
    setApps((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              [field]: value,
            }
          : app,
      ),
    );
  };

  const touchApp = (id: string, transform?: (app: DashboardApp) => DashboardApp) => {
    setApps((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...(transform ? transform(app) : app),
              lastUpdated: new Date(),
            }
          : app,
      ),
    );
  };

  const handleFlushCache = (id: string) => {
    // In a real system this would trigger an API call.
    touchApp(id);
  };

  const handleSaveConfig = (id: string) => {
    // In a real system this would persist changes via API.
    touchApp(id);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_55%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.2),transparent_60%)]" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex min-w-0 flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl shadow-[0_0_60px_-20px_rgba(15,118,235,0.35)] md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-emerald-200 shadow-[0_0_22px_rgba(16,185,129,0.45)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
              <span className="truncate">System Status: Online</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-slate-50 whitespace-nowrap truncate sm:text-2xl">
                VestControl // Admin
              </h1>
              <p className="mt-1 text-sm text-slate-400 whitespace-nowrap truncate">
                Remote kill-switch for Vest shell apps · Safe &lt;&gt; Money mode
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col items-start gap-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:gap-6 md:items-end md:text-right">
            <div className="min-w-0 space-y-1">
              <p className="font-mono text-sm text-slate-100 whitespace-nowrap truncate">
                {formatTime(now)}
              </p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 whitespace-nowrap truncate">
                Control Plane · UTC{now.getTimezoneOffset() === 0 ? "" : ""}
              </p>
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 whitespace-nowrap truncate">
                Fleet Snapshot
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-mono text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 whitespace-nowrap">
                  Apps: {apps.length}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 whitespace-nowrap">
                  Active: {onlineCount}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="grid min-w-0 flex-1 grid-cols-1 gap-4 md:gap-5">
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
            {apps.map((app) => (
              <div key={app.id} className="min-w-0">
                <ControlCard
                  app={app}
                  onToggleMode={toggleAppMode}
                  onUpdateField={updateField}
                  onFlushCache={handleFlushCache}
                  onSaveConfig={handleSaveConfig}
                />
              </div>
            ))}
        </div>
      </main>
      </div>
    </div>
  );
}

export default function HomePage() {
  return <DashboardGrid />;
}

