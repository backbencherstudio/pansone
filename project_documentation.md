# VestControl Shell App Management System - Complete Project Documentation

## Project Title
**VestControl: Remote Shell App Management Platform**

---

## Executive Summary

VestControl is a comprehensive management system that enables administrators to remotely control a network of mobile shell applications. These apps are disguised as legitimate utility apps (Stopwatch/Timer) but can be switched between "Safe Mode" (native functionality) and "Money Mode" (WebView gambling content) via a web-based control dashboard.

### Key Capabilities
- **Remote Mode Switching**: Instantly toggle apps between safe native mode and WebView mode
- **Configuration Management**: Update target URLs, geo-fencing rules, and app statuses
- **Cache Management**: Clear CDN and app caches remotely
- **Real-Time Monitoring**: View app status, last updated timestamps, and fleet health
- **Secure Admin Access**: JWT-based authentication for dashboard access
- **Multi-Platform Support**: Android and iOS apps targeting Chinese app stores

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Dashboard (Next.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Login      │  │  App Grid    │  │   Iframe     │      │
│  │   Screen     │  │  Dashboard   │  │   Display    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────┬──────────────────────────────────────┘
                        │ HTTPS / REST API
                        │ JWT Authentication
┌───────────────────────▼──────────────────────────────────────┐
│              Backend API (NestJS)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │   App Config │  │   Cache      │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Database (PostgreSQL/MySQL)              │   │
│  │  - AppConfigs  - AdminUsers  - AuditLogs            │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬──────────────────────────────────────┘
                        │ HTTPS / REST API
                        │ Polling / WebSocket
┌───────────────────────▼──────────────────────────────────────┐
│         Mobile Apps (Flutter - Android & iOS)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Native     │  │   WebView    │  │   API       │      │
│  │   Timer      │  │   Component  │  │   Client    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend Dashboard
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React (if needed)
- **State Management**: React Query / SWR
- **Authentication**: NextAuth.js or custom JWT
- **HTTP Client**: Fetch API / Axios

### Backend API
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL (recommended) or MySQL
- **ORM**: TypeORM or Prisma
- **Authentication**: JWT with bcrypt
- **Validation**: class-validator, class-transformer
- **Caching**: Redis (optional, for cache invalidation)

### Mobile App
- **Framework**: Flutter
- **Language**: Dart
- **Localization**: Chinese (Simplified)
- **WebView**: `webview_flutter` package
- **HTTP Client**: `dio` package
- **State Management**: Provider / Riverpod / Bloc
- **Platforms**: Android (min SDK 21), iOS (min iOS 12)

---

## Features

### Web Dashboard Features

#### 1. Authentication System
- **Login Screen**: Secure admin login with username/password
- **JWT Tokens**: Stateless authentication with refresh tokens
- **Session Management**: Automatic session timeout and logout
- **Protected Routes**: All dashboard routes require authentication

#### 2. App Management Dashboard
- **App Grid View**: Display all registered shell apps in a card-based grid
- **Real-Time Status**: Show app status (active/inactive/banned) with color coding
- **Mode Toggle**: Instant kill-switch between Native and WebView modes
- **Configuration Editor**: Update target URLs and geo-fencing rules
- **Last Updated Tracking**: Display timestamp of last configuration change

#### 3. Iframe Management
- **Iframe Display**: Show external content in a secure iframe
- **URL Management**: Backend stores and serves iframe URL
- **Cache Clearing**: Flush CDN and app caches when iframe URL changes
- **Security**: Sandbox attributes and proper CSP headers

#### 4. System Monitoring
- **Fleet Overview**: Total apps, active count, system status
- **Real-Time Clock**: UTC time display for coordination
- **Audit Trail**: Track all mode changes and config updates (future enhancement)

### Mobile App Features

#### 1. Native Timer/Stopwatch (Safe Mode)
- **Full Functionality**: Complete timer and stopwatch features
- **Chinese UI**: All text and labels in Simplified Chinese
- **Native Performance**: Smooth animations and native feel
- **Offline Capable**: Works without internet connection

#### 2. WebView Mode (Money Mode)
- **Dynamic Loading**: Load target URL from backend configuration
- **Seamless Transition**: Smooth switch from native to WebView
- **Error Handling**: Fallback to native mode if WebView fails
- **Security**: Proper WebView security settings

#### 3. API Integration
- **Configuration Fetching**: Poll backend for app configuration
- **Mode Detection**: Automatically switch based on backend response
- **Real-Time Updates**: Support for polling or WebSocket updates
- **Network Resilience**: Handle network errors gracefully

#### 4. App Store Compliance
- **Chinese Localization**: Full Chinese language support
- **Store Metadata**: Chinese descriptions and screenshots
- **Compliance**: Follow Chinese app store guidelines

---

## Data Flow

### Admin Updates App Configuration

```
1. Admin logs into dashboard
   ↓
2. Admin selects app from grid
   ↓
3. Admin toggles mode (Native → WebView)
   ↓
4. Frontend sends PATCH /api/apps/:id/mode
   ↓
5. Backend updates database
   ↓
6. Backend triggers cache invalidation (if needed)
   ↓
7. Backend returns updated config
   ↓
8. Frontend updates UI optimistically
   ↓
9. Mobile apps poll backend and receive new config
   ↓
10. Mobile apps switch mode accordingly
```

### Mobile App Startup Flow

```
1. User opens app (no login)
   ↓
2. App checks network connectivity
   ↓
3. App sends GET /api/apps/:bundleId
   ↓
4. Backend returns app configuration
   ↓
5. App checks mode field:
   - If "native" → Display native timer
   - If "webview" → Load targetUrl in WebView
   ↓
6. App starts polling backend every N seconds
   ↓
7. On mode change detected → Switch UI mode
```

### Iframe URL Update Flow

```
1. Admin updates iframe URL in dashboard
   ↓
2. Frontend sends PATCH /api/apps/:id/iframe-url
   ↓
3. Backend stores new URL in database
   ↓
4. Backend triggers cache flush
   ↓
5. Dashboard fetches new iframe URL
   ↓
6. Dashboard reloads iframe with new URL
```

---

## Database Schema

### AppConfigs Table

```sql
CREATE TABLE app_configs (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bundle_id VARCHAR(255) UNIQUE NOT NULL,
  status ENUM('active', 'inactive', 'banned') DEFAULT 'inactive',
  mode ENUM('native', 'webview') DEFAULT 'native',
  target_url TEXT NOT NULL,
  iframe_url TEXT,  -- Separate URL for dashboard iframe
  geo_fencing VARCHAR(500),  -- Comma-separated country codes
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_bundle_id (bundle_id),
  INDEX idx_status (status),
  INDEX idx_mode (mode)
);
```

### AdminUsers Table

```sql
CREATE TABLE admin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- bcrypt hashed
  role ENUM('admin', 'super_admin') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
);
```

### AuditLogs Table

```sql
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  app_id VARCHAR(255) NOT NULL,
  admin_user_id INT NOT NULL,
  action_type VARCHAR(50) NOT NULL,  -- 'mode_toggle', 'config_update', 'cache_flush'
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (app_id) REFERENCES app_configs(id),
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id),
  INDEX idx_app_id (app_id),
  INDEX idx_created_at (created_at)
);
```

---

## API Endpoints Specification

### Authentication Endpoints

```
POST   /api/auth/login
Body: { username: string, password: string }
Response: { token: string, refreshToken: string, user: AdminUser }

POST   /api/auth/refresh
Body: { refreshToken: string }
Response: { token: string }

POST   /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
Response: { message: "Logged out successfully" }
```

### App Configuration Endpoints

```
GET    /api/apps
Headers: { Authorization: "Bearer <token>" }
Response: AppConfig[]

GET    /api/apps/:id
Headers: { Authorization: "Bearer <token>" }
Response: AppConfig

GET    /api/apps/bundle/:bundleId
Headers: { Authorization: "Bearer <token>" } (optional for mobile)
Response: AppConfig

PATCH  /api/apps/:id/mode
Headers: { Authorization: "Bearer <token>" }
Body: { mode: "native" | "webview" }
Response: AppConfig

PATCH  /api/apps/:id/config
Headers: { Authorization: "Bearer <token>" }
Body: { targetUrl?: string, geoFencing?: string }
Response: AppConfig

PATCH  /api/apps/:id/iframe-url
Headers: { Authorization: "Bearer <token>" }
Body: { iframeUrl: string }
Response: AppConfig

POST   /api/apps/:id/flush-cache
Headers: { Authorization: "Bearer <token>" }
Response: { message: "Cache flushed", lastUpdated: timestamp }
```

---

## Mobile App Implementation Details

### Project Structure

```
flutter_app/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   ├── config/
│   │   ├── app_config.dart
│   │   └── api_config.dart
│   ├── models/
│   │   └── app_config_model.dart
│   ├── services/
│   │   ├── api_service.dart
│   │   └── config_service.dart
│   ├── screens/
│   │   ├── native_timer_screen.dart
│   │   └── webview_screen.dart
│   ├── widgets/
│   │   ├── timer_widget.dart
│   │   └── webview_widget.dart
│   └── l10n/
│       └── app_zh.arb  (Chinese localization)
├── android/
├── ios/
└── pubspec.yaml
```

### Key Implementation Points

1. **API Service**: Create a service to fetch app configuration from NestJS backend
2. **Mode Switching**: Implement a state management solution to handle mode changes
3. **WebView Security**: Configure WebView with proper security settings
4. **Polling Strategy**: Implement intelligent polling (exponential backoff on errors)
5. **Offline Handling**: Cache last known configuration for offline use
6. **Error Recovery**: Graceful fallback to native mode on any error

### Chinese Localization

All UI text must be in Simplified Chinese:
- App name: "计时器" or "秒表"
- Button labels: "开始", "暂停", "重置"
- Error messages: "网络错误", "无法加载内容"
- Settings: "设置", "关于"

---

## Security Considerations

### Dashboard Security
- **HTTPS Only**: All API communication over HTTPS
- **JWT Expiration**: Short-lived access tokens with refresh tokens
- **Rate Limiting**: Prevent brute force attacks on login
- **Input Validation**: Validate all inputs on backend
- **CORS**: Proper CORS configuration for API endpoints
- **XSS Protection**: Sanitize all user inputs
- **CSRF Protection**: Implement CSRF tokens for state-changing operations

### Mobile App Security
- **Certificate Pinning**: Pin SSL certificates for API endpoints
- **Obfuscation**: Code obfuscation for production builds
- **Root/Jailbreak Detection**: Detect and handle rooted/jailbroken devices
- **WebView Security**: Disable JavaScript injection vulnerabilities
- **Secure Storage**: Store sensitive data in secure storage (Keychain/Keystore)

### Backend Security
- **Password Hashing**: Use bcrypt with appropriate salt rounds
- **SQL Injection Prevention**: Use parameterized queries (ORM handles this)
- **API Rate Limiting**: Implement rate limiting per IP/user
- **Audit Logging**: Log all sensitive operations
- **Environment Variables**: Store secrets in environment variables

---

## Deployment Guide

### Dashboard Deployment (Next.js)

1. **Build**: `npm run build`
2. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Backend API URL
   - `NEXTAUTH_SECRET`: Secret for NextAuth
   - `NEXTAUTH_URL`: Dashboard URL
3. **Deploy**: Vercel, Netlify, or custom server
4. **Domain**: Configure custom domain with SSL

### Backend Deployment (NestJS)

1. **Build**: `npm run build`
2. **Environment Variables**:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret for JWT tokens
   - `JWT_EXPIRES_IN`: Token expiration time
   - `PORT`: Server port (default 3000)
3. **Database**: Set up PostgreSQL instance
4. **Deploy**: Docker container, PM2, or cloud service (AWS, GCP, Azure)
5. **Reverse Proxy**: Configure Nginx for HTTPS

### Mobile App Deployment

1. **Android**:
   - Generate signed APK/AAB
   - Upload to Chinese app stores (华为, 小米, etc.)
   - Configure store metadata in Chinese

2. **iOS**:
   - Archive and sign with distribution certificate
   - Upload to App Store Connect
   - Configure Chinese metadata
   - Submit for review

---

## Testing Strategy

### Unit Tests
- Test API service functions
- Test mode switching logic
- Test configuration parsing

### Integration Tests
- Test API endpoints with test database
- Test authentication flow
- Test cache clearing functionality

### E2E Tests
- Test complete admin workflow
- Test mobile app mode switching
- Test error scenarios

### Manual Testing Checklist
- [ ] Admin can log in
- [ ] Dashboard displays all apps
- [ ] Mode toggle works
- [ ] Config updates persist
- [ ] Cache clearing works
- [ ] Mobile app fetches config
- [ ] Mobile app switches modes
- [ ] Chinese localization works
- [ ] Error handling works

---

## Future Enhancements

1. **WebSocket Support**: Real-time mode updates without polling
2. **Bulk Operations**: Toggle multiple apps at once
3. **Scheduled Changes**: Schedule mode changes for specific times
4. **Analytics Dashboard**: Track app usage and mode distribution
5. **Multi-Language Dashboard**: Support Chinese for dashboard UI
6. **Advanced Geo-Fencing**: More granular location-based rules
7. **App Version Management**: Control which app versions receive updates
8. **A/B Testing**: Test different configurations on subsets of users

---

## Support & Maintenance

### Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor API response times
- Track database performance
- Monitor mobile app crash reports

### Backup Strategy
- Daily database backups
- Version control for all code
- Document all configuration changes

### Update Process
1. Test changes in staging environment
2. Deploy backend first
3. Deploy dashboard
4. Update mobile apps (if needed)
5. Monitor for errors

---

## Contact & Documentation

- **Project Repository**: [GitHub URL]
- **API Documentation**: `/docs/api-endpoints.md`
- **Mobile Setup Guide**: `/docs/mobile-app-setup.md`
- **Deployment Guide**: `/docs/deployment.md`

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0
**Status**: In Development

