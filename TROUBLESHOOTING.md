# 🔴 Login Error Fix - Step by Step

## Current Error: "Failed to fetch"

এই error মানে backend server reach করা যাচ্ছে না।

---

## ✅ Quick Fix (3 Steps)

### Step 1: Create `.env.local` File

**Location:** `D:\clook\clook\.env.local`

**Content:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**How to create:**
1. Project root folder এ যান (`D:\clook\clook`)
2. New file তৈরি করুন নাম `.env.local`
3. উপরের content paste করুন
4. Save করুন

### Step 2: Check Backend is Running

**NestJS backend start করুন:**

```bash
# আপনার NestJS backend project folder এ যান
cd D:\path\to\your\nestjs-backend

# Backend start করুন
npm run start:dev
```

**Check করুন:**
- Console এ দেখতে হবে: `Application is running on: http://localhost:3001`
- কোনো error থাকলে fix করুন

### Step 3: Restart Next.js Server

```bash
# Next.js project এ
cd D:\clook\clook

# Server stop করুন (Ctrl+C)
# তারপর restart করুন
npm run dev
```

---

## 🔍 Verify Backend is Working

### Test 1: Check Backend Port

Browser এ open করুন:
```
http://localhost:3001
```

**Expected:**
- NestJS welcome page অথবা
- 404 (normal, মানে server running আছে)

**If error:**
- Backend start করুন

### Test 2: Test Login Endpoint

**PowerShell/Command Prompt এ:**

```powershell
curl -X POST http://localhost:3001/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@website.com\",\"password\":\"AdminPassword123!\"}'
```

**Or use Postman:**
- URL: `POST http://localhost:3001/auth/login`
- Body (JSON):
```json
{
  "email": "admin@website.com",
  "password": "AdminPassword123!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "authorization": {
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

**If 404:**
- Backend এ `/auth/login` endpoint আছে কিনা check করুন

**If Connection Refused:**
- Backend running নেই
- Port number check করুন

---

## 🚨 Common Issues

### Issue 1: Backend Not Running

**Symptoms:**
- "Failed to fetch" error
- Network tab shows red failed request

**Solution:**
```bash
# NestJS backend start করুন
cd /path/to/nestjs-backend
npm run start:dev
```

### Issue 2: Wrong Port Number

**Symptoms:**
- Request going to wrong port
- 404 error

**Solution:**
1. Check NestJS backend port (usually in `main.ts`):
   ```typescript
   await app.listen(3001); // Check this number
   ```

2. Update `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:YOUR_PORT
   ```

3. Restart Next.js server

### Issue 3: CORS Error

**Symptoms:**
- "CORS policy" error in console
- Request blocked

**Solution:**
NestJS `main.ts` এ add করুন:
```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

### Issue 4: .env.local Not Loading

**Symptoms:**
- Environment variable not working
- Still using default port

**Solution:**
1. File name exactly `.env.local` (not `.env.local.txt`)
2. Project root এ আছে কিনা check করুন
3. Next.js server restart করুন
4. Check console: `console.log(process.env.NEXT_PUBLIC_API_URL)`

---

## ✅ Verification Checklist

- [ ] `.env.local` file exists in project root
- [ ] `NEXT_PUBLIC_API_URL` is set correctly
- [ ] NestJS backend is running
- [ ] Backend port matches `.env.local`
- [ ] Backend `/auth/login` endpoint exists
- [ ] CORS is configured in backend
- [ ] Next.js server restarted after `.env.local` creation
- [ ] No firewall blocking connection

---

## 🧪 Test Backend Connection

Create a test file `test-backend.js`:

```javascript
// Run: node test-backend.js
fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@website.com',
    password: 'AdminPassword123!'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**If this works:** Backend is fine, issue is in frontend config
**If this fails:** Backend issue, check backend setup

---

## 📞 Still Not Working?

1. **Check backend logs** - Any errors?
2. **Check network tab** - What exact error?
3. **Check backend port** - Is it really 3001?
4. **Try different port** - Maybe 4000, 5000?
5. **Check firewall** - Is it blocking?

---

## 🔗 Related Files

- `ENV_SETUP_GUIDE.md` - Complete environment setup
- `docs/DATABASE_SETUP.md` - Database connection guide
- `README_API_SETUP.md` - API setup instructions

