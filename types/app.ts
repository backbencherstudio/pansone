export type AppStatus = "active" | "inactive" | "banned";

export type AppMode = "native" | "webview";

export interface AppConfig {
  id: string;
  name: string;
  bundleId: string;
  status: AppStatus;
  mode: AppMode;
  /**
   * The redirect URL used when the app is in WebView / Money Mode.
   */
  targetUrl: string;
  /**
   * Comma-separated list of ISO country codes ( "US, CA, CN").
   */
  geoFencing: string;
  lastUpdated: Date;
}

export const MOCK_APPS: AppConfig[] = [
  {
    id: "vest-timer-us",
    name: "Vest Timer // US",
    bundleId: "com.vest.timer.us",
    status: "active",
    mode: "native",
    targetUrl: "https://vest-shell.net/launcher/us",
    geoFencing: "US, CA",
    lastUpdated: new Date("2025-11-01T10:15:00Z"),
  },
  {
    id: "vest-calc-eu",
    name: "Vest Calc // EU",
    bundleId: "com.vest.calc.eu",
    status: "active",
    mode: "webview",
    targetUrl: "https://vest-shell.net/launcher/eu",
    geoFencing: "DE, FR, ES, IT",
    lastUpdated: new Date("2025-11-02T08:42:00Z"),
  },
  {
    id: "vest-shell-row",
    name: "Vest Shell // RoW",
    bundleId: "com.vest.shell.global",
    status: "inactive",
    mode: "native",
    targetUrl: "https://vest-shell.net/launcher/global",
    geoFencing: "GB, BR, MX, AU",
    lastUpdated: new Date("2025-11-05T21:03:00Z"),
  },
  {
    id: "vest-pro-highrisk",
    name: "Vest Pro // High-Risk",
    bundleId: "com.vest.pro.hr",
    status: "banned",
    mode: "webview",
    targetUrl: "https://vest-shell.net/launcher/hr",
    geoFencing: "SG, HK",
    lastUpdated: new Date("2025-11-10T16:27:00Z"),
  },
];


