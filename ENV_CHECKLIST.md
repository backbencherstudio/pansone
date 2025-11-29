# Environment Variables Checklist

## ✅ Next.js Frontend (.env.local)

**File Location:** `D:\clook\clook\.env.local`

**Create this file manually with this content:**

```env
# Next.js Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Steps:**
1. Project root folder এ `.env.local` file তৈরি করুন
2. উপরের content copy-paste করুন
3. Port number change করুন (3001 → আপনার NestJS backend port)
4. Next.js server restart করুন

---

## ✅ NestJS Backend (.env)

**File Location:** `D:\path\to\your\nestjs-backend\.env`

**Create this file in your NestJS backend project:**

```env
# Server
PORT=3001
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_actual_password
DB_DATABASE=vestcontrol_db
DB_SYNCHRONIZE=false
DB_LOGGING=true

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=3600

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Important:**
- `DB_PASSWORD` = আপনার PostgreSQL password
- `DB_DATABASE` = database name (vestcontrol_db)
- Database আগে create করতে হবে

---

## 🔍 Verification Steps

### 1. Check .env.local exists:
```bash
# Windows
dir .env.local

# Should show: .env.local
```

### 2. Check database is running:
```bash
# PostgreSQL
sc query postgresql-x64-15

# MySQL
sc query MySQL80
```

### 3. Test database connection:
```bash
# PostgreSQL
psql -U postgres -d vestcontrol_db

# MySQL
mysql -u root -p vestcontrol_db
```

### 4. Check NestJS backend starts:
```bash
cd /path/to/nestjs-backend
npm run start:dev

# Look for: "Database connection established"
```

---

## 🚨 Common Mistakes

1. ❌ `.env.local` file Next.js project এ নেই
2. ❌ Backend `.env` file এ wrong database credentials
3. ❌ Database server running নেই
4. ❌ Database create করা হয়নি
5. ❌ Port number mismatch (frontend 3001, backend 3000)

---

## ✅ Quick Fix

1. **Create `.env.local`** in Next.js project root
2. **Create `.env`** in NestJS backend project
3. **Start database server**
4. **Create database** (`vestcontrol_db`)
5. **Start NestJS backend** - check connection
6. **Start Next.js frontend** - test login

---

For detailed instructions, see:
- `ENV_SETUP_GUIDE.md` - Complete setup guide
- `docs/DATABASE_SETUP.md` - Database setup details

