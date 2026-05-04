# 🚀 Deployment Guide — SupportDesk Ticketing System

## Architecture
- **Frontend**: Next.js → Vercel (free)
- **Backend**: Spring Boot (Java 17) → Render (Docker, free tier)
- **Database**: PostgreSQL → Neon.tech (free serverless Postgres)

---

## Step 1 — Set up Database (Neon.tech)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project (e.g., `ticketing-system`)
3. Copy the **Connection String** — it looks like:
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this — you'll need it for Render

---

## Step 2 — Deploy Backend to Render (Docker)

### Prerequisites
- Push your code to GitHub:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/YOUR_USERNAME/ticketing-system.git
  git push -u origin main
  ```

### Render Setup
1. Go to [render.com](https://render.com) → New → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `ticketing-backend` (or any name)
   - **Region**: Oregon (US West)
   - **Branch**: main
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Instance Type**: Free

4. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `DB_URL` | `jdbc:postgresql://ep-xxx.neon.tech/neondb?sslmode=require` |
   | `DB_USERNAME` | your neon username |
   | `DB_PASSWORD` | your neon password |
   | `JWT_SECRET` | any long random string (min 32 chars) |
   | `CORS_ORIGINS` | `https://YOUR-APP.vercel.app` (add after frontend deploy) |

5. Click **Create Web Service** → wait ~5 minutes for first build
6. Copy your Render URL: `https://ticketing-backend.onrender.com`

> ⚠️ **Free tier note**: Render free services spin down after 15 min inactivity. First request after sleep takes ~30 seconds.

---

## Step 3 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → Add New → **Project**
2. Import your GitHub repo
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
4. Add **Environment Variable**:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://ticketing-backend.onrender.com` |
5. Click **Deploy** → wait ~2 minutes
6. Copy your Vercel URL: `https://your-app.vercel.app`

---

## Step 4 — Update CORS on Render

1. Go to Render → your service → Environment
2. Update `CORS_ORIGINS` to your Vercel URL:
   ```
   https://your-app.vercel.app,http://localhost:3000
   ```
3. Service will auto-redeploy

---

## ✅ Done! Test your deployment

Visit your Vercel URL and log in with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ticketing.com | admin123 |
| Support Agent | agent@ticketing.com | agent123 |
| Regular User | user@ticketing.com | user123 |

---

## Local Development

### Backend
```bash
cd backend
# Start PostgreSQL locally first, then:
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
# Make sure .env.local has: NEXT_PUBLIC_API_URL=http://localhost:8080
npm run dev
# Runs on http://localhost:3000
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | None | Register user |
| POST | /api/auth/login | None | Login |
| GET | /api/tickets/my | User+ | Get my tickets |
| POST | /api/tickets | User+ | Create ticket |
| GET | /api/tickets/{id} | User+ | Get ticket |
| PUT | /api/tickets/{id} | User+ | Update ticket |
| POST | /api/tickets/{id}/assign | Agent+ | Assign ticket |
| POST | /api/tickets/{id}/resolve | Agent+ | Resolve ticket |
| POST | /api/tickets/{id}/close | User+ | Close ticket |
| POST | /api/tickets/{id}/comments | User+ | Add comment |
| GET | /api/tickets/{id}/comments | User+ | Get comments |
| POST | /api/tickets/{id}/rate | Owner | Rate ticket |
| GET | /api/tickets/search?q=... | User+ | Search tickets |
| GET | /api/admin/users | Admin | List users |
| POST | /api/admin/users | Admin | Create user |
| PUT | /api/admin/users/{id}/role | Admin | Change role |
| POST | /api/admin/users/{id}/deactivate | Admin | Deactivate user |
| GET | /api/admin/tickets | Admin | All tickets |
| POST | /api/admin/tickets/{id}/force-resolve | Admin | Force resolve |
| POST | /api/admin/tickets/{id}/assign | Admin | Admin assign |
