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
];


