# Render.com deployment — Crescent Loom backend

Quick reference for deploying `/app/backend` to Render as a Web Service.

## Build & start commands

- **Build command**
  ```
  pip install --upgrade pip && pip install -r requirements.txt
  ```
- **Start command** (Render injects `$PORT`)
  ```
  uvicorn server:app --host 0.0.0.0 --port $PORT
  ```
- **Root directory**: `backend`
- **Python version**: 3.11 (set via `PYTHON_VERSION` env var or `runtime.txt`)

## Required environment variables

| Key | Example | Notes |
|---|---|---|
| `MONGO_URL` | `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority` | Use MongoDB Atlas free tier — Render's filesystem is ephemeral |
| `DB_NAME` | `crescent_loom` | |
| `JWT_SECRET` | _64-char random hex_ | Generate with `openssl rand -hex 32` |
| `ADMIN_EMAIL` | `crescent.looom@gmail.com` | |
| `ADMIN_PASSWORD` | `Crescentloom@2026` | |
| `ADMIN_EMAILS` | `crescent.looom@gmail.com` | Comma list for Google-OAuth admins |
| `TELEGRAM_BOT_TOKEN` | _your token_ | |
| `TELEGRAM_CHAT_ID` | `-5102349304` | |
| `SMTP_HOST` | `smtp.gmail.com` | |
| `SMTP_PORT` | `587` | |
| `SMTP_USER` | `crescent.looom@gmail.com` | |
| `SMTP_PASSWORD` | _Gmail app password (no spaces)_ | |
| `SMTP_FROM_NAME` | `Crescent Loom` | |
| `CORS_ORIGINS` | `https://your-vercel-app.vercel.app` | Set this to your frontend URL — `*` is rejected by browsers when credentials are sent |
| `RAZORPAY_KEY_ID` | _optional_ | Leave unset to run in demo mode |
| `RAZORPAY_KEY_SECRET` | _optional_ | |
| `STORAGE_DIR` | `/var/data/uploads` | Set if you attach a Render persistent disk; otherwise admin file uploads won't survive restarts |

## Optional: persistent disk for admin product image uploads

Render Free tier filesystem is ephemeral. Two options:
1. **Skip uploads** — the catalogue uses static images from `/app/frontend/src/data/products.js`, admin upload isn't required for the storefront to work.
2. **Attach a 1 GB disk** at `/var/data` and set `STORAGE_DIR=/var/data/uploads`.
3. **Future**: swap `storage_put` / `storage_get` for an S3 client.

## Frontend (Vercel)

- **Root directory**: `frontend`
- **Build command**: `yarn install && yarn build`
- **Output directory**: `build`
- **Env var**: `REACT_APP_BACKEND_URL` = your Render backend URL (e.g. `https://crescent-loom-api.onrender.com`)

After Vercel deploys, copy that frontend URL into the backend's `CORS_ORIGINS` env on Render and trigger a redeploy.
