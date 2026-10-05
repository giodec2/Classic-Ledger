import type { ViewMode } from '@/types/accounting';
import type { CourseMode } from '@/types/managerial';

export type AcademyModuleId = 'inventory' | 'bank' | 'bad-debt';

export interface AppRoute {
  mode: CourseMode;
  view: ViewMode;
  workbookId: string | null;
  academyModule: AcademyModuleId | null;
}

export const WORKBOOK_TABS = ['journal', 'ledger', 'trial-balance', 'running-balance'] as const;
export type WorkbookTab = (typeof WORKBOOK_TABS)[number];
export const MANAGERIAL_VIEWS: readonly ViewMode[] = ['managerial-dashboard', 'cashflow-learning', 'cashflow-cheat-sheet', 'cashflow-direct', 'cashflow-indirect'];
export const modeForView = (view: ViewMode): CourseMode => MANAGERIAL_VIEWS.includes(view) ? 'managerial' : 'financial';

const ACADEMY_MODULE_IDS: readonly string[] = ['inventory', 'bank', 'bad-debt'];
const STATIC_VIEWS: readonly ViewMode[] = ['learning', 'journal-learning', 'adjusting-learning', 'final-learning', 'exam-cheat-sheet'];
const dashboardRoute = (mode: CourseMode = 'financial'): AppRoute => ({ mode, view: mode === 'managerial' ? 'managerial-dashboard' : 'dashboard', workbookId: null, academyModule: null });

export function parseHash(hash: string): AppRoute {
  const path = hash.replace(/^#\/?/, '').replace(/\/+$/, '');
  const parts = path ? path.split('/') : [];

  if (parts[0] === 'managerial') {
    if (parts[1] === 'learning') return { ...dashboardRoute('managerial'), view: 'cashflow-learning' };
    if (parts[1] === 'cheat-sheet') return { ...dashboardRoute('managerial'), view: 'cashflow-cheat-sheet' };
    if (parts[1] === 'workbooks' && parts[2]) {
      try {
        const workbookId = decodeURIComponent(parts[2]);
        if (!workbookId.trim()) return dashboardRoute('managerial');
        return { mode: 'managerial', view: parts[3] === 'indirect' ? 'cashflow-indirect' : 'cashflow-direct', workbookId, academyModule: null };
      } catch {
        return dashboardRoute('managerial');
      }
    }
    return dashboardRoute('managerial');
  }

  if (parts[0] === 'workbooks' && parts[1]) {
    let workbookId: string;
    try {
      workbookId = decodeURIComponent(parts[1]);
    } catch {
      return dashboardRoute();
    }
    if (!workbookId.trim()) return dashboardRoute();
    const tab = parts[2];
    return { mode: 'financial', view: (WORKBOOK_TABS as readonly string[]).includes(tab ?? '') ? tab as WorkbookTab : 'journal', workbookId, academyModule: null };
  }
  if (parts[0] === 'academy') {
    const module = parts[1];
    return { mode: 'financial', view: 'academy-hub', workbookId: null, academyModule: module && ACADEMY_MODULE_IDS.includes(module) ? module as AcademyModuleId : null };
  }
  if (STATIC_VIEWS.includes(parts[0] as ViewMode)) {
    return { mode: 'financial', view: parts[0] as ViewMode, workbookId: null, academyModule: null };
  }
  return dashboardRoute();
}

export function buildHash(route: AppRoute): string {
  if (modeForView(route.view) === 'managerial') {
    if (route.view === 'cashflow-learning') return '#/managerial/learning';
    if (route.view === 'cashflow-cheat-sheet') return '#/managerial/cheat-sheet';
    if (route.workbookId && (route.view === 'cashflow-direct' || route.view === 'cashflow-indirect')) {
      return `#/managerial/workbooks/${encodeURIComponent(route.workbookId)}/${route.view === 'cashflow-indirect' ? 'indirect' : 'direct'}`;
    }
    return '#/managerial';
  }
  if (route.view === 'dashboard') return '#/';
  if (route.workbookId) {
    const tab = (WORKBOOK_TABS as readonly string[]).includes(route.view) ? route.view : 'journal';
    return `#/workbooks/${encodeURIComponent(route.workbookId)}/${tab}`;
  }
  if (route.view === 'academy-hub') return route.academyModule ? `#/academy/${route.academyModule}` : '#/academy';
  if (STATIC_VIEWS.includes(route.view)) return `#/${route.view}`;
  return '#/';
}
