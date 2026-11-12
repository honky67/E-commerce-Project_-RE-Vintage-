# RE:VINTAGE Analogue Collective

Multi-vendor marketplace for analogue vinyl records and vintage apparel.
**Stack:** Next.js 14 + Tailwind + Framer Motion (frontend) · FastAPI + SQLAlchemy 2.0 async + PostgreSQL (backend).

```
backend/    FastAPI API   (app/core, app/db, app/models, app/api/routes, app/seed.py)
frontend/   Next.js app   (src/app, src/components, src/lib, src/data, public/)
scripts/    setup_db.sh   (creates the PostgreSQL user + database + backend/.env)
```

All commands below run from the **project folder** (the one that contains `backend` and `frontend`).

---

## First-time setup (once)

**Needs:** Node 20+ (Node 18 works but warns), Python 3.11+, PostgreSQL.

```bash
# 1. Database
sudo apt install postgresql
bash scripts/setup_db.sh              # creates DB + user, writes backend/.env

# 2. Backend
cd backend
python3 -m venv .venv
source .venv/bin/activate             # prompt must now start with (.venv)
pip install -r requirements.txt
cd ..

# 3. Frontend
cd frontend
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local
npm install
cd ..
```

## Quick launch (every time)

Open **two terminals** (the `+` button in the VS Code terminal panel).

**Terminal 1: backend**
```bash
sudo systemctl start postgresql       # only needed after a reboot
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```
Wait for `Application startup complete`. Leave it running.

**Terminal 2: frontend**
```bash
cd frontend
npm run dev
```

**Open:** http://localhost:3000 (site) · http://localhost:8000/docs (API docs) · http://localhost:8000/health/db (should say `{"db":"ok"}`)

Stop either server with `Ctrl+C`. Don't type other commands in a terminal that is running a server.

---

## Demo accounts (development only)

Created automatically when the backend starts. Password for all: `Demo1234!`

| Role | Email | Lands on |
|---|---|---|
| Admin | admin@revintage.demo | /admin |
| Seller | seller@revintage.demo | /dashboard/products (owns "Demo Records") |
| Customer | customer@revintage.demo | / |

On `/login`, the **One-click demo login** buttons use these. They are disabled in production (`APP_ENV=production`).

**Make your own account an admin:**
```bash
sudo -u postgres psql vinyl_db -c "UPDATE users SET role='admin' WHERE email='you@example.com';"
```

## Where things are

| Page | Path | Access |
|---|---|---|
| Home, Shops list | `/`, `/shops` | public |
| Store pages, product pages | `/vendor/...`, `/product/...` | store pages need login |
| Login / Register | `/login`, `/register` | public |
| Build your store | `/dashboard/store` | logged in |
| Product manager | `/dashboard/products` | logged in (seller) |
| Admin portal | `/admin` | admin only |

## Adding images

Put files in `frontend/public/` (served from the site root):
```
frontend/public/images/nav-bg.jpg     ->  /images/nav-bg.jpg
frontend/public/products/vnl-1.jpg    ->  /products/vnl-1.jpg
```
Navbar background: set `NAV_BG_IMAGE = "/images/nav-bg.jpg"` in `frontend/src/components/SiteHeader.tsx`.

## Troubleshooting

| Problem | Fix |
|---|---|
| `NetworkError when attempting to fetch resource` | Backend isn't running. Start Terminal 1. Check `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000`, then restart `npm run dev`. |
| `Field required: DATABASE_URL / SECRET_KEY` | `backend/.env` is missing. Run `bash scripts/setup_db.sh`. |
| `externally-managed-environment` | The venv isn't active. Run `source .venv/bin/activate` inside `backend` first. |
| `cd: backend: No such file or directory` | Wrong folder. Run `pwd` and `ls`, and `cd ..` until you see `backend` and `frontend`. |
| `No module named 'app'` | Run uvicorn from inside `backend`. |
| Blank or broken page | `cd frontend && rm -rf .next && npm run dev`, then hard refresh (`Ctrl+Shift+R`). |
| Page changes don't show | Config changes (`tailwind.config.ts`, `.env.local`) need a dev server restart. |
| `ECONNREFUSED` / DB errors | `sudo systemctl start postgresql`, then restart uvicorn. |
| Demo login says invalid email or password | Restart the backend so it recreates the demo accounts. |

## Git

```bash
git status                # make sure .env, .venv, node_modules are NOT listed
git add -A
git commit -m "describe what you changed"
git push                  # username: your GitHub name, password: your personal access token
```
Never commit `backend/.env`. It holds your database password and secret key (already in `.gitignore`).

## Production notes

Set `APP_ENV=production` in `backend/.env` (disables demo accounts), use a strong `SECRET_KEY`, add your site URL to `CORS_ORIGINS`, and switch table creation to Alembic migrations.