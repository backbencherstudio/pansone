# Database Setup Guide - VestControl Backend

## 🔴 Database Connection Issue Fix

যদি application database এর সাথে connect হচ্ছে না, তাহলে এই guide follow করুন।

---

## Step 1: Database Server Install করুন

### PostgreSQL (Recommended)

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for `postgres` user

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### MySQL (Alternative)

**Windows:**
1. Download from: https://dev.mysql.com/downloads/installer/
2. Install MySQL Server
3. Set root password during installation

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt install mysql-server
sudo systemctl start mysql
```

---

## Step 2: Database Create করুন

### PostgreSQL:

```bash
# PostgreSQL command line এ login করুন
psql -U postgres

# Database create করুন
CREATE DATABASE vestcontrol_db;

# User create করুন (optional)
CREATE USER vestcontrol_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE vestcontrol_db TO vestcontrol_user;

# Exit করুন
\q
```

### MySQL:

```bash
# MySQL command line এ login করুন
mysql -u root -p

# Database create করুন
CREATE DATABASE vestcontrol_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# User create করুন (optional)
CREATE USER 'vestcontrol_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON vestcontrol_db.* TO 'vestcontrol_user'@'localhost';
FLUSH PRIVILEGES;

# Exit করুন
EXIT;
```

---

## Step 3: NestJS Backend এ .env File Setup করুন

### আপনার NestJS backend project folder এ যান:

```bash
cd /path/to/your/nestjs-backend
```

### .env file তৈরি করুন:

`.env.backend.example` file থেকে copy করুন, অথবা manually তৈরি করুন:

```env
# Server Port
PORT=3001

# Database Configuration (PostgreSQL)
DATABASE_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_actual_password
DB_DATABASE=vestcontrol_db
DB_SYNCHRONIZE=false
DB_LOGGING=true

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRES_IN=3600

# CORS
CORS_ORIGIN=http://localhost:3000
```

### MySQL ব্যবহার করলে:

```env
DATABASE_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=vestcontrol_db
```

---

## Step 4: NestJS Backend এ Database Module Setup করুন

### TypeORM ব্যবহার করলে (`app.module.ts`):

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
        logging: configService.get('DB_LOGGING') === 'true',
      }),
      inject: [ConfigService],
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

### Prisma ব্যবহার করলে:

1. `schema.prisma` file:
```prisma
datasource db {
  provider = "postgresql" // or "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

2. `.env` file এ:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/vestcontrol_db?schema=public"
```

3. Prisma migrate:
```bash
npx prisma migrate dev
npx prisma generate
```

---

## Step 5: Connection Test করুন

### NestJS Backend Start করুন:

```bash
cd /path/to/nestjs-backend
npm run start:dev
```

### Check করুন:

1. **Console এ দেখুন:**
   - `Database connection established` message থাকতে হবে
   - কোনো error message থাকলে, database credentials check করুন

2. **Common Errors:**

   **Error: "Connection refused"**
   - Database server running আছে কিনা check করুন
   - Port number correct আছে কিনা verify করুন

   **Error: "Authentication failed"**
   - Username/password correct আছে কিনা check করুন
   - Database user exists আছে কিনা verify করুন

   **Error: "Database does not exist"**
   - Database create করেছেন কিনা check করুন
   - Database name `.env` file এ correct আছে কিনা verify করুন

---

## Step 6: Tables Create করুন

### TypeORM Auto Sync:

`.env` file এ `DB_SYNCHRONIZE=true` set করুন (development only):

```env
DB_SYNCHRONIZE=true
```

⚠️ **Warning:** Production এ `DB_SYNCHRONIZE=false` রাখুন!

### Manual Migration:

```bash
# TypeORM migration
npm run typeorm migration:run

# Prisma migration
npx prisma migrate deploy
```

---

## Step 7: Seed Data (Optional)

### Admin User Create করুন:

```sql
-- PostgreSQL
INSERT INTO admin_users (username, email, password_hash, role, is_active)
VALUES (
  'admin',
  'admin@website.com',
  '$2b$10$YourHashedPasswordHere', -- bcrypt hash of 'AdminPassword123!'
  'admin',
  true
);
```

### bcrypt hash generate করুন:

```bash
# Node.js script
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('AdminPassword123!', 10));"
```

---

## ✅ Verification Checklist

- [ ] Database server installed and running
- [ ] Database `vestcontrol_db` created
- [ ] `.env` file created in NestJS backend
- [ ] Database credentials correct in `.env`
- [ ] NestJS backend starts without errors
- [ ] Database connection successful (check console)
- [ ] Tables created (check database)
- [ ] Admin user exists in database

---

## 🔧 Troubleshooting

### Problem 1: "Cannot connect to database"

**Solution:**
1. Database service running আছে কিনা check করুন:
   ```bash
   # PostgreSQL
   sudo systemctl status postgresql
   
   # MySQL
   sudo systemctl status mysql
   ```

2. Firewall check করুন
3. Connection string verify করুন

### Problem 2: "Access denied"

**Solution:**
1. Username/password correct আছে কিনা
2. User permissions check করুন
3. Database user exists আছে কিনা

### Problem 3: "Database does not exist"

**Solution:**
1. Database manually create করুন (Step 2 দেখুন)
2. Database name `.env` file এ correct আছে কিনা

---

## 📝 Quick Reference

### PostgreSQL Connection String:
```
postgresql://username:password@localhost:5432/database_name
```

### MySQL Connection String:
```
mysql://username:password@localhost:3306/database_name
```

### Test Connection (PostgreSQL):
```bash
psql -h localhost -U postgres -d vestcontrol_db
```

### Test Connection (MySQL):
```bash
mysql -h localhost -u root -p vestcontrol_db
```

---

## 🚀 Next Steps

Database connection successful হলে:

1. ✅ Backend API endpoints test করুন
2. ✅ Frontend থেকে login try করুন
3. ✅ Dashboard load করুন
4. ✅ All features test করুন

