# Reconcile Docs Frontend

Next.js Pages Router frontend for the reconciliation backend.

## Setup

1. Install dependencies.
2. Copy `.env.example` to `.env.local` and set `BACKEND_API_BASE_URL` if your backend is not running at `http://localhost:5052`.
3. Start the backend first, then start this app.

## Run

```powershell
npm install
npm run dev
```

## Scripts

- `npm run dev` - start the frontend in development mode
- `npm run build` - create a production build
- `npm run start` - run the production build
- `npm run test` - run Vitest tests
- `npm run typecheck` - run the TypeScript checker

## Notes

- Files are selected first, then uploaded with the button.
- PDF passwords are sent during PDF upload.
- Reconciliation uses the files already parsed and stored by the backend.
- All frontend requests go through `/api/gateway`, which proxies to the .NET backend.