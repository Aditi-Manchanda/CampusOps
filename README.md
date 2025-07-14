# BITS Event Manager

BITS Event Manager is a **full-stack campus event management and room-booking system** built to simplify how students, clubs, and staff create, approve, and attend events at BITS Pilani.

---

## 🎯 Purpose & Use

1. **Centralised Event Hub** – provides a single portal where every upcoming campus event can be discovered and filtered by date, tag, or organiser.
2. **Hassle-free Bookings** – replaces manual room reservation emails with automatic conflict-checked bookings backed by Firestore transactions.
3. **Paperless Attendance** – leverages unique QR codes and a built-in scanner for fast, contact-free check-ins and automatic attendance records.
4. **Automated Notifications** – keeps organisers and attendees in the loop with instant RSVP confirmations and day-before reminders.

---

## ✨ Key Features

| Category | Highlights |
|----------|------------|
| Event Management | Create events with posters, tags, RSVP limits, and deadlines; edit or cancel with appropriate permissions. |
| Approval Workflow | Staff can review and approve both **role requests** (student → club admin / staff) and **event submissions**. |
| Room Booking | Real-time clash detection prevents double bookings; approved events lock the room automatically. |
| QR Attendance | Students receive a unique QR code on RSVP; organisers scan codes to mark **checked-in** status. |
| Dashboards | Role-specific dashboards for pending approvals, upcoming events, and personal RSVPs. |
| Email Service | Nodemailer + Gmail SMTP send confirmations, rejections (with reason), and daily reminders. |
| Responsive UI | Mobile-first React interface styled with Tailwind CSS. |

---

## 👥 User Roles & Permissions

| Role | Can… | Cannot… |
|------|-------|---------|
| **Student** | Browse approved events, search/filter, RSVP, view personal QR codes, see their attendance history. | Create events, approve items, scan check-ins. |
| **Club Admin** | All student abilities **+** create events, view room availability calendar, scan check-ins for their events. | Approve other club admins or events from other clubs. |
| **Staff** | Platform-wide oversight: approve/reject role requests & events, run check-ins, view all bookings. | — |

---

## 🏗 Tech Stack

**Frontend (SPA)**
- React 18 + Vite
- **Tailwind CSS** for utility-first styling
- React Router DOM & Axios
- `qrcode.react` and `html5-qrcode` for QR functionality

**Backend (REST API)**
- Node.js 18 + Express 4
- Firebase Admin SDK
- Multer (file uploads), Nodemailer, node-cron

**Database & Cloud Services**
- Google **Firestore** (NoSQL)
- Firebase **Authentication** (Google sign-in)
- Firebase **Storage** (poster uploads)
- Gmail **SMTP** (emails)

---

## 🗺 High-Level Architecture

```
┌───────────────┐           HTTPS            ┌────────────────────┐
│ React Client  │  ─────────▶  API Server   ─▶  Firebase Services │
│ (browser)     │           (Express)       │  Auth │ Firestore   │
└───────────────┘   token    ▲   JSON        │  Storage │ SMTP    │
        ▲                   │               └────────────────────┘
        └──── JWT & state ───┘
```

- **React Client**: handles UI, gathers auth token, and calls `/api/*` endpoints.
- **API Server**: validates tokens, enforces role permissions, executes business logic, and persists data.
- **Firebase Services**: provide secure auth, realtime database, file storage, and email delivery.

---

## 🔑 Core Functional Flow

1. **Sign-in** – User logs in with Google; token is sent to backend for verification.
2. **Role Check** – `authMiddleware` fetches the user’s role; `checkRole` gatekeeps protected endpoints.
3. **Event Creation** – Club Admin submits form ➜ backend checks room conflicts ➜ stores event (pending/approved) and booking atomically.
4. **RSVP & QR** – Student RSVPs ➜ backend creates `rsvps` doc + SHA-256 hash ➜ client renders QR code.
5. **Check-in** – Organiser scans QR ➜ `/admin/check-in` marks attendance if valid and unused.
6. **Reminders** – `node-cron` runs daily to email tomorrow’s attendees.

---

> BITS Event Manager combines modern web frameworks with Firebase’s managed services to deliver a secure, user-friendly platform for campus event life-cycle management.
