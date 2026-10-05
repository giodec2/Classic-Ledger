import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LedgerProvider, useLedgerContext } from '@/hooks/LedgerContext';
import { NavigationProvider, useNavigation } from '@/hooks/NavigationContext';
import { ManagerialProvider, useManagerialContext } from '@/hooks/ManagerialContext';
import '@/sections/managerial/Managerial.css';
import { Navigation } from '@/components/Navigation';
import { AuthScreen } from '@/components/AuthScreen';
import { AppRouter } from '@/router/AppRouter';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@supabase/supabase-js';
import './App.css';

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
  const { route, navigate } = useNavigation();
  const { dbLoading, workbooks } = useLedgerContext();
  const managerial = useManagerialContext();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    mainRef.current?.focus({ preventScroll: true });
  }, [route.view, route.workbookId, route.academyModule]);

  useEffect(() => {
    if (route.mode !== 'financial' || dbLoading) return;
    if (route.workbookId && !workbooks.some(wb => wb.id === route.workbookId)) {
      navigate('dashboard', { replace: true });
    }
  }, [dbLoading, route.mode, route.workbookId, workbooks, navigate]);

  useEffect(() => {
    if (route.mode !== 'managerial' || managerial.loading || !managerial.loadSucceeded || !managerial.localRecoveryComplete || managerial.loadError) return;
    if (route.workbookId && !managerial.workbooks.some(wb => wb.id === route.workbookId)) {
      navigate('managerial-dashboard', { replace: true });
    }
  }, [route.mode, route.workbookId, managerial.loading, managerial.loadSucceeded, managerial.localRecoveryComplete, managerial.loadError, managerial.workbooks, navigate]);

  const notice = route.mode === 'managerial' && (managerial.loadError || managerial.storageWarning || managerial.pendingDeletions.length > 0);
  return (
    <div className="ledger-app min-h-screen bg-ivory paper-grain" data-course-mode={route.mode}>
      <Navigation user={user} />
      {notice && <aside className="managerial-cloud-notice" role="status">
        {managerial.loadError && <p>{managerial.loadError.message}</p>}
        {managerial.storageWarning && <p>{managerial.storageWarning}</p>}
        {managerial.pendingDeletions.length > 0 && <p>{managerial.pendingDeletions.length} deletion(s) pending cloud confirmation.</p>}
        <button disabled={managerial.loading} onClick={() => { void managerial.retry(); }}>{managerial.loading ? 'Loading…' : 'Retry cloud sync'}</button>
      </aside>}
      <main id="main-content" tabIndex={-1} ref={mainRef} className="relative">
        {route.mode === 'financial' && dbLoading ? <LoadingScreen /> : <AppRouter />}
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
    <NavigationProvider key={user.id}>
      <LedgerProvider userId={user.id}>
        <ManagerialProvider userId={user.id}>
          <AppContent user={user} />
        </ManagerialProvider>
      </LedgerProvider>
    </NavigationProvider>
  );
}

export default App;
