import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LedgerProvider, useLedgerContext } from '@/hooks/LedgerContext';
import { Navigation } from '@/components/Navigation';
import { AuthScreen } from '@/components/AuthScreen';
import { Dashboard } from '@/sections/Dashboard';
import { JournalEntry } from '@/sections/JournalEntry';
import { TAccountLedger } from '@/sections/TAccountLedger';
import { TrialBalance } from '@/sections/TrialBalance';
import { RunningBalance } from '@/sections/RunningBalance';
import { BalanceSheetView } from '@/sections/BalanceSheetView';
import { IncomeStatementView } from '@/sections/IncomeStatementView';
import { CashFlowView } from '@/sections/CashFlowView';
import { Footer } from '@/sections/Footer';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@supabase/supabase-js';
import './App.css';

import { LearningView } from '@/sections/LearningView';

gsap.registerPlugin(ScrollTrigger);

// Loading spinner styled to match the app aesthetic
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-ivory paper-grain flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4 animate-spin"
          style={{ borderColor: 'var(--color-guide)', borderTopColor: 'var(--color-ink)' }}
        />
        <p className="text-sm uppercase tracking-widest" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
          Loading…
        </p>
      </div>
    </div>
  );
}

function AppContent({ user }: { user: User }) {
  const { currentView, dbLoading } = useLedgerContext();
  const mainRef = useRef<HTMLElement>(null);

  // Reset scroll when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  if (dbLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-ivory paper-grain">
      <Navigation user={user} />

      <main ref={mainRef} className="relative">
        {currentView === 'dashboard' && (
          <>
            <Dashboard />
            <Footer />
          </>
        )}
        {currentView === 'learning' && <LearningView />}
        {currentView === 'journal' && <JournalEntry />}
        {currentView === 'ledger' && <TAccountLedger />}
        {currentView === 'trial-balance' && <TrialBalance />}
        {currentView === 'running-balance' && <RunningBalance />}
        {currentView === 'balance-sheet' && <BalanceSheetView />}
        {currentView === 'income-statement' && <IncomeStatementView />}
        {currentView === 'cash-flow' && <CashFlowView />}
      </main>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  // Still checking session
  if (loading) return <LoadingScreen />;

  // Not logged in → show auth screen
  if (!user) return <AuthScreen />;

  // Logged in → show app with Supabase-backed data
  return (
    <LedgerProvider userId={user.id}>
      <AppContent user={user} />
    </LedgerProvider>
  );
}

export default App;
