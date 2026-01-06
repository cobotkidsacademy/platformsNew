# Quick Start Guide

## Initial Setup

### 1. Database Setup (Supabase)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration: `backend/src/database/migrations/001_create_admins_table.sql`
4. Create your first admin user (see below)

### 2. Create Admin User

**Option A: Using the script (Recommended)**
```bash
cd backend
npm install  # Install dependencies first
npx ts-node src/database/scripts/create-admin.ts admin@example.com yourpassword123
```

**Option B: Using Supabase SQL Editor**
1. Generate a bcrypt hash for your password (use https://bcrypt-generator.com/)
2. Run this SQL:
```sql
INSERT INTO admins (email, password_hash, role)
VALUES (
    'admin@example.com',
    '$2b$10$YourGeneratedBcryptHashHere',
    'admin'
);
```

### 3. Configure Environment Variables

**Frontend** (`frontend/.env`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development
```

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```
Backend will run on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

### 6. Access Admin Dashboard

1. Open http://localhost:3000
2. You will be redirected to `/admin/login`
3. Login with your admin credentials
4. After successful login, you'll be redirected to `/admin/dashboard`

## Project Structure

```
.
├── frontend/                    # Next.js 14 Frontend
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/          # Admin login page
│   │   │   └── dashboard/      # Admin dashboard
│   │   └── ...
│   ├── lib/
│   │   ├── api/                # API client configuration
│   │   └── supabase/           # Supabase client
│   └── ...
│
├── backend/                     # NestJS Backend
│   ├── src/
│   │   ├── auth/               # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── guards/         # Auth guards
│   │   │   └── strategies/     # Passport strategies
│   │   ├── database/           # Database configuration
│   │   │   ├── migrations/     # SQL migrations
│   │   │   └── scripts/        # Utility scripts
│   │   └── ...
│   └── ...
│
└── README.md
```

## Next Steps

- ✅ Admin login functionality is ready
- ⏳ Add more dashboard features
- ⏳ Set up Redis for caching
- ⏳ Configure Socket.IO for real-time features
- ⏳ Set up BullMQ for background jobs
- ⏳ Deploy to production

## Troubleshooting

### Backend won't start
- Check that all environment variables are set in `backend/.env`
- Make sure port 3001 is not in use
- Verify Supabase credentials are correct

### Frontend won't start
- Check that all environment variables are set in `frontend/.env`
- Make sure port 3000 is not in use
- Verify Next.js dependencies are installed

### Login fails
- Verify the admin user exists in the database
- Check that the password hash is correct
- Ensure backend API is running and accessible
- Check browser console and network tab for errors

### Database connection issues
- Verify Supabase URL and keys are correct
- Check that the `admins` table exists
- Ensure RLS policies allow service role access








