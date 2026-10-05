# Classic Ledger

Classic Ledger is an accounting study and practice application with separate Financial and Managerial workspaces.

## Features
- **Double-Entry Bookkeeping:** Automatically balances journal entries.
- **T-Account Ledger:** Generates automatic T-accounts based on your journal lines.
- **Trial Balance:** Instantly check that total debits equal total credits.
- **Running Balance:** Track prepaid expenses and accruals as they expire over time.
- **Cloud Persistence:** Securely saves your workbooks across sessions using Supabase.
- **Parchment Aesthetic:** Designed with a beautiful, clean paper/ink aesthetic for high readability.
- **Managerial Cash Flows:** Independent workbooks with manually classified direct and indirect methods, professor-based practice examples, visual learning, and a two-page printable exam reference.

## Managerial database setup
Run `supabase/managerial_workbooks.sql` in the Supabase SQL Editor for the same project used by this app. It creates a separate table with owner-only row security; existing Financial workbooks are unchanged.

Until the table is installed, Managerial drafts stay on the current device. After running the SQL, choose **Retry cloud sync** and wait for **Cloud saved** before opening the workbook on another device. Local drafts are isolated by signed-in user; signing out does not remove them from browser storage.

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
