# TaskFlow — Real-time Collaborative Project Management App

A full-stack Trello-style Kanban board with **live real-time sync**, **role-based team boards**,
and a built-in **analytics dashboard**. Built with a modern, production-grade stack.

## ✨ Features

- 🔐 JWT auth (access + refresh tokens), bcrypt password hashing
- 📋 Boards → Lists → Cards, with drag-and-drop reordering (`@dnd-kit`)
- ⚡ Real-time updates across all connected clients via **Socket.IO** (card moves, new cards/lists, comments)
- 👥 Role-based board membership (Owner / Admin / Member / Viewer)
- 📊 Live analytics dashboard (cards per list, priority breakdown, overdue count) with Recharts
- 📎 Secure file attachments on cards via **AWS S3** — direct browser-to-S3 upload using
  short-lived presigned URLs (AWS credentials never touch the frontend)
- 🌙 Dark mode, fully responsive UI
- 🛡️ Rate limiting + Helmet security headers on the API, IAM least-privilege access to S3

## 🧱 Tech Stack

| Layer      | Tech |
|------------|------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, Zustand, @dnd-kit, Recharts |
| Backend    | Node.js, Express, TypeScript, Socket.IO |
| Database   | PostgreSQL + Prisma ORM |
| Cloud      | AWS S3 (file storage), IAM Roles, Secrets Manager, ECS Fargate + RDS for deployment |
| Auth       | JWT (access + refresh), bcryptjs |
| Validation | Zod |

## 📂 Project Structure

```
taskflow/
├── backend/
│   ├── prisma/schema.prisma      # Database models (User, Board, List, Card, Comment, ActivityLog)
│   ├── src/
│   │   ├── controllers/          # Business logic
│   │   ├── routes/               # Express route definitions
│   │   ├── middleware/           # Auth guard, error handler
│   │   ├── sockets/               # Socket.IO real-time layer
│   │   └── index.ts               # App entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/                 # Login, Register, Dashboard, BoardView
    │   ├── components/            # ListColumn, CardItem, AnalyticsPanel, Navbar
    │   ├── store/                 # Zustand stores (auth, board)
    │   ├── hooks/useSocket.ts     # Real-time sync hook
    │   └── api/axios.ts           # API client with auto token refresh
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or a hosted instance like Neon/Supabase)

### 1. Backend setup
```bash
cd backend
npm install
cp .env.example .env       # fill in your DATABASE_URL and JWT secrets
npx prisma migrate dev --name init
npm run seed                # optional: creates demo@taskflow.com / password123
npm run dev                 # starts API on http://localhost:5000
```

### 2. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev                 # starts app on http://localhost:5173
```

Open `http://localhost:5173`, log in with the seeded demo account (or register a new one),
and start creating boards.

### 3. AWS S3 setup (for file attachments)
```bash
cd infra/aws
chmod +x setup-bucket.sh
./setup-bucket.sh                # creates a private, encrypted, versioned S3 bucket
```
Then add the bucket name + region to `backend/.env` (`AWS_S3_BUCKET`, `AWS_REGION`).
Locally you can use a personal AWS profile's temporary credentials; in production, skip
credentials entirely and attach `infra/aws/iam-policy.json` to your ECS Task Role instead.
Full architecture + security reasoning: [`infra/aws/DEPLOYMENT.md`](infra/aws/DEPLOYMENT.md).

## 🗄️ Database Schema (high level)

```
User ──< BoardMember >── Board ──< List ──< Card >── Comment
                                              │
                                          ActivityLog
```

Every board tracks membership with roles, every card can have an assignee, due date, priority,
and labels, and every board-level action is written to an `ActivityLog` table for audit history.

## 🔮 Possible Next Steps (good talking points in an interview)
- Deploy: Vercel (frontend) + Railway/Render (backend + Postgres)
- Add file attachments via S3-compatible storage
- Add optimistic UI rollback on failed drag-and-drop
- Add board-level webhooks / Slack notifications on card moves
- Write integration tests with Vitest + Supertest

---

### 💡 How to talk about this on your resume

> Built a full-stack real-time project management tool (TaskFlow) using React, TypeScript,
> Node.js/Express, PostgreSQL and Socket.IO, implementing JWT authentication, drag-and-drop
> Kanban boards with live multi-user sync, and an analytics dashboard. Integrated AWS S3 for
> secure file attachments using presigned URLs and IAM least-privilege roles (no long-lived
> credentials in the app), and designed the production deployment architecture (ECS Fargate,
> RDS, Secrets Manager) — architected the relational schema (Prisma) and real-time event
> system from scratch.
