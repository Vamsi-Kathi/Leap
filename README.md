# 🎫 SupportDesk — Full-Stack Ticketing System

A production-ready IT support ticketing system built with **Spring Boot** (Java 17) + **Next.js** + **PostgreSQL**.

## Features

### ✅ Authentication & Authorization
- JWT-based login/logout
- Role-based access: **User**, **Support Agent**, **Admin**
- Per-role data isolation

### ✅ User Dashboard
- Create tickets (subject, description, priority)
- View ticket list with status badges
- Add comments to tickets
- View full ticket history with comment thread
- Rate resolved tickets (1–5 stars) with feedback

### ✅ Support Agent Interface
- View assigned tickets
- Add comments and update ticket status
- Assign tickets to other agents

### ✅ Admin Panel
- User management: add, deactivate, change roles
- View all tickets across the system
- Force resolve/close any ticket
- Assign tickets to any agent

### ✅ Ticket Management
- Full lifecycle: Open → In Progress → Resolved → Closed
- Priority levels: Low, Medium, High, Urgent
- Search by subject/description
- Filter by status or priority

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2, Spring Security, JPA |
| Database | PostgreSQL (Hibernate ORM) |
| Auth | JWT (jjwt 0.12) |
| Frontend | Next.js 14, React 18, Axios |
| Deployment | Render (Docker) + Vercel + Neon.tech |

## Quick Start

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for full hosting instructions.

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ticketing.com | admin123 |
| Agent | agent@ticketing.com | agent123 |
| User | user@ticketing.com | user123 |
