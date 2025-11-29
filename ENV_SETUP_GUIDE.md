# Environment Variables Setup Guide

## 🔴 Database Connection Issue Fix

যদি application database এর সাথে connect হচ্ছে না, তাহলে এই steps follow করুন।

---

## ✅ Step 1: Next.js Frontend .env File

### Project root directory তে `.env.local` file তৈরি করুন:

```env
# NestJS Backend API URL
# Important: Change 3001 to your actual NestJS backend port
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**File location:** `D:\clook\clook\.env.local`

**Note:** `.env.local` file git ignore করা থাকে, তাই manually তৈরি করতে হবে।

---

## ✅ Step 2: NestJS Backend .env File

### আপনার NestJS backend project folder এ `.env` file তৈরি করুন:

**File location:** `D:\path\to\your\nestjs-backend\.env`

```env
# ============================================
# Server Configuration
# ============================================
PORT=3001
NODE_ENV=development

# ============================================
# Database Configuration (PostgreSQL)
# ============================================
DATABASE_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_actual_postgres_password
DB_DATABASE=vestcontrol_db
DB_SYNCHRONIZE=false
DB_LOGGING=true

# Alternative: Full Database URL
# DATABASE_URL=postgresql://postgres:password@localhost:5432/vestcontrol_db

# ============================================
# JWT Authentication
# ============================================
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRES_IN=3600
JWT_REFRESH_SECRET=your_super_secret_refresh_key_minimum_32_characters
JWT_REFRESH_EXPIRES_IN=604800

# ============================================
# CORS Configuration
# ============================================
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
```

### MySQL ব্যবহার করলে:

```env
DATABASE_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_root_password
DB_DATABASE=vestcontrol_db
```

---

## ✅ Step 3: Database Server Check করুন

### PostgreSQL Check:

```bash
# Windows (Command Prompt)
psql --version

# Check if service is running
sc query postgresql-x64-15

# Start service if not running
net start postgresql-x64-15
```

### MySQL Check:

```bash
# Windows
mysql --version

# Check if service is running
sc query MySQL80

# Start service if not running
net start MySQL80
```

---

## ✅ Step 4: Database Create করুন

### PostgreSQL:

1. **pgAdmin** open করুন অথবা command line:
```bash
psql -U postgres
```

2. **Database create করুন:**
```sql
CREATE DATABASE vestcontrol_db;
\q
```

### MySQL:

1. **MySQL Command Line:**
```bash
mysql -u root -p
```

2. **Database create করুন:**
```sql
CREATE DATABASE vestcontrol_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

---

## ✅ Step 5: NestJS Backend এ Database Module Verify করুন

### `app.module.ts` file check করুন:

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Make sure this is set
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get('DATABASE_TYPE') === 'mysql' ? 'mysql' : 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true', // false in production
        logging: configService.get('DB_LOGGING') === 'true',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

---

## ✅ Step 6: Connection Test করুন

### 1. NestJS Backend Start করুন:

```bash
cd /path/to/nestjs-backend
npm run start:dev
```

### 2. Console Check করুন:

**Success message দেখতে হবে:**
```
[Nest] Database connection established
```

**Error দেখলে:**
- Database credentials check করুন
- Database server running আছে কিনা verify করুন
- Port number correct আছে কিনা check করুন

---

## 🔧 Common Issues & Solutions

### Issue 1: "Cannot connect to database"

**Possible Causes:**
- Database server running নেই
- Wrong port number
- Firewall blocking connection

**Solution:**
```bash
# Check PostgreSQL service
sc query postgresql-x64-15

# Check MySQL service  
sc query MySQL80

# Start service if stopped
net start postgresql-x64-15
# or
net start MySQL80
```

### Issue 2: "Authentication failed"

**Possible Causes:**
- Wrong username/password
- User doesn't exist

**Solution:**
1. `.env` file এ credentials verify করুন
2. Database user exists আছে কিনা check করুন:
```sql
-- PostgreSQL
SELECT * FROM pg_user WHERE usename = 'postgres';

-- MySQL
SELECT User, Host FROM mysql.user;
```

### Issue 3: "Database does not exist"

**Solution:**
```sql
-- PostgreSQL
CREATE DATABASE vestcontrol_db;

-- MySQL
CREATE DATABASE vestcontrol_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Issue 4: "Connection refused"

**Solution:**
1. Database server running আছে কিনা
2. Port number correct আছে কিনা (PostgreSQL: 5432, MySQL: 3306)
3. Firewall settings check করুন

---

## 📋 Quick Checklist

### Next.js Frontend:
- [ ] `.env.local` file created
- [ ] `NEXT_PUBLIC_API_URL` set correctly
- [ ] Backend port matches (default: 3001)

### NestJS Backend:
- [ ] `.env` file created in backend folder
- [ ] Database credentials correct
- [ ] Database server running
- [ ] Database `vestcontrol_db` created
- [ ] `app.module.ts` configured correctly
- [ ] Backend starts without errors
- [ ] Database connection successful

---

## 🚀 After Setup

1. **Restart both servers:**
   ```bash
   # Terminal 1: Next.js
   cd D:\clook\clook
   npm run dev
   
   # Terminal 2: NestJS
   cd D:\path\to\nestjs-backend
   npm run start:dev
   ```

2. **Test login:**
   - Go to: http://localhost:3000/login
   - Use: `admin@website.com` / `AdminPassword123!`

3. **Check database:**
   - Tables automatically create হবে যদি `DB_SYNCHRONIZE=true` থাকে
   - অথবা manually migration run করুন

---

## 📝 Important Notes

1. **`.env.local`** file Next.js frontend এর জন্য
2. **`.env`** file NestJS backend এর জন্য
3. Database connection **backend এ** হবে, frontend এ নয়
4. Frontend শুধু API calls করবে backend এর সাথে
5. Production এ `DB_SYNCHRONIZE=false` রাখুন

---

## 🔗 Related Files

- `docs/DATABASE_SETUP.md` - Detailed database setup guide
- `README_API_SETUP.md` - API connection guide
- `.env.backend.example` - Backend .env template

