# API Setup Instructions

## 🔴 Login Issue Fix

If you're getting **404 Not Found** error on login, it means the frontend is trying to connect to the wrong server.

### Problem
- Next.js dev server runs on `http://localhost:3000`
- NestJS backend should run on a **different port** (e.g., `3001`, `4000`, etc.)
- Frontend is trying to call `localhost:3000/auth/login` which doesn't exist

### Solution

#### Step 1: Check Your NestJS Backend Port
Find out which port your NestJS backend is running on. Common ports:
- `3001`
- `4000`
- `5000`
- `8000`

#### Step 2: Create `.env.local` File
Create a `.env.local` file in the root directory of this Next.js project:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Replace `3001` with your actual NestJS backend port.**

#### Step 3: Restart Next.js Dev Server
After creating `.env.local`, restart your Next.js dev server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Example `.env.local` File

```env
# NestJS Backend URL
# Change the port to match your backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# For production:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Verify Backend is Running

Before trying to login, make sure your NestJS backend is running:

1. Check if backend is running:
   ```bash
   # In your NestJS project directory
   npm run start:dev
   ```

2. Test the endpoint directly:
   ```bash
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@website.com","password":"AdminPassword123!"}'
   ```

3. If you get a response, the backend is working!

### Common Issues

#### Issue 1: CORS Error
If you see CORS errors, add this to your NestJS `main.ts`:

```typescript
app.enableCors({
  origin: 'http://localhost:3000', // Next.js frontend URL
  credentials: true,
});
```

#### Issue 2: Backend Not Running
Make sure your NestJS backend is actually running before trying to login.

#### Issue 3: Wrong Port
Double-check the port in `.env.local` matches your backend port.

### Quick Test

1. Open browser console (F12)
2. Try to login
3. Check Network tab - you should see request going to the correct port
4. If still 404, verify backend is running and port is correct

