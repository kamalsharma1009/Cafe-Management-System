# CafeFlow - Cafe Management System

A professional, production-ready Cafe Management System with POS billing, inventory tracking, order management, and business analytics.

## Tech Stack

- **Frontend:** React.js (Vite), Tailwind CSS, Framer Motion, Recharts, TanStack Query
- **Backend:** Node.js, Express.js, Prisma ORM
- **Database:** PostgreSQL
- **Auth:** JWT + bcrypt

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL

### Backend Setup
```bash
cd server
npm install
# Configure your DATABASE_URL in .env
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Login Credentials
- **Email:** manager@cafeflow.com
- **Password:** manager123

## Features

- ☕ POS Billing with token system
- 📦 Product & Category management
- 📊 Dashboard with real-time analytics
- 📋 Order management with cancellation
- 🏪 Inventory tracking with history
- 📈 Reports with Excel export
- 🖨️ Thermal receipt printing (58mm/80mm)
- ⚙️ Cafe settings & configuration
