#!/usr/bin/env bash
# Creates the PostgreSQL role + database and writes backend/.env (never overwrites an existing .env).
# Usage: bash scripts/setup_db.sh        (needs: sudo apt install postgresql)
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/backend/.env"
DB_NAME="${DB_NAME:-vinyl_db}"
DB_USER="${DB_USER:-vinyl}"
DB_PASS="$(python3 -c 'import secrets; print(secrets.token_urlsafe(18))')"

command -v psql >/dev/null || { echo "PostgreSQL not found. Run: sudo apt install postgresql" >&2; exit 1; }
if [ -f "$ENV_FILE" ]; then echo "backend/.env already exists. Leaving it alone."; exit 0; fi

sudo -u postgres psql -v ON_ERROR_STOP=1 -q <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASS';
  ELSE
    ALTER ROLE $DB_USER PASSWORD '$DB_PASS';
  END IF;
END \$\$;
SQL
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 \
  || sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"

cat > "$ENV_FILE" <<ENV
DATABASE_URL=postgresql+asyncpg://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
APP_ENV=development
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))')
ENV
echo "Done. Wrote $ENV_FILE"
