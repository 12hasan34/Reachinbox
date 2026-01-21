# QUICK START GUIDE - ReachInBox Email Scheduler

Get up and running in 5 minutes!

## Step 1: Prerequisites Check (1 min)
```bash
node --version          # Should be v18+
npm --version          # Should be v9+
docker --version       # Required
docker ps              # Docker must be running
```

## Step 2: Install Dependencies (1 min)
```bash
cd ReachInBox

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

## Step 3: Start Docker Containers (1 min)
```bash
cd backend
docker-compose up -d

# Wait 10 seconds for MySQL to initialize
sleep 10

# Initialize database
mysql -h 127.0.0.1 -P 3307 -u root -proot < schema.sql
```

## Step 4: Start Backend (1 min)

**Terminal 1 - API Server:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Email Worker:**
```bash
cd backend
npm run worker
```

## Step 5: Start Frontend (1 min)

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

## Step 6: Access Application

1. Open http://localhost:5173
2. Login with:
   - Email: `hasanadmin@mail.com`
   - Password: `hasan`
3. Click "Compose New Email"
4. Upload `sample-emails.csv` or `sample-emails.txt` from project root
5. Fill details and schedule!

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| MySQL connection refused | `docker-compose up -d && sleep 10` |
| Redis connection refused | `docker ps` - verify containers running |
| Port 4000 in use | `lsof -i :4000 \| tail -1 \| awk '{print $2}' \| xargs kill -9` |
| Port 5173 in use | `lsof -i :5173 \| tail -1 \| awk '{print $2}' \| xargs kill -9` |
| Schema not found | `mysql -h 127.0.0.1 -P 3307 -u root -proot reachinbox < schema.sql` |

---

## Test Email Sending

1. **Schedule emails** with at least 10-second delay
2. **Check "Sent Emails"** tab after delay expires
3. Emails marked as **"sent"** = success ✓

---

## File Locations

- **Sample CSV**: `./sample-emails.csv`
- **Sample TXT**: `./sample-emails.txt`
- **Backend Env**: `./backend/.env`
- **Database Schema**: `./backend/schema.sql`
- **Docs**: `./README.md`

---

**Ready to schedule emails!** 🚀
