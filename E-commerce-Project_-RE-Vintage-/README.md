# RE:VINTAGE — Analogue Collective

A full-stack, multi-vendor e-commerce marketplace dedicated to vinyl records, vintage audio equipment, and curated vintage apparel. Built with a high-contrast **Persona 5-inspired neo-brutalist UI** (`#F5F2EB` parchment cream, `#141414` matte black, `#E09F3E` gold, and `#D92B2B` accent red with skewed containers and hard offset drop shadows).

---

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** FastAPI (Python 3.11+), SQLAlchemy 2.0 (async), Pydantic v2, Uvicorn
- **Database:** PostgreSQL 15+ (accessed via `asyncpg`)
- **Authentication:** JWT (HTTP Bearer) + Optional Google OAuth 2.0 (with fallback Dev Demo mode)
- **Architecture:** Next.js acts as the client-facing reverse proxy, rewriting `/api/*` and `/uploads/*` requests to FastAPI on port `8000`.

```
E-commerce-Project_-RE-Vintage-/
├── backend/          # FastAPI application (endpoints, SQLAlchemy models, schemas, seed script)
├── frontend/         # Next.js App Router (Persona 5 neo-brutalist UI, components, catalog hooks)
├── scripts/          # Database setup and migration scripts
├── logs/             # Generated runtime logs (backend.log, frontend.log)
├── start.sh          # Linux/VM one-command launcher
└── README.md
```

---

## 📋 Prerequisites

Before starting, ensure the following are installed on your host machine or VM:

| Tool | Minimum Version | Notes |
| :--- | :--- | :--- |
| **Python** | `3.11+` | With `venv` support (`python3-venv` on Ubuntu/Debian) |
| **Node.js** | `18+` (`20 LTS` recommended) | Comes with `npm` |
| **PostgreSQL**| `15+` | Server must be running on port `5432` |
| **Git** | `2.30+` | |

---

## ⚙️ Environment Configuration

### 1. Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```bash
# Linux / macOS / Git Bash
cp backend/.env.example backend/.env

# Windows PowerShell
copy backend\.env.example backend\.env
```

Configure `backend/.env` with your database credentials:

```env
DATABASE_URL=postgresql+asyncpg://vinyl:vinylpass123@localhost:5432/vinyl_db
SECRET_KEY=generate_a_random_48_char_secret_key_here
APP_ENV=development
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Optional Google OAuth 2.0 (leave blank for development demo flow)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
```

> [!TIP]
> **Generate a secure secret key:**
> ```bash
> python3 -c "import secrets; print(secrets.token_urlsafe(48))"
> ```

> [!IMPORTANT]
> **Google OAuth Setup:**
> - If `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are left blank, RE:VINTAGE automatically runs social login in **DEMO** mode during development.
> - When using real Google credentials, register this exact Authorized Redirect URI in your [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
>   ```
>   http://localhost:3000/api/auth/oauth/google/callback
>   ```
>   *(Note: This uses port `3000`, because the browser talks through the Next.js reverse proxy).*

### 2. Frontend (`frontend/.env.local`)

Copy `frontend/.env.example` to `frontend/.env.local`:

```bash
# Linux / macOS / Git Bash
cp frontend/.env.example frontend/.env.local

# Windows PowerShell
copy frontend\.env.example frontend\.env.local
```

Default contents:
```env
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=
```
*(Leave `NEXT_PUBLIC_API_URL` blank so client requests use relative paths proxied by Next.js).*

---

## 🚀 Linux / VM Quickstart (One-Command Launch)

If you are on Linux or a Linux Virtual Machine (Ubuntu/Debian):

### 1. Database Setup (First Time Only)

Run the included automated setup script to create the PostgreSQL role, database, and initial `.env`:
```bash
sudo systemctl start postgresql
bash scripts/setup_db.sh
```

### 2. Launch Everything

From the repository root, execute:
```bash
bash start.sh
```

What `start.sh` does automatically:
1. Starts the PostgreSQL service if inactive.
2. Creates the Python virtual environment in `backend/.venv` and installs dependencies from `requirements.txt`.
3. Installs frontend `npm` dependencies if missing.
4. Generates `frontend/.env.local` from the template.
5. Starts the FastAPI server on `http://0.0.0.0:8000` (logged to `logs/backend.log`).
6. Starts the Next.js dev server on `http://0.0.0.0:3000` (logged to `logs/frontend.log`).

Press `Ctrl+C` in the terminal to stop all running services.

### Clean Restart / Freeing Ports

If processes become orphaned in the background:
```bash
fuser -k 8000/tcp 3000/tcp
bash start.sh
```

### Accessing from a Host Machine Browser (VM Setup)

When running inside a VirtualBox / VMware / KVM guest:
1. Find the VM's local IP address: `hostname -I | awk '{print $1}'` (e.g. `192.168.56.10`).
2. In `backend/.env`, set:
   ```env
   FRONTEND_URL=http://<VM_IP>:3000
   APP_URL=http://<VM_IP>:3000
   ```
3. Open `http://<VM_IP>:3000` in your host browser.

---

## 🪟 Windows Native Setup (PowerShell / Command Prompt)

On Windows without WSL, run the backend and frontend in two separate terminals.

### Step 1: Create PostgreSQL Database

Open `psql` (SQL Shell) or execute in PowerShell as the PostgreSQL superuser:
```sql
CREATE ROLE vinyl LOGIN PASSWORD 'vinylpass123';
CREATE DATABASE vinyl_db OWNER vinyl;
GRANT ALL PRIVILEGES ON DATABASE vinyl_db TO vinyl;
```

### Step 2: Terminal 1 — Backend (FastAPI)

```powershell
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# (If PowerShell blocks script execution, run:
#  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass)

# Install Python requirements
pip install -r requirements.txt

# Create .env from template
copy .env.example .env

# Verify backend/.env has:
# DATABASE_URL=postgresql+asyncpg://vinyl:vinylpass123@localhost:5432/vinyl_db
# SECRET_KEY=your_random_secret_here
# FRONTEND_URL=http://localhost:3000

# Start FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*Wait until you see `Application startup complete`.*

### Step 3: Terminal 2 — Frontend (Next.js)

```powershell
# In a new terminal, navigate to frontend directory
cd frontend

# Create .env.local
copy .env.example .env.local

# Install node dependencies
npm install

# Start Next.js development server
npm run dev
```

> [!NOTE]
> Windows developers with **WSL2** (Windows Subsystem for Linux) or **Git Bash** can follow the [Linux Quickstart](#-linux--vm-quickstart-one-command-launch) to run `bash start.sh` directly.

---

## 👤 Pre-Seeded Debug & Test Accounts

In development mode (`APP_ENV=development`), the backend automatically seeds test accounts on startup.

### 🔑 Shared Password
```
Demo1234!
```

### Account Roster

| Role | Email | Password | Landing Page & Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@revintage.demo` | `Demo1234!` | Full system control. Manage shops, users, and vinyl badges at [`/admin`](http://localhost:3000/admin) |
| **Seller** | `seller@revintage.demo` | `Demo1234!` | Store management. Owns the sample store **"Demo Records"**; manage inventory and add items at [`/dashboard/products`](http://localhost:3000/dashboard/products) |
| **Customer** | `customer@revintage.demo` | `Demo1234!` | Standard customer. Test browsing, shopping crate, and the Store Builder flow at [`/dashboard/store`](http://localhost:3000/dashboard/store) |

### Promote Any User to Admin

To grant administrator privileges to any registered user:
```bash
# Linux
sudo -u postgres psql -d vinyl_db -c "UPDATE users SET role='admin' WHERE email='your_email@example.com';"

# Windows PowerShell
psql -U postgres -d vinyl_db -c "UPDATE users SET role='admin' WHERE email='your_email@example.com';"
```

---

## 🔍 Verification & Health Checks

Verify your setup by visiting these URLs in your browser:

| Resource | URL | Expected Output |
| :--- | :--- | :--- |
| **Storefront** | `http://localhost:3000` | RE:VINTAGE homepage with Persona 5 neo-brutalist crate feed |
| **API Docs (Swagger UI)** | `http://localhost:8000/docs` | Interactive OpenAPI documentation for all backend routes |
| **API Health Check** | `http://localhost:8000/health` | `{"status":"ok"}` |
| **Database Connection** | `http://localhost:8000/health/db` | `{"db":"ok"}` |

---

## 🛠 Troubleshooting

| Problem | Root Cause | Solution |
| :--- | :--- | :--- |
| `Address already in use` (Port 8000 or 3000) | A previous Uvicorn or Next.js process is still running | **Linux:** `fuser -k 8000/tcp 3000/tcp`<br>**Windows:** Find PID with `netstat -ano \| findstr :8000` and kill with `taskkill /PID <PID> /F` |
| `psycopg2 / asyncpg: ConnectionRefusedError` | PostgreSQL is not running or listening on port 5432 | **Linux:** `sudo systemctl start postgresql`<br>**Windows:** Start the `postgresql-x64-XX` service via `services.msc` |
| `Invalid password for user "vinyl"` | Password in `DATABASE_URL` doesn't match PostgreSQL role | Re-run SQL: `ALTER ROLE vinyl WITH PASSWORD 'vinylpass123';` |
| `Google OAuth: redirect_uri_mismatch` | Google Console URI does not match port 3000 proxy | Ensure authorized redirect in Google Console is exactly `http://localhost:3000/api/auth/oauth/google/callback` |
| PowerShell: `cannot be loaded because running scripts is disabled` | Windows ExecutionPolicy restrictions | In PowerShell: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` |
| `NetworkError when attempting to fetch resource` | Frontend cannot reach backend | Confirm backend is up at `http://localhost:8000/health` and `frontend/.env.local` points to `BACKEND_URL=http://localhost:8000` |
