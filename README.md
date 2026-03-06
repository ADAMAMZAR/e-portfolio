# E-Portfolio (React + FastAPI)

This project is generated from the PRD in `c:\downloads\eportfolio_prd.docx`.

## Stack

- Frontend: React + TypeScript + Vite + Framer Motion + Zod
- Backend: FastAPI + Pydantic

## Run locally

### 1) Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api/*` to FastAPI on port `8000`.

## API

- `GET /api/health`
- `GET /api/projects`

## Notes

- Project data is stored in `backend/app/data/projects.json`.
- Frontend validates API response with Zod before rendering.
- Cards support click/keyboard flip (`Enter`/`Space`), filtering, magnetic tilt, and confidential lock state.
