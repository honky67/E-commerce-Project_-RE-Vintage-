#!/usr/bin/env bash
# One-step launcher for a Linux VM: sets up PostgreSQL, Python venv, npm packages, then runs API + site.
# Usage: bash start.sh        (Ctrl+C stops everything)
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing '$1'. Install: $2" >&2; exit 1; }; }
need python3 "sudo apt install python3 python3-venv"
need node "https://nodejs.org (Node 20+)"
need npm "comes with Node"
need psql "sudo apt install postgresql"

sudo systemctl start postgresql 2>/dev/null || true
[ -f backend/.env ] || bash scripts/setup_db.sh
[ -d backend/.venv ] || python3 -m venv backend/.venv
backend/.venv/bin/pip install -q -r backend/requirements.txt
[ -d frontend/node_modules ] || (cd frontend && npm install)
[ -f frontend/.env.local ] || cp frontend/.env.example frontend/.env.local
mkdir -p logs

(cd backend && exec .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) >logs/backend.log 2>&1 &
BACK=$!
(cd frontend && exec node_modules/.bin/next dev -H 0.0.0.0 -p 3000) >logs/frontend.log 2>&1 &
FRONT=$!
trap 'kill $BACK $FRONT 2>/dev/null || true; wait 2>/dev/null || true' INT TERM EXIT

echo -n "Starting API"
for _ in $(seq 1 40); do
  curl -fs http://localhost:8000/health >/dev/null 2>&1 && break
  kill -0 $BACK 2>/dev/null || { echo; echo "API crashed. See logs/backend.log" >&2; tail -n 15 logs/backend.log >&2; exit 1; }
  echo -n "."; sleep 1
done
echo " ok"

IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
echo
echo "  Site:      http://localhost:3000     (from the VM host: http://${IP:-<vm-ip>}:3000)"
echo "  API docs:  http://localhost:8000/docs"
echo "  Logs:      logs/backend.log, logs/frontend.log"
echo "  Stop:      Ctrl+C"
wait
