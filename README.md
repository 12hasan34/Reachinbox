# ReachInBox - Production-Grade Email Scheduler

A production-ready email scheduling system with a React frontend and Node.js backend. Schedule bulk emails with rate limiting, reliable job processing, and comprehensive tracking.

## Overview

ReachInBox is a full-stack application for scheduling and sending bulk emails. It features:
- **Frontend Dashboard**: React + TypeScript with Tailwind CSS
- **Backend API**: Node.js + Express with BullMQ job queue
- **Reliable Processing**: Redis-backed queue with persistent MySQL storage
- **Rate Limiting**: Configurable hourly email limits with smart job rescheduling
- **Timezone Support**: Proper handling of user timezone conversions
- **Idempotent Sending**: Prevents duplicate emails across restarts

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js 5.x
- **Job Queue**: BullMQ 5.x (Redis-backed, NO cron jobs)
- **Database**: MySQL 8.x
- **Cache/Queue**: Redis
- **Email**: Nodemailer with Ethereal Email (sandbox)

### Frontend
- **Framework**: React 19.x
- **Build Tool**: Vite 7.x
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **HTTP Client**: Axios
- **Routing**: React Router 7.x

### Infrastructure
- **Containerization**: Docker (Redis + MySQL)
- **Port Mapping**: Backend (4000), Frontend (5173), MySQL (3307), Redis (6379)

## Project Structure

```
ReachInBox/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration (env, connections, BullMQ)
│   │   ├── db/             # MySQL connection pool
│   │   ├── jobs/           # Job definitions
│   │   ├── queue/          # Email job scheduling
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth middleware
│   │   ├── types/          # TypeScript definitions
│   │   ├── utils/          # Helpers (mailer, time utilities)
│   │   ├── worker/         # Email worker process
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── schema.sql          # Database schema
│   ├── docker-compose.yml  # Docker containers
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── api/            # API layer (Axios instances, requests)
│   │   ├── auth/           # Authentication (Context, guards)
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Login, Dashboard)
│   │   ├── App.tsx         # Main app component
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│
└── README.md (this file)
```

## Prerequisites

- **Node.js**: v18.x or later
- **Docker**: Latest version (for Redis and MySQL containers)
- **npm**: v9+ or yarn

## Installation & Setup

### 1. Clone & Install Dependencies

```bash
cd ReachInBox

# Backend setup
cd backend
npm install

# Frontend setup (in new terminal)
cd frontend
npm install
```

### 2. Start Docker Containers

```bash
cd backend

# Start Redis and MySQL containers
docker-compose up -d

# Verify containers are running
docker ps
```

**Expected output:**
- Redis on `127.0.0.1:6379`
- MySQL on `127.0.0.1:3307`

### 3. Initialize Database

```bash
cd backend

# Option 1: Import schema using MySQL CLI
mysql -h 127.0.0.1 -P 3307 -u root -proot < schema.sql

# Option 2: Connect to MySQL and run schema.sql manually
mysql -h 127.0.0.1 -P 3307 -u root -proot
mysql> USE reachinbox;
mysql> source schema.sql;
```

### 4. Configure Environment Variables

#### Backend (`.env` - already configured)
```env
PORT=4000

# MySQL
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=root
DB_NAME=reachinbox

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Rate limiting (max emails per hour)
MAX_EMAILS_PER_HOUR=20
EMAIL_MIN_DELAY_MS=2000

# Authentication
AUTH_EMAIL=hasanadmin@mail.com
AUTH_PASSWORD=hasan
AUTH_TOKEN_TTL_SECONDS=86400

# CORS
CORS_ORIGIN=http://localhost:5173

# Email sender
SENDER_EMAIL=noreply@reachinbox.local
```

#### Frontend (uses default backend on `http://localhost:4000`)
- No additional setup needed

### 5. Start Backend

```bash
cd backend

# Terminal 1: API Server
npm run dev

# Terminal 2: Email Worker (in same directory)
npm run worker

# Optional Terminal 3: Rebuild queue (if needed after crashes)
npm run rebuild
```

**Expected output:**
```
✓ Server listening on http://localhost:4000
✓ Worker connected to Redis and listening for jobs
```

### 6. Start Frontend

```bash
cd frontend

npm run dev
```

**Expected output:**
```
✓ Vite ready at http://localhost:5173
```

## Usage

### Login

1. Open http://localhost:5173
2. Login with credentials:
   - **Email**: `hasanadmin@mail.com`
   - **Password**: `hasan`

### Schedule Emails

1. **Navigate to Dashboard** after login
2. **Click "Compose New Email"** button
3. **Fill form**:
   - Subject: e.g., "Welcome to ReachInBox"
   - Body: e.g., "Hello {recipient}, welcome aboard!"
   - Upload CSV/TXT file with email addresses (see sample files below)
   - Set start time using datetime picker
   - Set delay between emails (seconds)
   - Set hourly limit (maximum emails per hour)
4. **Review parsed emails** - system validates and shows count
5. **Submit** - emails will be scheduled and queued

### View Scheduled & Sent Emails

- **Scheduled Tab**: Shows pending emails with scheduled time and status
- **Sent Tab**: Shows successfully sent and failed emails with timestamps

### Logout

Click **Logout** button in header to clear session

## API Documentation

### Authentication
**POST** `/auth/login`
```json
{
  "email": "hasanadmin@mail.com",
  "password": "hasan"
}
```
Response:
```json
{
  "token": "jwt_token_here",
  "user": { "email": "hasanadmin@mail.com" }
}
```

### Schedule Emails
**POST** `/emails/schedule` (requires auth)
```json
{
  "subject": "Campaign Subject",
  "body": "Email body text",
  "emails": ["user1@example.com", "user2@example.com"],
  "startTime": "2026-01-22T14:30:00.000Z",
  "delay": 10
}
```
Response:
```json
{ "success": true }
```

### Get Scheduled Emails
**GET** `/emails/scheduled` (requires auth)

Response:
```json
[
  {
    "id": 1,
    "recipient_email": "user@example.com",
    "scheduled_at": "2026-01-22T14:30:00Z",
    "subject": "Campaign Subject",
    "status": "pending"
  }
]
```

### Get Sent Emails
**GET** `/emails/sent` (requires auth)

Response:
```json
[
  {
    "id": 2,
    "recipient_email": "user@example.com",
    "sent_at": "2026-01-22T14:30:15Z",
    "subject": "Campaign Subject",
    "status": "sent"
  }
]
```

## Sample Files

### CSV Format (`sample-emails.csv`)
```csv
email
john.doe@example.com
jane.smith@example.com
michael.johnson@example.com
sarah.williams@example.com
robert.brown@example.com
```

### TXT Format (`sample-emails.txt`)
```
john.doe@example.com
jane.smith@example.com
michael.johnson@example.com
sarah.williams@example.com
robert.brown@example.com
```

**Supported delimiters**: Newlines, commas, semicolons, spaces, tabs

## Key Features

### Job Scheduling with BullMQ

- **No cron jobs**: Uses Redis-backed delayed jobs
- **Persistent storage**: Jobs survive server restarts
- **Exponential backoff**: 3 retries with 5-second delays
- **Concurrency control**: 3 workers processing emails simultaneously

### Rate Limiting

- **Hourly limits**: Configurable max emails per hour (default: 20)
- **Smart rescheduling**: Jobs automatically delay to next hour if limit reached
- **Per-sender tracking**: Rate limits tracked by sender email address

### Idempotent Email Sending

- **Duplicate prevention**: Checks email status before sending
- **Unique keys**: Each email has UUID for tracking
- **Atomic updates**: Status updated after successful send

### Timezone Handling

- **Local time input**: User picks local datetime in UI
- **UTC storage**: Times stored as UTC in MySQL
- **Local display**: Times converted back to user's timezone when viewing

### Database Schema

**email_campaigns** table:
- `id`: Campaign identifier
- `subject`: Email subject
- `body`: Email body
- `start_time`: Campaign start (TIMESTAMP, UTC)
- `delay_between_emails`: Seconds between each email
- `created_at`, `updated_at`: Metadata

**emails** table:
- `id`: Email identifier
- `campaign_id`: Foreign key to campaign
- `recipient_email`: Recipient address
- `scheduled_at`: When email should send (TIMESTAMP, UTC)
- `sent_at`: When email was actually sent (nullable)
- `status`: 'pending', 'sent', or 'failed'
- `unique_key`: UUID for idempotency
- Indexes on status, scheduled_at, sent_at for performance

## Troubleshooting

### MySQL Connection Errors
```
Error: connect ECONNREFUSED 127.0.0.1:3307
```
**Solution**: Ensure Docker containers are running
```bash
docker-compose up -d
docker ps  # Verify MySQL container is running
```

### Redis Connection Errors
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution**: Check Redis container
```bash
docker-compose logs redis
docker restart redis  # if needed
```

### Emails Not Sending
1. Check worker process is running: `npm run worker`
2. Verify job queue is not full: Check Redis queue size
3. Check email status in MySQL: `SELECT * FROM emails WHERE id=X;`
4. Review worker logs for delivery errors

### Timezone Mismatch Between UI and DB
- Times in database are UTC (for consistency with MySQL container timezone)
- Frontend automatically converts to/from user's local timezone
- No manual conversion needed - system handles it transparently

### Port Already in Use
```bash
# Kill process using port 4000
lsof -i :4000
kill -9 <PID>

# Kill process using port 5173
lsof -i :5173
kill -9 <PID>
```

## Development Workflow

### Adding New Features

1. **Backend**: Add route in `src/routes/`, implement business logic
2. **Frontend**: Create component in `src/components/`, wire to API
3. **Database**: Update `schema.sql` if needed, run migration
4. **Testing**: Use sample CSV/TXT files to test end-to-end

### Debugging

**Backend debugging**:
```bash
# Add console.log or use debugger
node --inspect-brk=9229 src/server.ts
```

**Frontend debugging**:
- Open Chrome DevTools (F12)
- Use React DevTools extension
- Check Network tab for API calls

### Logs

**Backend**: Console output from `npm run dev`
**Worker**: Console output from `npm run worker`
**Frontend**: Browser console (F12)
**Database**: MySQL error logs from Docker

## Environment Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 4000 | Backend API port |
| `DB_HOST` | localhost | MySQL host |
| `DB_PORT` | 3307 | MySQL port |
| `MAX_EMAILS_PER_HOUR` | 20 | Rate limit |
| `EMAIL_MIN_DELAY_MS` | 2000 | Min delay between emails |
| `AUTH_TOKEN_TTL_SECONDS` | 86400 | Token expiry (24 hours) |

## Performance Considerations

- **Worker concurrency**: Set to 3 by default, increase for higher throughput
- **Database indexes**: Already set on `status`, `scheduled_at`, `sent_at`
- **Redis memory**: Monitor for long-running queue
- **MySQL pool**: Connection pool configured for optimal performance

## Security

- ✅ **Auth tokens**: JWT-based with 24-hour expiry
- ✅ **Input validation**: All API inputs validated
- ✅ **Idempotency**: Prevents duplicate email sends
- ✅ **CORS**: Restricted to frontend origin
- ⚠️ **Production**: Use environment-based credentials, enable HTTPS

## Deployment

### For Production

1. **Environment**: Set production env variables
2. **Database**: Use managed MySQL service (AWS RDS, etc.)
3. **Redis**: Use managed Redis service (AWS ElastiCache, etc.)
4. **Frontend**: Build and deploy to CDN
   ```bash
   cd frontend
   npm run build
   # Deploy dist/ to CDN
   ```
5. **Backend**: Deploy to production server/container service

### Docker Build

```bash
# Backend Dockerfile (create if needed)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Support & Issues

For issues or feature requests, check:
1. MySQL/Redis connectivity
2. Environment variables
3. Browser console for errors
4. Backend server logs
5. Worker process logs

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Status**: Production Ready
