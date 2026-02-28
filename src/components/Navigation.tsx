import { useLedgerContext } from '@/hooks/LedgerContext';
import {
  BookOpen,
  FileText,
  LayoutGrid,
  Scale,
  ChevronLeft,
  CalendarClock,
  Landmark,
  TrendingUp,
  Wallet,
  LogOut
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export const Navigation = ({ user }: { user: User | null }) => {
  const handleLogout = () => supabase.auth.signOut();
  const displayName = user?.email?.split('@')[0] ?? '';

  const {
    currentView,
    currentWorkbook,
    goToDashboard,
    setCurrentView,
    currentWorkbookId,
    createJournalEntry,
    setCurrentEntryId,
  } = useLedgerContext();

  const handleNewEntry = () => {
    if (currentWorkbookId) {
      const entryId = createJournalEntry(currentWorkbookId);
      setCurrentEntryId(entryId);
      setCurrentView('journal');
    }
  };

  if (currentView === 'dashboard') {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 px-[8vw] py-6 flex items-center justify-between bg-ivory/80 backdrop-blur-sm">
        <div className="font-sans text-label uppercase tracking-wide text-ink">
          Classic Ledger
        </div>
        <div className="flex items-center gap-6">
          {displayName && (
            <span className="font-sans text-label text-text-secondary" style={{ fontFamily: 'var(--font-sans)' }}>
              {displayName}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 font-sans text-label uppercase tracking-wide text-text-secondary hover:text-ink transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </nav>
    );
  }

  if (currentView === 'learning') {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 px-[6vw] py-3 flex items-center justify-between bg-ivory/90 backdrop-blur-sm border-b border-guide">
        <div className="flex items-center gap-4">
          <button
            onClick={goToDashboard}
            className="flex items-center gap-2 font-sans text-label uppercase tracking-wide text-text-secondary hover:text-ink transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="w-px h-4 bg-guide" />
          <div className="font-serif text-heading text-ink truncate max-w-[200px]">
            Learning Module
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 font-sans text-label uppercase tracking-wide text-text-secondary hover:text-ink transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-[6vw] py-3 flex items-center justify-between bg-ivory/90 backdrop-blur-sm border-b border-guide">
      <div className="flex items-center gap-4">
        <button
          onClick={goToDashboard}
          className="flex items-center gap-2 font-sans text-label uppercase tracking-wide text-text-secondary hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="w-px h-4 bg-guide" />
        <div className="font-serif text-heading text-ink truncate max-w-[200px]">
          {currentWorkbook?.name || 'Workbook'}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setCurrentView('journal')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-paper font-sans text-[10px] uppercase tracking-wide transition-all ${currentView === 'journal'
            ? 'bg-ink text-ivory'
            : 'text-text-secondary hover:text-ink hover:bg-guide/50'
            }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Journal
        </button>
        <button
          onClick={() => setCurrentView('ledger')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-paper font-sans text-[10px] uppercase tracking-wide transition-all ${currentView === 'ledger'
            ? 'bg-ink text-ivory'
            : 'text-text-secondary hover:text-ink hover:bg-guide/50'
            }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          T-Accounts
        </button>
        <button
          onClick={() => setCurrentView('trial-balance')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-paper font-sans text-[10px] uppercase tracking-wide transition-all ${currentView === 'trial-balance'
            ? 'bg-ink text-ivory'
            : 'text-text-secondary hover:text-ink hover:bg-guide/50'
            }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Trial Balance
        </button>
        <button
          onClick={() => setCurrentView('running-balance')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-paper font-sans text-[10px] uppercase tracking-wide transition-all ${currentView === 'running-balance'
            ? 'bg-ink text-ivory'
            : 'text-text-secondary hover:text-ink hover:bg-guide/50'
            }`}
        >
          <CalendarClock className="w-3.5 h-3.5" />
          Running Balance
        </button>
        <div className="w-px h-4 bg-guide mx-1" />
        <button
          onClick={() => setCurrentView('balance-sheet')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-paper font-sans text-[10px] uppercase tracking-wide transition-all ${currentView === 'balance-sheet'
            ? 'bg-ink text-ivory'
            : 'text-text-secondary hover:text-ink hover:bg-guide/50'
            }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          Balance Sheet
        </button>
        <button
          onClick={() => setCurrentView('income-statement')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-paper font-sans text-[10px] uppercase tracking-wide transition-all ${currentView === 'income-statement'
            ? 'bg-ink text-ivory'
            : 'text-text-secondary hover:text-ink hover:bg-guide/50'
            }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Income
        </button>
        <button
          onClick={() => setCurrentView('cash-flow')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-paper font-sans text-[10px] uppercase tracking-wide transition-all ${currentView === 'cash-flow'
            ? 'bg-ink text-ivory'
            : 'text-text-secondary hover:text-ink hover:bg-guide/50'
            }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          Cash Flow
        </button>
        <div className="w-px h-4 bg-guide mx-1" />
        <button
          onClick={handleNewEntry}
          className="flex items-center gap-1.5 px-3 py-2 rounded-paper bg-accounting-red text-white font-sans text-[10px] uppercase tracking-wide hover:bg-accounting-red/90 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          New Entry
        </button>
        <div className="w-px h-4 bg-guide mx-1" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-paper text-text-secondary hover:text-ink font-sans text-[10px] uppercase tracking-wide transition-colors"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </nav>
  );
};
