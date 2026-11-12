# RE:VINTAGE Analogue Collective

Multi-vendor analogue vinyl and vintage apparel marketplace.

```
backend/    FastAPI + SQLAlchemy 2.0 (async) + PostgreSQL
  app/core    config, security (JWT, bcrypt)
  app/db      engine + session
  app/models  User, Shop, Product
  app/api     deps + routes/{auth,shops,products,admin}.py
frontend/   Next.js 14 (App Router) + Tailwind + Framer Motion
scripts/    setup_db.sh
```

## Run
```bash
bash scripts/setup_db.sh                          # one-time: creates the DB and backend/.env
cd backend && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload                     # http://localhost:8000/docs  (check /health/db)

cd ../frontend && echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local
npm install && npm run dev                        # http://localhost:3000
```
Make an admin: `sudo -u postgres psql vinyl_db -c "UPDATE users SET role='admin' WHERE email='you@example.com';"`
