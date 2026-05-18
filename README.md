# ⬡ CloudGuard

> Cloud Resource Access Management & Monitoring Platform  
> Full-stack web application — Bachelor Thesis Project

---

## Tech Stack

| Layer                 | Technology            |
| --------------------- | --------------------- |
| Layer                 | Technology            |
| --------------------- | --------------------- |
| **Runtime**           | Node.js 18+           |
| **Backend Framework** | Express.js            |
| **Database**          | PostgreSQL 14+        |
| **ORM**               | Prisma                |
| **Authentication**    | JWT + bcrypt          |
| **Frontend**          | React 18              |
| **HTTP Client**       | Axios                 |
| **Routing**           | React Router v6       |
| **Charts**            | Recharts              |
| **Monitoring**        | systeminformation     |
| **API Documentation** | Swagger / OpenAPI 3.0 |
| **Deployment**        | Render + Vercel       |

---

## Features

### Authentication & Authorization

JWT-based login and registration
Password hashing using bcrypt
Role-based access control (ADMIN, USER, VIEWER)
Protected frontend and backend routes
Persistent authentication using localStorage
Swagger Bearer Token authentication support

### Real-Time Monitoring System

System Monitoring Dashboard

Real-time CPU monitoring
Real-time RAM monitoring
Disk usage monitoring
Network activity monitoring
Live utilization history chart
Automatic polling every 15 seconds
Manual refresh support
Real Telemetry Integration

The monitoring subsystem uses the Node.js package:

npm install systeminformation

to obtain real telemetry from the operating system.
Implemented metrics:

CPU load
RAM usage
Disk usage
Network statistics
Live resource telemetry

The system retrieves real hardware statistics instead of mock data.

### Dashboard

- Real-time system metrics (CPU, RAM, Disk, Network)
- Resource status overview (online / offline / maintenance counts)
- Live area chart with 20-minute utilization history
- Per-resource metrics table with visual progress bars
- Auto-polling every 15 seconds + manual refresh

### Cloud Resources

- Full CRUD: create, view, update, delete resources
- Resource types: EC2, S3, RDS, Lambda, ECS, EKS, CloudFront, VPC, Other
- Status indicators with animated live badges
- Filter by status and type
- Access count per resource

### User Management _(Admin only)_

- View all users with role badges
- Change user roles via dropdown modal
- Delete users (with self-deletion guard)
- Role distribution summary cards

### Access Control _(Admin only)_

- Grant access to users per resource (OWNER / EDITOR / VIEWER roles)
- Revoke access
- Filter access records by resource
- Resource access summary cards (clickable to filter)

### Audit Logs _(Admin only)_

- All user actions are logged: login, register, CRUD, access changes
- Filterable by action type
- Clickable action badges to filter
- Pagination
- Auto-refresh / live mode toggle

### API Documentation

- Swagger UI at `http://localhost:5000/api/docs`
- All endpoints documented with request/response schemas
- Bearer token auth support in Swagger UI

---

## Database Schema

```
Users        — id, email, password, name, role, createdAt, updatedAt
Resources    — id, name, type, status, region, description, cpuUsage, ramUsage, createdAt, updatedAt
Access       — id, userId, resourceId, role, grantedAt
Logs         — id, userId, action, details, ipAddress, createdAt
```

---

## Project Structure

```
cloudguard/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Demo data seeder
│   ├── src/
│   │   ├── app.js              # Express app setup
│   │   ├── server.js           # Entry point
│   │   ├── config/
│   │   │   ├── database.js     # Prisma client singleton
│   │   │   └── swagger.js      # OpenAPI config
│   │   ├── controllers/        # Request handlers (MVC)
│   │   ├── routes/             # Express routers + Swagger JSDoc
│   │   ├── services/           # Business logic layer
│   │   └── middleware/
│   │       └── auth.middleware.js  # JWT + RBAC
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js              # Router setup
        ├── index.js
        ├── index.css           # CSS variables + global reset
        ├── context/
        │   └── AuthContext.js  # Auth state + JWT management
        ├── services/
        │   └── api.js          # Axios instance + interceptors
        ├── components/
        │   ├── Layout.js       # Sidebar + topbar shell
        │   └── ui.js           # Reusable components (Button, Modal, Table…)
        └── pages/
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── DashboardPage.js
            ├── ResourcesPage.js
            ├── UsersPage.js
            ├── AccessPage.js
            └── LogsPage.js
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

---

### 1. Clone the project

```bash
git clone <repo-url>
cd cloudguard
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/cloudguard?schema=public"
JWT_SECRET="change-this-to-a-long-random-secret"
JWT_EXPIRES_IN="24h"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

Set up the database:

```bash
# Generate Prisma client
npm run db:generate

# Create tables (first time)
npm run db:push

# OR run migrations
npm run db:migrate

# Seed with demo data
npm run db:seed
```

Start the backend:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Backend runs at: `http://localhost:5000`  
Swagger docs: `http://localhost:5000/api/docs`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

### 4. Demo Accounts

After seeding, use these accounts:

| Role       | Email               | Password |
| ---------- | ------------------- | -------- |
| **Admin**  | admin@cloudguard.io | admin123 |
| **User**   | alice@cloudguard.io | user123  |
| **Viewer** | bob@cloudguard.io   | user123  |

---

## API Endpoints

| Method | Path                    | Auth       | Description           |
| ------ | ----------------------- | ---------- | --------------------- |
| POST   | `/api/auth/register`    | Public     | Register user         |
| POST   | `/api/auth/login`       | Public     | Login, get JWT        |
| GET    | `/api/auth/me`          | Any        | Current user          |
| GET    | `/api/resources`        | Any        | List resources        |
| POST   | `/api/resources`        | Admin/User | Create resource       |
| PUT    | `/api/resources/:id`    | Admin/User | Update resource       |
| DELETE | `/api/resources/:id`    | Admin      | Delete resource       |
| GET    | `/api/users`            | Admin      | List all users        |
| PATCH  | `/api/users/:id/role`   | Admin      | Change user role      |
| DELETE | `/api/users/:id`        | Admin      | Delete user           |
| GET    | `/api/access`           | Admin      | All access records    |
| POST   | `/api/access/grant`     | Admin      | Grant access          |
| POST   | `/api/access/revoke`    | Admin      | Revoke access         |
| GET    | `/api/logs`             | Admin      | Audit log entries     |
| GET    | `/api/monitor/overview` | Any        | System overview stats |
| GET    | `/api/monitor/metrics`  | Any        | Live resource metrics |

Full interactive docs at `/api/docs`.

---

## Environment Variables

| Variable         | Description                  | Default                 |
| ---------------- | ---------------------------- | ----------------------- |
| `DATABASE_URL`   | PostgreSQL connection string | —                       |
| `JWT_SECRET`     | Secret for signing JWTs      | —                       |
| `JWT_EXPIRES_IN` | Token expiry duration        | `24h`                   |
| `PORT`           | Backend port                 | `5000`                  |
| `NODE_ENV`       | Environment                  | `development`           |
| `FRONTEND_URL`   | CORS allowed origin          | `http://localhost:3000` |

---

## Architecture Notes

- **MVC pattern** — controllers handle HTTP, services handle business logic, Prisma handles data
- **JWT stateless auth** — token stored in localStorage, injected via Axios interceptor
- **Role guards** — `authorize(...roles)` middleware on every protected route
- **Optimistic UI** — success/error feedback on all mutations
- **Mock monitoring** — CPU/RAM metrics fluctuate on each poll to simulate real telemetry
- **Audit trail** — every mutating action logs to the `Logs` table with user + IP

---

## Production Considerations

- Replace `JWT_SECRET` with a cryptographically random 256-bit key
- Use `npm run db:migrate` instead of `db:push` in production
- Add rate limiting (e.g. `express-rate-limit`) to auth endpoints
- Serve frontend via `npm run build` + a static server or CDN
- Configure PostgreSQL with proper user permissions and SSL
- Set `NODE_ENV=production` to suppress stack traces in errors

---

_Built with React, Express, PostgreSQL, and Prisma · CloudGuard v1.0.0_
