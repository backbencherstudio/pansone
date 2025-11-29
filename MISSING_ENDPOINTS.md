# ⚠️ Missing Backend Endpoints

## Yellow Alert কারণ

Yellow alert দেখাচ্ছে কারণ **`/api/apps` endpoint backend এ implement করা নেই**।

---

## ✅ Required Backend Endpoints

আপনার NestJS backend এ এই endpoints implement করতে হবে:

### 1. GET /api/apps
**Purpose:** সব apps list fetch করা

**Request:**
```
GET http://192.168.4.13:5001/api/apps
Headers:
  Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "vest-timer-us",
      "name": "Vest Timer // US",
      "bundleId": "com.vest.timer.us",
      "status": "active",
      "mode": "native",
      "targetUrl": "https://vest-shell.net/launcher/us",
      "geoFencing": "US, CA",
      "iframeUrl": "https://example.com/dashboard-preview",
      "lastUpdated": "2025-11-01T10:15:00Z"
    }
  ]
}
```

### 2. PATCH /api/apps/:id/mode
**Purpose:** App mode toggle করা (native/webview)

**Request:**
```
PATCH http://192.168.4.13:5001/api/apps/vest-timer-us/mode
Headers:
  Authorization: Bearer <access_token>
Body:
{
  "mode": "webview"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "vest-timer-us",
    "mode": "webview",
    "lastUpdated": "2025-11-01T10:15:00Z"
  }
}
```

### 3. PATCH /api/apps/:id/config
**Purpose:** App configuration update করা

**Request:**
```
PATCH http://192.168.4.13:5001/api/apps/vest-timer-us/config
Headers:
  Authorization: Bearer <access_token>
Body:
{
  "targetUrl": "https://vest-shell.net/launcher/us",
  "geoFencing": "US, CA",
  "iframeUrl": "https://example.com/dashboard-preview"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "vest-timer-us",
    "targetUrl": "https://vest-shell.net/launcher/us",
    "geoFencing": "US, CA",
    "iframeUrl": "https://example.com/dashboard-preview"
  }
}
```

---

## 🔧 NestJS Implementation Example

### Controller (`apps.controller.ts`):

```typescript
import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AppsService } from './apps.service';

@Controller('apps')
@UseGuards(JwtAuthGuard)
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get()
  async getAllApps() {
    const apps = await this.appsService.findAll();
    return {
      success: true,
      data: apps,
    };
  }

  @Patch(':id/mode')
  async toggleMode(@Param('id') id: string, @Body() body: { mode: 'native' | 'webview' }) {
    const app = await this.appsService.updateMode(id, body.mode);
    return {
      success: true,
      data: app,
    };
  }

  @Patch(':id/config')
  async updateConfig(
    @Param('id') id: string,
    @Body() body: { targetUrl?: string; geoFencing?: string; iframeUrl?: string }
  ) {
    const app = await this.appsService.updateConfig(id, body);
    return {
      success: true,
      data: app,
    };
  }
}
```

### Service (`apps.service.ts`):

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from './entities/app-config.entity';

@Injectable()
export class AppsService {
  constructor(
    @InjectRepository(AppConfig)
    private appConfigRepository: Repository<AppConfig>,
  ) {}

  async findAll(): Promise<AppConfig[]> {
    return this.appConfigRepository.find();
  }

  async updateMode(id: string, mode: 'native' | 'webview'): Promise<AppConfig> {
    const app = await this.appsService.findOne(id);
    app.mode = mode;
    app.lastUpdated = new Date();
    return this.appConfigRepository.save(app);
  }

  async updateConfig(
    id: string,
    config: { targetUrl?: string; geoFencing?: string; iframeUrl?: string }
  ): Promise<AppConfig> {
    const app = await this.appsService.findOne(id);
    if (config.targetUrl) app.targetUrl = config.targetUrl;
    if (config.geoFencing) app.geoFencing = config.geoFencing;
    if (config.iframeUrl) app.iframeUrl = config.iframeUrl;
    app.lastUpdated = new Date();
    return this.appConfigRepository.save(app);
  }
}
```

---

## ✅ After Implementation

1. **Backend এ endpoints implement করুন**
2. **Test করুন Postman দিয়ে**
3. **Next.js server restart করুন** (যদি running থাকে)
4. **Dashboard refresh করুন** - Yellow alert চলে যাবে

---

## 🔍 Verify Endpoint Exists

Test করুন:

```bash
# With authentication token
curl -X GET http://192.168.4.13:5001/api/apps \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** JSON response with apps array
**If 404:** Endpoint not implemented yet

---

## 📝 Current Status

| Endpoint | Status | Notes |
|----------|--------|-------|
| POST /api/auth/login | ✅ Working | Already implemented |
| GET /api/apps | ❌ Missing | **Need to implement** |
| PATCH /api/apps/:id/mode | ❌ Missing | **Need to implement** |
| PATCH /api/apps/:id/config | ❌ Missing | **Need to implement** |

---

## 🚀 Quick Fix (Temporary)

যদি এখনই endpoints implement করতে না পারেন, yellow alert hide করতে পারেন:

`app/page.tsx` line 663-667 এ comment out করুন:

```typescript
{/* Temporarily hide error alert
{error && (
  <div className="col-span-full rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
    {error}
  </div>
)}
*/}
```

**But this is not recommended** - Better to implement the endpoints properly.

