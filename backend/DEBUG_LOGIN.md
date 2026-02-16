# Login Debugging Guide

## Step 1: Check MongoDB Connection in Terminal

Restart your backend:
```bash
cd backend
npm run dev
```

**Look for these messages:**
- ✅ `MongoDB connected successfully` - Database is connected
- ✅ `Server running on port 5000` - Backend is running

If you see **error messages**, your connection string is wrong.

---

## Step 2: Verify Users Exist in MongoDB Compass

1. Open **MongoDB Compass**
2. Navigate to: `farmc` database → `users` collection
3. Check if your users are visible

**You should see documents with:**
- `username` (e.g., "admin")
- `email` (e.g., "admin@farmc.gov.ph")
- `password` (long encrypted string starting with "$2a" or "$2b")
- `role` (e.g., "admin")

---

## Step 3: Check Backend Console Logs

When you try to login, **watch the backend terminal** for these messages:

```
[v0] Login attempt for username: admin
[v0] User found: YES
[v0] Checking password...
[v0] Password valid: true
```

### If you see `User found: NO`:
- Your username is wrong
- The user doesn't exist in the database
- **Action:** Create the user or use the correct username

### If you see `Password valid: false`:
- Your password is wrong
- The password wasn't hashed correctly when imported
- **Action:** Delete the user and create a new one with correct password

---

## Step 4: Test with Postman

Use Postman to test the login API directly:

1. Create a **POST** request to: `http://localhost:5000/api/auth/login`
2. In **Body** → **raw** → **JSON**, paste:
```json
{
  "username": "admin",
  "password": "your_password_here"
}
```
3. Click **Send**

**Successful response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "email": "admin@farmc.gov.ph",
    "fullName": "Admin User",
    "role": "admin"
  }
}
```

**Error response:**
```json
{
  "message": "Invalid credentials"
}
```

---

## Step 5: Common Issues & Solutions

### Issue: "MongoDB connection error"
**Solution:**
1. Check your `.env` file exists at `/backend/.env`
2. Verify the connection string is correct
3. Ensure MongoDB is running (check MongoDB Compass can connect)

### Issue: "Invalid credentials" on every login attempt
**Solution:**
1. Delete the user from MongoDB Compass
2. Create a new user through the frontend registration OR use:
```bash
cd backend
npm run import
```

### Issue: User exists in MongoDB but still can't login
**Solution:**
1. Check the password was properly hashed (should start with `$2a` or `$2b`)
2. Delete and recreate the user
3. Check backend console for "[v0]" debug messages

---

## Step 6: Manual User Creation (If Import Fails)

1. Use the frontend to register a new user:
   - Go to `http://localhost:3000`
   - Create account with username: `testuser` and password: `Test123`
   
2. OR use Postman to POST to `http://localhost:5000/api/auth/register`:
```json
{
  "username": "testuser",
  "email": "test@farmc.gov.ph",
  "password": "Test123",
  "fullName": "Test User",
  "department": "BFAR-NCR",
  "region": "NCR"
}
```

---

## Need More Help?

If you still can't login:
1. Take a screenshot of your backend terminal (showing the debug logs)
2. Take a screenshot of MongoDB Compass showing the users collection
3. Check what error message you're getting in the frontend
4. Share these details for further debugging
