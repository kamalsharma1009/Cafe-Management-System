# CafeFlow Cafe Management System - Deployment Guide

This guide provides step-by-step instructions to deploy the CafeFlow Cafe Management System using **NeonDB** (Database), **Railway** (Backend API), and **Vercel** (Frontend UI).

---

## Prerequisites
* A GitHub account.
* A [Neon Console](https://neon.tech/) account.
* A [Railway](https://railway.app/) account.
* A [Vercel](https://vercel.com/) account.
* Git installed on your local machine.

---

## Phase 1: Database Setup (NeonDB)

1. Log in to your **Neon Console**.
2. Click **Create Project**.
3. Name your project (e.g., `cafeflow-db`), select PostgreSQL version (default is fine), and choose the region closest to your users.
4. Click **Create Project**.
5. Once created, copy the **Connection String** from the dashboard.
   * Make sure it is set to **Prisma** or **URIs** mode.
   * Example: `postgresql://neondb_owner:password@ep-cool-snowflake-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`
6. Save this connection string. This will be your `DATABASE_URL` env variable.

---

## Phase 2: Run Database Migrations & Seeding

Before deploying the backend, you should push the schema and seed the initial manager credentials into your new Neon database.

1. Open a terminal on your local machine and navigate to the project's **`server`** directory:
   ```bash
   cd e:/Project/SoftSpera/Cafe-Management-System/server
   ```
2. Open your local `server/.env` file and set the `DATABASE_URL` to your NeonDB connection string:
   ```env
   DATABASE_URL="postgresql://neondb_owner:password@ep-cool-snowflake-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
3. Run the following command to push your database schema directly to NeonDB:
   ```bash
   npx prisma db push
   ```
4. Seed the initial admin/manager user and default data:
   ```bash
   npm run seed
   ```
   * *Initial Manager credentials:*
     * **Email**: `manager@cafeflow.com`
     * **Password**: `manager123`

---

## Phase 3: Backend Deployment (Railway)

### Step 1: Push Project to GitHub
1. Initialize git in the root of the project (`Cafe-Management-System`) if not done already:
   ```bash
   git init
   git add .
   git commit -m "Prepare deployment"
   ```
2. Create a new repository on GitHub (private or public) and push your code:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

### Step 2: Configure Railway
1. Log in to **Railway**.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Choose your repository: `Cafe-Management-System`.
4. Click **Configure** and choose the root directory to deploy as **`/server`** (Railway will prompt you for the subdirectory/root). If not prompted, we will set it under settings.
5. In the service settings under **Variables**, click **Raw Editor** or add the following Environment Variables individually:

| Key | Value | Description |
|---|---|---|
| `PORT` | `5000` | The port the backend listens on. |
| `NODE_ENV` | `production` | Enables production optimizations. |
| `DATABASE_URL` | `<Your-NeonDB-Connection-String>` | NeonDB database URL. |
| `JWT_SECRET` | `<random-32-char-string>` | Secret key for signing auth tokens. |
| `CLIENT_URL` | `https://your-frontend.vercel.app,http://localhost:5173` | Comma-separated list of allowed CORS origins (use `*` temporarily if frontend is not yet deployed). |

6. In Railway **Settings**:
   * Set **Root Directory** to `server`.
   * Set **Build Command** to `npm run build` (this runs `npx prisma generate`).
   * Set **Start Command** to `npm run start`.
7. Railway will build and deploy the backend. Once deployed, it will generate a public URL under settings (e.g. `https://cafeflow-production.up.railway.app`). Copy this URL.

---

## Phase 4: Frontend Deployment (Vercel)

1. Log in to **Vercel**.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository `Cafe-Management-System`.
4. Configure the Project Settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `client`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. In **Environment Variables**, add:

| Key | Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://your-backend-railway-url.up.railway.app` | **Note:** DO NOT append a trailing slash `/` at the end of the URL (e.g., use `https://cafeflow-production.up.railway.app` NOT `https://cafeflow-production.up.railway.app/`). |

6. Click **Deploy**. Vercel will build and deploy the React Vite application.
7. Once Vercel generates your production frontend URL (e.g. `https://cafeflow-management.vercel.app`), go back to your **Railway Backend Variables** and update `CLIENT_URL` with your Vercel URL to secure CORS access:
   ```env
   CLIENT_URL="https://cafeflow-management.vercel.app,http://localhost:5173"
   ```

---

## Phase 5: Verification

1. Open your Vercel URL in a browser.
2. Log in using:
   * **Email**: `manager@cafeflow.com`
   * **Password**: `manager123`
3. Go to **Products** and verify you can:
   * Add a product using an **Image URL** (e.g., pasting a Google Image link).
   * Upload an image file.
4. Try placing an order in **POS** and verify the printable receipt and reports pages render and operate correctly.
