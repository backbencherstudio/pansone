# API Integration Guide

## ✅ Connected APIs

The following APIs from your Postman collection are now connected:

### 1. Authentication APIs
- ✅ **POST /auth/login** - User login
  - Request: `{ email: string, password: string }`
  - Response: `{ success, authorization: { access_token, refresh_token }, type }`
  - Connected in: `app/login/page.tsx`

- ✅ **GET /auth/me** - Get current user
  - Response: `{ success, data: { id, name, email, type, ... } }`
  - Available in: `lib/api.ts` (authApi.getMe())

### 2. Info/URL APIs
- ✅ **POST /info** - Create or update URL (for iframe URL)
  - Request: `{ url: string, is_render: boolean }`
  - Response: `{ success, message, data: { id, url, is_render, ... } }`
  - Connected in: `handleSaveConfig()` function

- ✅ **GET /info** - Get URL
  - Request body: `{ url: string, is_render: boolean }`
  - Response: `{ success, message, data: { id, url, is_render, ... } }`
  - Available in: `lib/api.ts` (infoApi.getUrl())

- ✅ **POST /info/flush-cache** - Flush cache
  - Request: `{ url: string, is_render: boolean }`
  - Response: `{ success, message }`
  - Connected in: `handleFlushCache()` function

## ⚠️ Missing APIs (Need Backend Implementation)

Based on the dashboard functionality, the following endpoints need to be created in your NestJS backend:

### 1. Apps Management APIs

#### GET /apps
**Purpose**: Fetch all app configurations

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": "vest-timer-us",
      "name": "Vest Timer // US",
      "bundleId": "com.vest.timer.us",
      "status": "active" | "inactive" | "banned",
      "mode": "native" | "webview",
      "targetUrl": "https://vest-shell.net/launcher/us",
      "geoFencing": "US, CA",
      "iframeUrl": "https://example.com/iframe-content",
      "lastUpdated": "2025-11-29T08:35:16.755Z"
    }
  ]
}
```

#### GET /apps/:id
**Purpose**: Get specific app configuration

**Response Format**:
```json
{
  "success": true,
  "data": {
    "id": "vest-timer-us",
    "name": "Vest Timer // US",
    "bundleId": "com.vest.timer.us",
    "status": "active",
    "mode": "native",
    "targetUrl": "https://vest-shell.net/launcher/us",
    "geoFencing": "US, CA",
    "iframeUrl": "https://example.com/iframe-content",
    "lastUpdated": "2025-11-29T08:35:16.755Z"
  }
}
```

#### PATCH /apps/:id/mode
**Purpose**: Toggle app mode between native and webview

**Request Body**:
```json
{
  "mode": "native" | "webview"
}
```

**Response Format**:
```json
{
  "success": true,
  "message": "Mode updated successfully",
  "data": {
    "id": "vest-timer-us",
    "mode": "webview",
    "lastUpdated": "2025-11-29T08:35:16.755Z"
  }
}
```

#### PATCH /apps/:id/config
**Purpose**: Update app configuration (targetUrl, geoFencing, iframeUrl)

**Request Body**:
```json
{
  "targetUrl": "https://vest-shell.net/launcher/us",
  "geoFencing": "US, CA, GB",
  "iframeUrl": "https://example.com/iframe-content"
}
```

**Response Format**:
```json
{
  "success": true,
  "message": "Configuration updated successfully",
  "data": {
    "id": "vest-timer-us",
    "targetUrl": "https://vest-shell.net/launcher/us",
    "geoFencing": "US, CA, GB",
    "iframeUrl": "https://example.com/iframe-content",
    "lastUpdated": "2025-11-29T08:35:16.755Z"
  }
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

For production:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 📝 Implementation Notes

1. **Authentication**: All API requests automatically include the Bearer token from localStorage
2. **Error Handling**: Failed requests show user-friendly error messages
3. **Optimistic Updates**: UI updates immediately, then syncs with backend
4. **Fallback**: If apps API is not available, dashboard uses mock data with a warning

## 🚀 Next Steps

1. **Implement Missing Endpoints**: Create the apps management endpoints in your NestJS backend
2. **Database Schema**: Ensure your database has an `apps` table with the required fields
3. **Testing**: Test all endpoints with Postman before using in production
4. **Error Handling**: Add proper error handling and validation in backend
5. **Security**: Ensure all endpoints are properly secured with JWT authentication

## 📋 API Endpoint Summary

| Method | Endpoint | Status | Purpose |
|--------|----------|--------|---------|
| POST | /auth/login | ✅ Connected | User authentication |
| GET | /auth/me | ✅ Available | Get current user |
| POST | /info | ✅ Connected | Create/update iframe URL |
| GET | /info | ✅ Available | Get URL info |
| POST | /info/flush-cache | ✅ Connected | Flush cache |
| GET | /apps | ⚠️ Missing | Get all apps |
| GET | /apps/:id | ⚠️ Missing | Get app by ID |
| PATCH | /apps/:id/mode | ⚠️ Missing | Toggle app mode |
| PATCH | /apps/:id/config | ⚠️ Missing | Update app config |

