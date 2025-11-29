"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppConfig, AppMode } from "../types/app";
import { MOCK_APPS } from "../types/app";
import { infoApi, authApi } from "../lib/api";

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
  onUpdateField: (id: string, field: "targetUrl" | "geoFencing" | "iframeUrl", value: string) => void;
  onFlushCache: (id: string) => void;
  onSaveConfig: (id: string) => void;
  onShowIframe?: (id: string) => void;
  isPreviewOpen?: boolean;
}

function ControlCard({
  app,
  onToggleMode,
  onUpdateField,
  onFlushCache,
  onSaveConfig,
  onShowIframe,
  isPreviewOpen,
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
      className={`group relative flex min-h-[420px] min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 sm:min-h-[420px] sm:gap-5 sm:rounded-3xl sm:p-6 ${cardGlow}`}
    >
      <div className="flex min-w-0 flex-col items-start justify-between gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <h2
              className="text-xs font-semibold tracking-wide text-slate-100 whitespace-nowrap truncate sm:text-sm"
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
              className="text-[10px] font-mono text-slate-400 whitespace-nowrap truncate sm:text-xs"
              title={app.bundleId}
            >
              {app.bundleId}
            </p>
          </div>
        </div>
        <div className="flex min-w-0 flex-col items-start gap-1 text-[10px] text-slate-500 sm:items-end sm:text-xs">
          <span className={`${statusColor} font-mono whitespace-nowrap truncate`}>
            {statusLabel}
          </span>
          <span
            className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap truncate sm:text-[10px]"
            title={`Last touch · ${formatLastUpdated(app.lastUpdated)}`}
          >
            Last touch · {formatLastUpdated(app.lastUpdated)}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-4">
        <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 whitespace-nowrap truncate font-mono sm:text-[11px]">
            Kill Switch
          </p>
          <p
            className="text-[11px] font-mono text-slate-300 whitespace-nowrap truncate sm:text-xs"
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-4">
        <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 font-mono sm:gap-3 sm:text-[11px]">
              <span className="whitespace-nowrap truncate">Target URL</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-mono whitespace-nowrap truncate sm:px-2 sm:text-[10px] ${
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
              className={`w-full truncate rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] font-mono text-slate-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] outline-none transition-all duration-200 whitespace-nowrap placeholder:text-slate-500 sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs ${
                isReadonly
                  ? "opacity-60"
                  : "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
              }`}
              placeholder="https://vest-shell.net/launcher/region"
              title={app.targetUrl}
            />
          </div>

            <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 font-mono sm:gap-3 sm:text-[11px]">
              <span className="whitespace-nowrap truncate">Geo-Fence</span>
              <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap truncate sm:text-[10px]">
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
              className={`w-full truncate rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] font-mono text-slate-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] outline-none transition-all duration-200 whitespace-nowrap placeholder:text-slate-500 sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs ${
                isReadonly
                  ? "opacity-60"
                  : "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
              }`}
              placeholder="US, CA, GB"
              title={app.geoFencing}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 font-mono sm:gap-3 sm:text-[11px]">
              <span className="whitespace-nowrap truncate">Iframe URL</span>
              <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap truncate sm:text-[10px]">
                Dashboard preview
              </span>
            </div>
            <input
              type="url"
              value={app.iframeUrl || ""}
              onChange={(e) =>
                onUpdateField(app.id, "iframeUrl", e.target.value)
              }
              className="w-full truncate rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] font-mono text-slate-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] outline-none transition-all duration-200 whitespace-nowrap placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40 sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs"
              placeholder="https://example.com/iframe-content"
              title={app.iframeUrl || ""}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-[11px] text-slate-400 backdrop-blur-lg sm:rounded-2xl sm:px-4 sm:py-4 sm:text-xs">
            <p className="font-semibold text-slate-100 whitespace-nowrap truncate text-xs sm:text-sm">
              Runtime Signals
            </p>
            <ul className="mt-1.5 space-y-0.5 text-[10px] font-mono text-slate-400 sm:mt-2 sm:space-y-1 sm:text-[11px]">
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

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={() => onFlushCache(app.id)}
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-rose-400/50 bg-rose-500/10 px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-200 shadow-[0_0_30px_-12px_rgba(244,63,94,0.6)] transition-all duration-150 hover:border-rose-300 hover:text-rose-50 hover:shadow-[0_0_36px_-10px_rgba(244,63,94,0.8)] disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/5 disabled:text-slate-500 disabled:shadow-none sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-xs"
              disabled={app.status !== "active"}
            >
              Flush Cache
            </button>
            <button
              type="button"
              onClick={() => onSaveConfig(app.id)}
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-indigo-500/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-50 shadow-[0_0_30px_-12px_rgba(99,102,241,0.8)] transition-all duration-150 hover:bg-indigo-400 hover:shadow-[0_0_36px_-10px_rgba(165,180,252,0.9)] disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-slate-500 disabled:shadow-none sm:rounded-xl sm:px-3.5 sm:py-1.5 sm:text-xs"
              disabled={app.status === "banned"}
            >
              Save Config
            </button>
          </div>
        </div>

        {app.iframeUrl && onShowIframe && (
          <div className="mt-3 sm:mt-4">
            <button
              type="button"
              onClick={() => onShowIframe(isPreviewOpen ? "" : app.id)}
              className={`w-full rounded-lg border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-150 sm:rounded-xl sm:px-4 sm:text-xs ${
                isPreviewOpen
                  ? "border-indigo-400/70 bg-indigo-500/20 text-indigo-100"
                  : "border-indigo-400/50 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20"
              }`}
            >
              {isPreviewOpen ? "Hide Preview" : "View Iframe Preview"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

interface IframeDisplayProps {
  app: DashboardApp;
  onClose: () => void;
}

function IframeDisplay({ app, onClose }: IframeDisplayProps) {
  const [iframeKey, setIframeKey] = useState(0);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  if (!app.iframeUrl) {
    return (
      <div className="flex min-h-[600px] items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl">
        <div className="text-center text-slate-400">
          <p className="text-sm">No iframe URL configured for this app.</p>
          <button
            onClick={onClose}
            className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 transition-all duration-150 hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 p-3 backdrop-blur-xl sm:rounded-3xl sm:p-4 lg:p-6">
      <div className="w-full max-w-full lg:max-w-md">
        <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-100 sm:text-sm">Mobile Preview</h3>
            <p className="mt-0.5 text-[10px] font-mono text-slate-400 truncate sm:mt-1 sm:text-xs">{app.iframeUrl}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300 transition-all duration-150 hover:bg-white/10 sm:flex-none sm:rounded-xl sm:px-3 sm:text-xs"
            >
              Refresh
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300 transition-all duration-150 hover:bg-white/10 sm:flex-none sm:rounded-xl sm:px-3 sm:text-xs"
            >
              Close
            </button>
          </div>
        </div>

        {/* Mobile Device Frame */}
        <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[375px]">
          {/* Device Frame */}
          <div className="relative rounded-[2rem] border-[6px] border-slate-800 bg-slate-900 p-1.5 shadow-[0_0_60px_rgba(0,0,0,0.8)] sm:rounded-[2.5rem] sm:border-[8px] sm:p-2">
            {/* Status Bar */}
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between rounded-t-[1.5rem] bg-slate-900 px-4 py-1.5 text-[9px] font-mono text-slate-400 sm:rounded-t-[1.75rem] sm:px-6 sm:py-2 sm:text-[10px]">
              <span>9:41</span>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <div className="h-0.5 w-0.5 rounded-full bg-slate-400 sm:h-1 sm:w-1" />
                <div className="h-0.5 w-0.5 rounded-full bg-slate-400 sm:h-1 sm:w-1" />
                <div className="h-0.5 w-0.5 rounded-full bg-slate-400 sm:h-1 sm:w-1" />
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <div className="h-1.5 w-3 rounded-sm border border-slate-400 sm:h-2 sm:w-4">
                  <div className="h-full w-3/4 rounded-sm bg-slate-400" />
                </div>
                <div className="h-1.5 w-1.5 rounded-full border border-slate-400 sm:h-2 sm:w-2" />
              </div>
            </div>

            {/* Screen Content */}
            <div className="relative mt-6 h-[500px] w-full overflow-hidden rounded-[1.25rem] bg-slate-950 sm:mt-8 sm:h-[667px] sm:rounded-[1.5rem]">
              <iframe
                key={iframeKey}
                src={app.iframeUrl}
                className="h-full w-full"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                title={`Mobile preview for ${app.name}`}
              />
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-1.5 left-1/2 z-10 h-0.5 w-24 -translate-x-1/2 rounded-full bg-slate-700 sm:bottom-2 sm:h-1 sm:w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardGrid() {
  const router = useRouter();
  const [apps, setApps] = useState<DashboardApp[]>(() => [...MOCK_APPS]);
  const [now, setNow] = useState<Date>(() => new Date());
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch from /info endpoint (not /apps)
      const response = await infoApi.getUrl();
      if (response.success && response.data) {
        // Map /info response to AppConfig format
        // is_render: false = native mode, true = webview mode
        const mode: AppMode = response.data.is_render ? "webview" : "native";
        const url = response.data.url || "";
        
        // Transform to app structure (using first mock app as template)
        const app: DashboardApp = {
          ...MOCK_APPS[0], // Use first mock app as base
          id: response.data.id || MOCK_APPS[0].id,
          mode: mode,
          targetUrl: url,
          iframeUrl: url, // Use same URL for iframe
          lastUpdated: response.data.updated_at ? new Date(response.data.updated_at) : new Date(),
        };
        
        setApps([app]);
        setError(null); // Clear any previous errors
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.warn("Failed to load data from /info API, using mock data:", err);
      
      // Show specific error message
      if (errorMessage.includes("Cannot connect")) {
        setError(
          `Cannot connect to backend API. Please ensure:\n` +
          `1. Backend is running at http://192.168.4.13:5001\n` +
          `2. CORS is configured correctly\n` +
          `Using mock data as fallback.`
        );
      } else if (errorMessage.includes("404") || errorMessage.includes("not found")) {
        setError(
          `API endpoint /api/info not found in backend.\n` +
          `Please ensure GET /api/info endpoint exists.\n` +
          `Using mock data as fallback.`
        );
      } else {
        setError(`API error: ${errorMessage}. Using mock data as fallback.`);
      }
      
      // Keep using mock data
      setApps([...MOCK_APPS]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authentication on mount and load apps
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch apps on mount
    loadApps();
  }, [router, loadApps]);

  const handleLogout = () => {
    authApi.logout();
    router.push("/login");
  };

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

  const toggleAppMode = async (id: string) => {
    const app = apps.find((a) => a.id === id);
    if (!app) return;

    const newMode = app.mode === "native" ? "webview" : "native";
    // Map mode to is_render: native = false, webview = true
    const isRender = newMode === "webview";

    // Optimistic update
    setApps((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              mode: newMode,
              lastUpdated: new Date(),
            }
          : a,
      ),
    );

    try {
      // Update via /info API with is_render flag
      await infoApi.createOrUpdateUrl(app.targetUrl || "", isRender);
      // Reload to get updated data
      await loadApps();
    } catch (err) {
      // Revert on error
      setApps((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                mode: app.mode, // Revert to original
              }
            : a,
        ),
      );
      console.error("Failed to toggle mode:", err);
      alert("Failed to toggle mode. Please try again.");
    }
  };

  const updateField = (
    id: string,
    field: "targetUrl" | "geoFencing" | "iframeUrl",
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

  const handleFlushCache = async (id: string) => {
    const app = apps.find((a) => a.id === id);
    if (!app || !app.targetUrl) {
      alert("No URL configured for this app");
      return;
    }

    try {
      await infoApi.flushCache(app.targetUrl, app.mode === "webview");
      touchApp(id);
      alert("Cache flushed successfully");
    } catch (err) {
      console.error("Failed to flush cache:", err);
      alert("Failed to flush cache. Please try again.");
    }
  };

  const handleSaveConfig = async (id: string) => {
    const app = apps.find((a) => a.id === id);
    if (!app) return;

    try {
      // Map mode to is_render: native = false, webview = true
      const isRender = app.mode === "webview";
      
      // Update via /info API - use targetUrl or iframeUrl (prefer iframeUrl)
      const urlToSave = app.iframeUrl || app.targetUrl || "";
      
      if (!urlToSave) {
        alert("Please provide a URL to save");
        return;
      }

      // Update URL and is_render via /info API
      await infoApi.createOrUpdateUrl(urlToSave, isRender);
      
      // Reload to get updated data
      await loadApps();
      alert("Configuration saved successfully");
    } catch (err) {
      console.error("Failed to save config:", err);
      alert("Failed to save configuration. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_55%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.2),transparent_60%)]" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:px-8 lg:py-10">
        <header className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl shadow-[0_0_60px_-20px_rgba(15,118,235,0.35)] sm:gap-4 sm:rounded-3xl sm:p-5 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2">
            <div className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-200 shadow-[0_0_22px_rgba(16,185,129,0.45)] sm:gap-2 sm:px-3 sm:py-1 sm:text-[11px]">
              <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.9)] sm:h-1.5 sm:w-1.5" />
              <span className="truncate">System Status: Online</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight text-slate-50 whitespace-nowrap truncate sm:text-xl md:text-2xl">
                VestControl // Admin
              </h1>
              <p className="mt-0.5 text-xs text-slate-400 whitespace-nowrap truncate sm:mt-1 sm:text-sm">
                Remote kill-switch for Vest shell apps · Safe &lt;&gt; Money mode
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col items-start gap-2 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:gap-6 sm:text-xs md:items-end md:text-right">
            <div className="min-w-0 space-y-0.5 sm:space-y-1">
              <p className="font-mono text-xs text-slate-100 whitespace-nowrap truncate sm:text-sm">
                {formatTime(now)}
              </p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500 whitespace-nowrap truncate sm:text-[11px]">
                Control Plane · UTC{now.getTimezoneOffset() === 0 ? "" : ""}
              </p>
            </div>
            <div className="min-w-0 space-y-0.5 sm:space-y-1">
              <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500 whitespace-nowrap truncate sm:text-[11px]">
                Fleet Snapshot
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-300 sm:gap-3 sm:text-xs">
                <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 whitespace-nowrap sm:px-2 sm:py-1">
                  Apps: {apps.length}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 whitespace-nowrap sm:px-2 sm:py-1">
                  Active: {onlineCount}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300 transition-all duration-150 hover:bg-white/10 hover:text-slate-100 sm:w-auto sm:rounded-xl sm:px-3 sm:text-xs"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:gap-4 md:gap-5">
          {error && (
            <div className="col-span-full rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-slate-400">Loading apps...</div>
            </div>
          ) : (
            apps.map((app) => (
            <div
              key={app.id}
              className={`grid min-w-0 grid-cols-1 gap-3 sm:gap-4 ${
                selectedAppId === app.id
                  ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                  : ""
              }`}
            >
              <div className="min-w-0">
                <ControlCard
                  app={app}
                  onToggleMode={toggleAppMode}
                  onUpdateField={updateField}
                  onFlushCache={handleFlushCache}
                  onSaveConfig={handleSaveConfig}
                  onShowIframe={setSelectedAppId}
                  isPreviewOpen={selectedAppId === app.id}
                />
              </div>

              {selectedAppId === app.id && (
                <div className="min-w-0 lg:flex lg:items-start lg:justify-center">
                  <IframeDisplay
                    app={app}
                    onClose={() => setSelectedAppId(null)}
                  />
                </div>
              )}
            </div>
          ))
          )}
      </main>
      </div>
    </div>
  );
}

export default function HomePage() {
  return <DashboardGrid />;
}

