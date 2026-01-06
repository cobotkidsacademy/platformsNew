# Troubleshooting Login Issues

## Common Issues and Solutions

### 1. "Login failed" or "Invalid credentials" Error

#### Check 1: Verify Database Connection
Test if your backend can connect to Supabase:
```bash
# Make sure backend is running, then visit:
http://localhost:3001/test-db
```

This will show:
- If the database connection works
- How many admin users exist
- Any connection errors

#### Check 2: Verify Admin User Exists
1. Go to your Supabase Dashboard
2. Navigate to Table Editor → `admins` table
3. Check if you have any admin users

If no admin user exists, create one:
```bash
cd backend
npx ts-node src/database/scripts/create-admin.ts admin@example.com yourpassword123
```

Or use SQL directly in Supabase SQL Editor:
```sql
-- First, generate a bcrypt hash (use https://bcrypt-generator.com/)
-- Then insert:
INSERT INTO admins (email, password_hash, role)
VALUES (
    'admin@example.com',
    '$2b$10$YourGeneratedHashHere',
    'admin'
);
```

#### Check 3: Check Environment Variables
Verify your `backend/.env` file has:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=your-secret-key
```

**Important**: 
- Use `SUPABASE_SERVICE_ROLE_KEY`, NOT the anon key
- The service role key bypasses RLS policies
- Never commit this key to git

#### Check 4: Check RLS Policies
1. Go to Supabase Dashboard → Authentication → Policies
2. Check the `admins` table policies
3. Ensure there's a policy allowing service role access:
```sql
CREATE POLICY "Service role can access all admins"
    ON admins
    FOR ALL
    USING (auth.role() = 'service_role');
```

#### Check 5: Check Backend Logs
Look at your backend console for detailed error messages. The logs will show:
- Database connection errors
- Query errors
- Authentication errors

Run backend with:
```bash
cd backend
npm run start:dev
```

#### Check 6: Verify Password Hash Format
The password hash must be a valid bcrypt hash (starts with `$2a$`, `$2b$`, or `$2y$`).

If you're creating a user manually, make sure to use a bcrypt generator:
- Online: https://bcrypt-generator.com/
- Node.js: `bcrypt.hashSync('password', 10)`

### 2. "Network Error" or Connection Refused

#### Check Backend is Running
```bash
# Backend should be on port 3001
curl http://localhost:3001/health
```

#### Check Frontend API URL
Verify `frontend/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Make sure this matches your backend port.

### 3. CORS Errors

If you see CORS errors in the browser console:

1. Check `backend/.env`:
```env
FRONTEND_URL=http://localhost:3000
```

2. Make sure both frontend and backend URLs match your actual setup.

### 4. Database Query Returns Empty

If the test endpoint shows `adminCount: 0`:

1. **Create an admin user** (see Check 2 above)
2. **Verify RLS policies** allow service role access
3. **Check table name** - make sure it's `admins` (not `admin`)

### 5. Password Not Working

If login fails even with correct credentials:

1. **Recreate the admin user** with the script to ensure proper password hashing
2. **Verify the password hash** in the database looks like: `$2b$10$...`
3. **Try a simple password first** (like "password123") to test

## Debugging Steps

1. **Test Database Connection**:
   ```
   GET http://localhost:3001/test-db
   ```

2. **Check Backend Logs**:
   Look for error messages when you try to login

3. **Check Browser Console**:
   Open DevTools → Console and Network tabs
   Look for API errors

4. **Verify Request Format**:
   The login request should be:
   ```
   POST http://localhost:3001/auth/admin/login
   Body: { "email": "admin@example.com", "password": "yourpassword" }
   ```

5. **Test with curl**:
   ```bash
   curl -X POST http://localhost:3001/auth/admin/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"yourpassword"}'
   ```

## Quick Checklist

- [ ] Backend server is running on port 3001
- [ ] Frontend server is running on port 3000
- [ ] `backend/.env` has correct Supabase credentials
- [ ] `frontend/.env` has correct API URL
- [ ] Database migration has been run
- [ ] At least one admin user exists in the database
- [ ] RLS policies allow service role access
- [ ] Password hash is valid bcrypt format
- [ ] No errors in backend console
- [ ] No CORS errors in browser console

## Still Having Issues?

1. Check the backend logs - they now have detailed error messages
2. Use the `/test-db` endpoint to verify database connectivity
3. Verify all environment variables are set correctly
4. Make sure you're using the service role key (not anon key)
5. Try creating a new admin user with the script






