import { useLayoutEffect, useRef, useState } from 'react';
import { useLedgerContext } from '@/hooks/LedgerContext';
import { useManagerialContext } from '@/hooks/ManagerialContext';
import { useNavigation } from '@/hooks/NavigationContext';
import { ModeSwitch } from '@/components/ModeSwitch';
import { BookOpen, FileText, LayoutGrid, Scale, ChevronLeft, CalendarClock, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { ViewMode } from '@/types/accounting';

const LEARNING_VIEWS = ['learning', 'journal-learning', 'adjusting-learning', 'final-learning', 'exam-cheat-sheet', 'academy-hub'];
const FINANCIAL_TABS = [
  { view: 'journal', label: 'Journal', Icon: FileText },
  { view: 'ledger', label: 'T-Accounts', Icon: LayoutGrid },
  { view: 'trial-balance', label: 'Trial Balance', Icon: Scale },
  { view: 'running-balance', label: 'Running Balance', Icon: CalendarClock },
] as const;

export const Navigation = ({ user }: { user: User | null }) => {
  const { route, view, mode, navigate } = useNavigation();
  const ledger = useLedgerContext();
  const managerial = useManagerialContext();
  const [expandedRoute, setExpandedRoute] = useState<typeof route | null>(null);
  const expanded = expandedRoute === route;
  const header = useRef<HTMLElement>(null);
  const displayName = user?.email?.split('@')[0] ?? '';
  const isManagerial = mode === 'managerial';
  const isDashboard = view === 'dashboard' || view === 'managerial-dashboard';
  const financialWorkbook = !isManagerial && !isDashboard && !LEARNING_VIEWS.includes(view);

  useLayoutEffect(() => {
    if (!header.current) return;
    const update = () => document.documentElement.style.setProperty('--ledger-navigation-height', `${header.current?.getBoundingClientRect().height ?? 100}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header.current);
    return () => observer.disconnect();
  }, []);

  const go = (next: ViewMode, workbookId?: string | null) => {
    setExpandedRoute(null);
    navigate(next, { workbookId });
  };
  const handleNewEntry = () => {
    if (!ledger.currentWorkbookId) return;
    const entryId = ledger.createJournalEntry(ledger.currentWorkbookId);
    ledger.setCurrentEntryId(entryId);
    go('journal', ledger.currentWorkbookId);
  };
  const title = isManagerial
    ? managerial.currentWorkbook?.name ?? (view === 'cashflow-learning' ? 'Cash-flow Learning' : view === 'cashflow-cheat-sheet' ? 'Cash-flow Cheat Sheet' : 'Managerial Accounting')
    : ledger.currentWorkbook?.name ?? (view === 'academy-hub' ? 'Academy Simulators' : view === 'exam-cheat-sheet' ? 'Exam Cheat Sheet' : 'Learning Module');

  return (
    <nav ref={header} className={`ledger-navigation ${expanded ? 'is-expanded' : ''}`} aria-label="Main navigation">
      <a className="ledger-skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to content</a>
      <div className="ledger-navigation-top">
        <div className="ledger-brand">
          <ModeSwitch />
          <button className="ledger-brand-name" onClick={() => go(isManagerial ? 'managerial-dashboard' : 'dashboard')}>Classic Ledger</button>
        </div>
        {!isDashboard && <span className="ledger-navigation-title" title={title}>{title}</span>}
        <div className="ledger-account-actions">
          {isDashboard && displayName && <span className="ledger-display-name">{displayName}</span>}
          <button className="ledger-nav-link" onClick={() => { void supabase.auth.signOut(); }}><LogOut size={15} aria-hidden="true" /><span>Sign out</span></button>
          {(isManagerial || !isDashboard) && <button className="ledger-menu-toggle" aria-expanded={expanded} aria-controls="ledger-navigation-links" aria-label={expanded ? 'Close navigation' : 'Open navigation'} onClick={() => setExpandedRoute(expanded ? null : route)}>{expanded ? <X size={20} /> : <Menu size={20} />}</button>}
        </div>
      </div>
      {(isManagerial || !isDashboard) && <div id="ledger-navigation-links" className="ledger-navigation-links">
        {!isDashboard && <button className="ledger-nav-link" onClick={() => go(isManagerial ? 'managerial-dashboard' : 'dashboard')}><ChevronLeft size={16} aria-hidden="true" />Dashboard</button>}
        {isManagerial && <>
          <button className="ledger-nav-link" aria-current={view === 'cashflow-learning' ? 'page' : undefined} onClick={() => go('cashflow-learning')}>Learning</button>
          <button className="ledger-nav-link" aria-current={view === 'cashflow-cheat-sheet' ? 'page' : undefined} onClick={() => go('cashflow-cheat-sheet')}>Cheat Sheet</button>
          {route.workbookId && <>
            <button className="ledger-nav-link" aria-current={view === 'cashflow-direct' ? 'page' : undefined} onClick={() => go('cashflow-direct', route.workbookId)}>Direct Method</button>
            <button className="ledger-nav-link" aria-current={view === 'cashflow-indirect' ? 'page' : undefined} onClick={() => go('cashflow-indirect', route.workbookId)}>Indirect Method</button>
          </>}
        </>}
        {financialWorkbook && <>
          {FINANCIAL_TABS.map(({ view: tab, label, Icon }) => <button key={tab} className="ledger-nav-link" aria-current={view === tab ? 'page' : undefined} onClick={() => go(tab, route.workbookId)}><Icon size={15} aria-hidden="true" />{label}</button>)}
          <button className="ledger-new-entry" onClick={handleNewEntry}><BookOpen size={15} aria-hidden="true" />New Entry</button>
        </>}
      </div>}
    </nav>
  );
};
