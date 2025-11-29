/**
 * API Service for VestControl Dashboard
 * Base URL should be set in environment variable NEXT_PUBLIC_API_URL
 */

// Default to port 3001 for NestJS backend (Next.js runs on 3000)
// Set NEXT_PUBLIC_API_URL in .env.local to override
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  is_otp_sent: boolean;
  message: string;
  authorization: {
    type: string;
    access_token: string;
    refresh_token: string;
  };
  type: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  phone_number: string | null;
  country: string | null;
  state: string | null;
  type: string;
  created_at: string;
}

interface UserResponse {
  success: boolean;
  data: UserData;
}

interface UrlRequest {
  url: string;
  is_render: boolean;
}

interface UrlResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    created_at: string;
    updated_at: string;
    url: string;
    is_render: boolean;
  };
}

interface FlushCacheRequest {
  url: string;
  is_render: boolean;
}

interface FlushCacheResponse {
  success: boolean;
  message: string;
}

/**
 * Get stored access token
 */
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

/**
 * Set access token
 */
function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", token);
}

/**
 * Remove access token
 */
function removeAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("auth_user");
}

/**
 * Make API request with authentication
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - clear tokens and redirect to login
        removeAccessToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Unauthorized");
      }
      
      // Handle 404 - API endpoint not found
      if (response.status === 404) {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("text/html")) {
          // HTML response means we hit Next.js instead of backend
          throw new Error(
            `Backend API not found at ${url}.\n\n` +
            `Please ensure:\n` +
            `1. NestJS backend is running on ${API_BASE_URL}\n` +
            `2. Create .env.local file with: NEXT_PUBLIC_API_URL=http://localhost:3001\n` +
            `3. Restart Next.js server after creating .env.local\n` +
            `4. Backend endpoint ${endpoint} exists`
          );
        }
        throw new Error(`API endpoint not found: ${endpoint}`);
      }
      
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // Handle network errors (Failed to fetch, connection refused, etc.)
    if (error instanceof TypeError && (error.message.includes("fetch") || error.message.includes("Failed"))) {
      throw new Error(
        `Cannot connect to backend at ${url}.\n\n` +
        `Possible causes:\n` +
        `1. Backend server is not running - Start NestJS backend with: npm run start:dev\n` +
        `2. Wrong port number - Check if backend is on port 3001 (or update .env.local)\n` +
        `3. .env.local file missing - Created at: ${typeof window !== "undefined" ? window.location.origin : "project root"}\n` +
        `4. Server not restarted - Restart Next.js server after creating .env.local\n` +
        `5. CORS issue - Check backend CORS settings allow http://localhost:3000`
      );
    }
    throw error;
  }
}

/**
 * Auth API
 */
export const authApi = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.authorization?.access_token) {
      setAccessToken(response.authorization.access_token);
      if (typeof window !== "undefined") {
        localStorage.setItem("refresh_token", response.authorization.refresh_token);
        localStorage.setItem("auth_user", JSON.stringify({ email, type: response.type }));
      }
    }

    return response;
  },

  /**
   * Get current user info
   */
  async getMe(): Promise<UserResponse> {
    return apiRequest<UserResponse>("/auth/me");
  },

  /**
   * Logout (clear tokens)
   */
  logout(): void {
    removeAccessToken();
  },
};

/**
 * Info/URL API
 */
export const infoApi = {
  /**
   * Create or update URL (for iframe URL management)
   */
  async createOrUpdateUrl(url: string, isRender: boolean = false): Promise<UrlResponse> {
    return apiRequest<UrlResponse>("/info", {
      method: "POST",
      body: JSON.stringify({ url, is_render: isRender }),
    });
  },

  /**
   * Get URL info
   * Based on Postman screenshot, GET /info returns the saved URL and is_render status
   * Note: Some backends accept body in GET, but standard is query params
   */
  async getUrl(url?: string, isRender?: boolean): Promise<UrlResponse> {
    // If URL is provided, use it in query params or body
    if (url !== undefined) {
      // Try with query params first (standard approach)
      const params = new URLSearchParams();
      if (url) params.append("url", url);
      if (isRender !== undefined) params.append("is_render", String(isRender));
      const queryString = params.toString();
      return apiRequest<UrlResponse>(`/info${queryString ? `?${queryString}` : ""}`);
    }
    
    // If no URL provided, just get the current saved info
    return apiRequest<UrlResponse>("/info");
  },

  /**
   * Flush cache for a URL
   */
  async flushCache(url: string, isRender: boolean = false): Promise<FlushCacheResponse> {
    return apiRequest<FlushCacheResponse>("/info/flush-cache", {
      method: "POST",
      body: JSON.stringify({ url, is_render: isRender }),
    });
  },
};

/**
 * Apps API (These endpoints may need to be created in the backend)
 * Based on the dashboard requirements, we need:
 */
export const appsApi = {
  /**
   * Get all apps
   * TODO: Backend needs to implement GET /apps
   */
  async getAllApps(): Promise<ApiResponse<any[]>> {
    // This endpoint is not shown in Postman screenshots
    // You may need to create this in your backend
    try {
      return apiRequest<ApiResponse<any[]>>("/apps");
    } catch (error) {
      console.warn("GET /apps endpoint not available, using mock data");
      throw error;
    }
  },

  /**
   * Get app by ID
   * TODO: Backend needs to implement GET /apps/:id
   */
  async getAppById(id: string): Promise<ApiResponse<any>> {
    try {
      return apiRequest<ApiResponse<any>>(`/apps/${id}`);
    } catch (error) {
      console.warn("GET /apps/:id endpoint not available");
      throw error;
    }
  },

  /**
   * Toggle app mode (native/webview)
   * TODO: Backend needs to implement PATCH /apps/:id/mode
   */
  async toggleMode(id: string, mode: "native" | "webview"): Promise<ApiResponse<any>> {
    try {
      return apiRequest<ApiResponse<any>>(`/apps/${id}/mode`, {
        method: "PATCH",
        body: JSON.stringify({ mode }),
      });
    } catch (error) {
      console.warn("PATCH /apps/:id/mode endpoint not available");
      throw error;
    }
  },

  /**
   * Update app configuration
   * TODO: Backend needs to implement PATCH /apps/:id/config
   */
  async updateConfig(
    id: string,
    config: { targetUrl?: string; geoFencing?: string; iframeUrl?: string }
  ): Promise<ApiResponse<any>> {
    try {
      return apiRequest<ApiResponse<any>>(`/apps/${id}/config`, {
        method: "PATCH",
        body: JSON.stringify(config),
      });
    } catch (error) {
      console.warn("PATCH /apps/:id/config endpoint not available");
      throw error;
    }
  },
};

