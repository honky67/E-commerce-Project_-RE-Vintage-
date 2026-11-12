# RE:VINTAGE API

The API is a FastAPI application backed by asynchronous SQLAlchemy models.
Run commands from this directory so the `app` package resolves:

```sh
cp .env.example .env
# Set DATABASE_URL to a PostgreSQL URL using the postgresql+asyncpg driver.
# Replace SECRET_KEY with a generated random value.
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API reads `backend/.env` regardless of the shell's working directory.
Tables are created at startup for local development. This does not migrate
existing tables, so apply schema migrations before deploying model changes to
an existing production database. Interactive API docs are available at `/docs`.

## Routes

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness check |
| POST | `/auth/register` | Register and return an access token |
| POST | `/auth/login` | Authenticate and return an access token |
| GET | `/auth/me` | Return the authenticated account |
| GET, POST | `/shops` | List shops / create an authenticated user's shop |
| GET | `/shops/mine` | List the authenticated user's shops |
| GET | `/shops/{slug}` | Read a shop |
| GET, POST | `/shops/{shop_id}/products` | List / create shop products |
| DELETE | `/products/{product_id}` | Delete an owned product |
| GET | `/admin/users`, `/admin/shops` | Admin-only listings |
| PATCH, DELETE | `/admin/shops/{shop_id}/badge`, `/admin/shops/{shop_id}` | Admin shop management |

Protected routes use `Authorization: Bearer <access_token>`.
