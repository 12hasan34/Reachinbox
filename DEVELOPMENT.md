# DEVELOPMENT GUIDE - ReachInBox

Comprehensive guide for developers working on ReachInBox.

## Architecture Overview

### System Flow

```
User (Browser)
    ↓
Frontend (React/Vite)
    ↓
Backend API (Express)
    ↓
MySQL (Data Storage)
    ↓
Redis Queue (BullMQ)
    ↓
Worker Process (Email Sender)
    ↓
Ethereal Email (Sandbox)
```

### Key Components

#### Frontend
- **AuthContext**: Manages login state, JWT tokens, persistent storage
- **ProtectedRoutes**: `RequireAuth` component guards dashboard
- **API Layer**: Axios instance with auth interceptors
- **Components**: Reusable Button, Input, Modal, Table, Tabs
- **Pages**: Login, Dashboard

#### Backend
- **Routes**: Express route handlers for auth and email scheduling
- **Queue**: BullMQ integration for job scheduling
- **Worker**: Separate process handling email sending with rate limits
- **Database**: MySQL pool with connection management
- **Middleware**: Auth token validation

#### Infrastructure
- **MySQL**: TIMESTAMP columns (UTC), proper indexing
- **Redis**: Stores job queue, rate limit counters, token cache
- **Docker**: Containerizes MySQL and Redis

## Code Organization

### Backend Structure

```
backend/src/
├── app.ts                 # Express app configuration, middleware setup
├── server.ts              # Server entry point, listener
├── worker/                # Email worker process
│   └── email.worker.ts   # BullMQ worker handling email sends
├── routes/
│   └── email.routes.ts   # POST /schedule, GET /scheduled, GET /sent
├── queue/
│   └── email.queue.ts    # Job scheduling with delays
├── middleware/
│   └── requireAuth.ts    # JWT validation middleware
├── config/
│   ├── env.ts            # Environment variables
│   ├── bullmq.ts         # BullMQ queue initialization
│   └── connection.ts     # Redis connection config
├── db/
│   └── mysql.ts          # MySQL pool setup
├── utils/
│   ├── mailer.ts         # Nodemailer transporter
│   └── time.ts           # Timezone utilities
└── types/
    └── express.d.ts      # Express type augmentation for auth
```

### Frontend Structure

```
frontend/src/
├── main.tsx              # React entry point
├── App.tsx               # Route definitions
├── index.css             # Global Tailwind styles
├── auth/
│   ├── AuthContext.tsx  # Auth state management
│   └── RequireAuth.tsx  # Route protection component
├── api/
│   ├── axios.ts         # Axios instance with interceptors
│   ├── auth.api.ts      # Authentication API calls
│   ├── email.api.ts     # Email scheduling API calls
│   └── types.ts         # TypeScript interfaces
├── components/
│   ├── Button.tsx       # Reusable button with variants
│   ├── Input.tsx        # Form input wrapper
│   ├── Modal.tsx        # Modal dialog wrapper
│   ├── Table.tsx        # Data table component
│   ├── Tabs.tsx         # Tab navigation
│   ├── Header.tsx       # Dashboard header
│   └── ComposeEmailModal.tsx  # Email scheduling form
└── pages/
    ├── Login.tsx        # Login page
    └── DashBoard.tsx    # Main dashboard
```

## Database Schema

### email_campaigns Table
```sql
CREATE TABLE email_campaigns (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,                    -- UTC time
  delay_between_emails INT UNSIGNED NOT NULL,      -- seconds
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### emails Table
```sql
CREATE TABLE emails (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,                 -- UTC time
  sent_at TIMESTAMP NULL,                          -- UTC time
  status ENUM('pending','sent','failed') DEFAULT 'pending',
  unique_key VARCHAR(36) NOT NULL UNIQUE,          -- UUID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id),
  INDEX idx_status (status),
  INDEX idx_scheduled_at (scheduled_at),
  INDEX idx_sent_at (sent_at)
);
```

**Key Design Decisions:**
- TIMESTAMP columns auto-convert to UTC
- `unique_key` prevents duplicate emails across retries
- Indexes optimize queries by status and time
- Cascade delete removes emails when campaign deleted

## API Specification

### Authentication

**POST /auth/login**
```typescript
// Request
{
  email: string;
  password: string;
}

// Response
{
  token: string;          // JWT token
  user: {
    email: string;
  }
}

// Status Codes
// 200: Success
// 401: Invalid credentials
// 400: Missing fields
```

**Authorization Header:**
```
Authorization: Bearer <token>
```

### Email Scheduling

**POST /emails/schedule**
```typescript
// Request (Auth Required)
{
  subject: string;                    // Email subject
  body: string;                       // Email body
  emails: string[];                   // Array of recipients
  startTime: string;                  // ISO 8601 UTC string
  delay: number;                      // Seconds between emails
}

// Response
{
  success: boolean;
}

// Validation
// - All fields required
// - Email array must have ≥1 item
// - Delay must be ≥ EMAIL_MIN_DELAY_MS (default 2s)
// - startTime must be valid ISO string

// Status Codes
// 200: Success
// 400: Validation error
// 401: Unauthorized
```

**GET /emails/scheduled**
```typescript
// Response (Auth Required)
[
  {
    id: number;
    recipient_email: string;
    scheduled_at: string;              // ISO 8601 UTC string
    subject: string;
    status: 'pending' | 'sent' | 'failed';
  }
]

// Status Codes
// 200: Success
// 401: Unauthorized
```

**GET /emails/sent**
```typescript
// Response (Auth Required)
[
  {
    id: number;
    recipient_email: string;
    sent_at: string;                   // ISO 8601 UTC string
    subject: string;
    status: 'sent' | 'failed';
  }
]

// Status Codes
// 200: Success
// 401: Unauthorized
```

## Key Algorithms

### Email Scheduling Flow

```
1. Frontend: User picks local time → Convert to UTC
2. API: Receive UTC time
3. API: Calculate delay for first email = startTime - now()
4. API: Create email_campaigns record
5. API: Create email records, calculate scheduled_at for each
6. Queue: Add job to BullMQ with delay = startTime - now()
7. Redis: Job waits for delay time
8. Worker: Job fires → Check rate limit
9. Worker: If rate limit hit → Reschedule to next hour
10. Worker: Send email via Nodemailer
11. Database: Update status to 'sent' or 'failed'
```

### Rate Limiting Algorithm

```
1. Get hourly key: `email_rate:${sender}:${YYYY-MM-DDTHH}`
2. Increment counter: redis.incr(hourKey)
3. If counter > MAX_EMAILS_PER_HOUR:
   a. Calculate delay to next hour
   b. Move job to delayed queue
   c. Return (job will retry next hour)
4. If counter ≤ limit:
   a. Send email
   b. Update database status
```

### Timezone Conversion

```
Frontend (IST, UTC+5:30):
- User picks: 2026-01-22 14:30 (local)
- Convert: new Date('2026-01-22T14:30').toISOString()
           → '2026-01-22T09:00:00.000Z' (UTC)
- Send to backend

Backend:
- Receive: '2026-01-22T09:00:00.000Z'
- Store: '2026-01-22 09:00:00' (MySQL TIMESTAMP)

Frontend (when displaying):
- MySQL returns: '2026-01-22T09:00:00Z' (UTC ISO)
- Parse: new Date('2026-01-22T09:00:00Z')
- Display: date.toLocaleString() → '2026-01-22 14:30' (local)
```

## Development Workflows

### Adding a New API Endpoint

1. **Create route handler** in `backend/src/routes/`:
```typescript
router.post("/new-endpoint", async (req, res) => {
  try {
    // Validate
    if (!req.body.field) return res.status(400).json({ message: "Missing field" });
    
    // Process
    const result = await db.query("...", [req.body.field]);
    
    // Respond
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
```

2. **Create API function** in `frontend/src/api/email.api.ts`:
```typescript
export async function newEndpoint(data: SomeType) {
  return api.post<ResponseType>("/new-endpoint", data);
}
```

3. **Use in component**:
```typescript
const { data } = await newEndpoint(payload);
```

### Adding a New UI Component

1. **Create component** in `frontend/src/components/NewComponent.tsx`:
```typescript
interface Props {
  // Props here
}

export default function NewComponent({ }: Props) {
  return (
    <div className="...">
      {/* Component JSX */}
    </div>
  );
}
```

2. **Use in page**:
```typescript
import NewComponent from "../components/NewComponent";

export default function Page() {
  return <NewComponent />;
}
```

### Testing Email Sending

1. **Schedule test email**:
   - Upload `sample-emails.csv`
   - Set delay: 10 seconds
   - Set start time: Now

2. **Monitor worker logs**:
```bash
# Terminal with worker
# Watch for "Sending email to..." logs
```

3. **Check results**:
```bash
# Query database
mysql -h 127.0.0.1 -P 3307 -u root -proot reachinbox
SELECT status, COUNT(*) FROM emails GROUP BY status;
```

## Performance Optimization

### Database
- ✅ Indexes on `status`, `scheduled_at`, `sent_at`
- ✅ Query optimization with EXPLAIN ANALYZE
- ✅ Connection pooling (default 10 connections)

### Frontend
- ✅ React 19 auto-batching
- ✅ Vite code splitting
- ✅ Tailwind CSS minification
- ✅ Lazy loading of pages

### Backend
- ✅ Worker concurrency: 3 processes
- ✅ Job exponential backoff: 3 retries
- ✅ Redis pipelining for rate limits
- ✅ HTTP keep-alive connections

## Security Checklist

- ✅ JWT auth with expiry (24 hours default)
- ✅ Input validation on all APIs
- ✅ CORS restricted to frontend origin
- ✅ SQL injection prevented via parameterized queries
- ✅ Idempotent operations (unique_key prevents duplicates)
- ⚠️ TODO for production:
  - Use HTTPS
  - Implement rate limiting per IP
  - Add request logging
  - Use environment-based secrets

## Common Issues & Solutions

### Issue: "Job stuck in queue"
```bash
# Solution: Rebuild queue
cd backend
npm run rebuild
npm run worker
```

### Issue: "Emails not sending"
```bash
# Check worker is running
ps aux | grep "email.worker"

# Check queue size
redis-cli LLEN bull:email-queue:email-queue

# Check Redis connection
redis-cli PING  # Should return PONG
```

### Issue: "Timeout errors"
```bash
# Increase pool size in db/mysql.ts
waitForConnections: true,
connectionLimit: 20,  // Increase from 10
queueLimit: 30        // Increase from 20
```

### Issue: "Memory leak in worker"
```bash
# Worker should be idempotent, but check for:
// 1. Unclosed connections
// 2. Memory leaks in loops
// 3. Infinite retries
```

## Deployment Checklist

- [ ] Set production environment variables
- [ ] Use managed MySQL (AWS RDS, etc.)
- [ ] Use managed Redis (AWS ElastiCache, etc.)
- [ ] Enable HTTPS
- [ ] Set up logging/monitoring
- [ ] Configure auto-scaling
- [ ] Test disaster recovery
- [ ] Set up backups
- [ ] Document runbooks
- [ ] Load test the system

---

**Happy coding!** 🚀
