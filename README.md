# Classic Ledger

Classic Ledger is a simple, intuitive double-entry bookkeeping application designed for accounting exercises and personal finance tracking.

## Features
- **Double-Entry Bookkeeping:** Automatically balances journal entries.
- **T-Account Ledger:** Generates automatic T-accounts based on your journal lines.
- **Trial Balance:** Instantly check that total debits equal total credits.
- **Financial Statements:** Auto-generates Balance Sheet, Income Statement, and Cash Flow.
- **Cloud Persistence:** Securely saves your workbooks across sessions using Supabase.
- **Parchment Aesthetic:** Designed with a beautiful, clean paper/ink aesthetic for high readability.

## Tech Stack
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS (with Shadcn UI)
- Backend: Supabase (Auth + PostgreSQL)

## Setup
To run the project locally, set up a Supabase project and provide the URL and Anon Key in `.env.local`:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
Then run:
```bash
npm install
npm run dev
```
