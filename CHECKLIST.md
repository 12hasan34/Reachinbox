# ReachInBox - Setup & Usage Checklist

## Pre-Setup Checklist

Before you begin, verify you have:

- [ ] Node.js v18+ installed
  ```bash
  node --version  # Should show v18.x.x or higher
  ```

- [ ] npm v9+ installed
  ```bash
  npm --version   # Should show v9.x.x or higher
  ```

- [ ] Docker installed and running
  ```bash
  docker --version  # Should show version info
  docker ps         # Should show running containers (or be empty)
  ```

- [ ] Required ports available:
  - [ ] Port 4000 (Backend API)
  - [ ] Port 5173 (Frontend)
  - [ ] Port 3307 (MySQL)
  - [ ] Port 6379 (Redis)

## Installation Checklist

- [ ] Dependencies installed
  ```bash
  cd backend && npm install
  cd ../frontend && npm install
  ```

- [ ] Docker containers started
  ```bash
  cd backend
  docker-compose up -d
  sleep 10
  ```

- [ ] Verify containers running
  ```bash
  docker ps  # Should show mysql and redis containers
  ```

- [ ] Database initialized
  ```bash
  mysql -h 127.0.0.1 -P 3307 -u root -proot < schema.sql
  ```

- [ ] Verify database setup
  ```bash
  mysql -h 127.0.0.1 -P 3307 -u root -proot reachinbox -e "SHOW TABLES;"
  # Should show: email_campaigns, emails
  ```

## Running Checklist

- [ ] Backend API running (Terminal 1)
  ```bash
  cd backend
  npm run dev
  # Should show: listening on http://localhost:4000
  ```

- [ ] Backend worker running (Terminal 2)
  ```bash
  cd backend
  npm run worker
  # Should show: Worker listening for jobs
  ```

- [ ] Frontend running (Terminal 3)
  ```bash
  cd frontend
  npm run dev
  # Should show: ready at http://localhost:5173
  ```

## First Use Checklist

- [ ] Access frontend
  ```
  Open http://localhost:5173 in browser
  ```

- [ ] Login successful
  - Email: `hasanadmin@mail.com`
  - Password: `hasan`
  - [ ] Redirected to dashboard

- [ ] Dashboard loads
  - [ ] "Compose New Email" button visible
  - [ ] "Scheduled Emails" tab visible
  - [ ] "Sent Emails" tab visible
  - [ ] Header shows username

- [ ] Compose email modal opens
  - Click "Compose New Email"
  - [ ] Modal appears with form

- [ ] File upload works
  - [ ] Upload `sample-emails.csv` successfully
  - [ ] System shows parsed email count
  - [ ] Shows validation results

- [ ] Email scheduling works
  - [ ] Fill subject, body
  - [ ] Pick start time (set to now + 5 min)
  - [ ] Set delay (10 seconds)
  - [ ] Click Submit
  - [ ] Success message shows

- [ ] Email tracking works
  - [ ] Wait for scheduled time
  - [ ] Switch to "Sent Emails" tab
  - [ ] See emails marked as "sent"
  - [ ] Click on email to see details

## Troubleshooting Checklist

### Port Conflicts
- [ ] Check if port in use:
  ```bash
  lsof -i :4000   # Backend
  lsof -i :5173   # Frontend
  lsof -i :3307   # MySQL
  lsof -i :6379   # Redis
  ```

- [ ] Kill process if needed:
  ```bash
  kill -9 <PID>
  ```

### Database Connection Issues
- [ ] Verify MySQL running:
  ```bash
  docker ps | grep mysql
  ```

- [ ] Test connection:
  ```bash
  mysql -h 127.0.0.1 -P 3307 -u root -proot -e "SELECT 1;"
  ```

- [ ] Check Docker logs:
  ```bash
  docker logs <mysql-container-id>
  ```

### Redis Connection Issues
- [ ] Verify Redis running:
  ```bash
  docker ps | grep redis
  ```

- [ ] Test connection:
  ```bash
  redis-cli PING
  # Should return: PONG
  ```

### Worker Not Processing Emails
- [ ] Verify worker process running:
  ```bash
  ps aux | grep "email.worker"
  ```

- [ ] Check worker logs for errors
  - Look at Terminal 2 output
  - Should show: "Sending email to..."

- [ ] Verify Redis queue:
  ```bash
  redis-cli LLEN bull:email-queue:email-queue
  ```

### Emails Not Sending
- [ ] Check email status:
  ```bash
  mysql -h 127.0.0.1 -P 3307 -u root -proot reachinbox \
    -e "SELECT status, COUNT(*) FROM emails GROUP BY status;"
  ```

- [ ] Check worker logs
- [ ] Verify rate limit not hit
- [ ] Check MySQL for errors

## Testing Checklist

### Manual Test 1: Single Email
- [ ] Create small file with 1 email
- [ ] Schedule for now
- [ ] Wait 10 seconds
- [ ] Check "Sent Emails" tab
- [ ] [ ] Email marked as "sent"

### Manual Test 2: Batch Emails
- [ ] Upload sample-emails.csv (20 emails)
- [ ] Schedule for now + 5 min
- [ ] Set delay: 10 seconds
- [ ] Wait for completion
- [ ] [ ] All emails in "Sent Emails" tab
- [ ] Check status is "sent" or "failed"

### Manual Test 3: Rate Limiting
- [ ] Schedule 50 emails
- [ ] Set delay: 2 seconds
- [ ] Set hourly limit: 5
- [ ] Some should be delayed to next hour
- [ ] [ ] Verify in MySQL: some are still pending after 1 min

### Manual Test 4: Timezone Conversion
- [ ] Note current local time
- [ ] Schedule email for local time
- [ ] Check MySQL for stored time
- [ ] [ ] MySQL time is different (UTC)
- [ ] [ ] Dashboard shows original local time

## Performance Checklist

- [ ] API response time < 100ms
  - Check browser DevTools Network tab

- [ ] Worker processing time < 5s per email
  - Check worker logs

- [ ] Dashboard loads quickly
  - Should be instant after first load

- [ ] No UI freezes during upload
  - File parsing happens client-side

## Code Review Checklist (Optional)

- [ ] Backend code organized by concern
  - [ ] Routes, middleware, utils, db separate

- [ ] Frontend components are reusable
  - [ ] Button, Input, Modal, Table, Tabs

- [ ] No hardcoded values
  - [ ] All config via .env

- [ ] Proper error handling
  - [ ] API errors caught and shown to user
  - [ ] Database errors logged

- [ ] TypeScript types correct
  - [ ] No `any` types unless needed
  - [ ] Interfaces well-defined

## Deployment Checklist (Optional)

- [ ] Environment variables set
  - [ ] No secrets in code
  - [ ] All required vars present

- [ ] Database backups configured
  - [ ] MySQL backups scheduled

- [ ] Monitoring set up
  - [ ] Logs aggregated
  - [ ] Alerts configured

- [ ] Rate limiting appropriate
  - [ ] Not too restrictive
  - [ ] Not allowing abuse

- [ ] SSL/HTTPS enabled
  - [ ] For production deployment

## Common Commands Reference

### Start Everything
```bash
# Terminal 1 - Backend
cd backend
docker-compose up -d
npm run dev

# Terminal 2 - Worker
cd backend
npm run worker

# Terminal 3 - Frontend
cd frontend
npm run dev
```

### Monitor
```bash
# Check containers
docker ps

# Check processes
ps aux | grep node

# MySQL query
mysql -h 127.0.0.1 -P 3307 -u root -proot reachinbox -e "SELECT COUNT(*) FROM emails;"

# Redis check
redis-cli KEYS "email_rate:*"
```

### Debug
```bash
# View backend logs
# (Look at Terminal 1 output)

# View worker logs
# (Look at Terminal 2 output)

# View frontend errors
# (Check browser console - F12)

# Database error
mysql -h 127.0.0.1 -P 3307 -u root -proot reachinbox -e "SHOW WARNINGS;"
```

### Clean Up
```bash
# Stop containers
docker-compose down

# Stop Node processes
pkill -f "npm run"

# Clear Redis
redis-cli FLUSHALL

# Clear database
mysql -h 127.0.0.1 -P 3307 -u root -proot reachinbox -e "TRUNCATE emails; TRUNCATE email_campaigns;"
```

## File Locations Quick Reference

```
ReachInBox/
├── README.md                          # Main documentation
├── QUICK_START.md                     # 5-minute setup
├── INDEX.md                           # Documentation index
├── PROJECT_SUMMARY.md                 # Project overview
├── DEVELOPMENT.md                     # Developer guide
├── CHECKLIST.md                       # This file
├── sample-emails.csv                  # Test data
├── sample-emails.txt                  # Test data
├── backend/
│   ├── .env                          # Configuration
│   ├── schema.sql                    # Database schema
│   ├── docker-compose.yml            # Docker config
│   ├── package.json
│   ├── src/
│   │   ├── app.ts                   # Express app
│   │   ├── server.ts                # Entry point
│   │   ├── routes/
│   │   ├── worker/
│   │   ├── queue/
│   │   └── ...
│   └── node_modules/
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── src/
    │   ├── main.tsx                 # Entry point
    │   ├── App.tsx                  # Routes
    │   ├── pages/
    │   ├── components/
    │   ├── auth/
    │   └── api/
    └── node_modules/
```

## Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| README.md | Complete guide | 20 min |
| QUICK_START.md | Fast setup | 5 min |
| PROJECT_SUMMARY.md | Overview | 10 min |
| DEVELOPMENT.md | Developer ref | 30 min |
| INDEX.md | Navigation | 5 min |
| CHECKLIST.md | This file | 10 min |

## Getting Help

1. **Can't start?** → Check QUICK_START.md
2. **Don't understand?** → Check PROJECT_SUMMARY.md
3. **Want to modify?** → Check DEVELOPMENT.md
4. **Something broken?** → Check README.md Troubleshooting
5. **How do I code?** → Check DEVELOPMENT.md

---

**Status**: All systems ready for use ✅
**Version**: 1.0.0
**Date**: January 2026
