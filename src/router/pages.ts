import type { ComponentType } from 'react';
import type { ViewMode } from '@/types/accounting';
import { Dashboard } from '@/sections/Dashboard';
import { LearningView } from '@/sections/LearningView';
import { JournalLearningView } from '@/sections/JournalLearningView';
import { AdjustingJournalLearningView } from '@/sections/AdjustingJournalLearningView';
import { FinalAdjustmentsLearningView } from '@/sections/FinalAdjustmentsLearningView';
import { ExamCheatSheetView } from '@/sections/ExamCheatSheetView';
import { AcademyHub } from '@/sections/AcademyHub';
import { JournalEntry } from '@/sections/JournalEntry';
import { TAccountLedger } from '@/sections/TAccountLedger';
import { TrialBalance } from '@/sections/TrialBalance';
import { RunningBalance } from '@/sections/RunningBalance';
import { ManagerialDashboard } from '@/sections/managerial/ManagerialDashboard';
import { CashFlowWorkbook } from '@/sections/managerial/CashFlowWorkbook';
import { CashFlowLearning } from '@/sections/managerial/CashFlowLearning';
import { CashFlowCheatSheet } from '@/sections/managerial/CashFlowCheatSheet';

export interface PageDefinition {
  component: ComponentType;
  showFooter?: boolean;
}

export const PAGES: Record<ViewMode, PageDefinition> = {
  'dashboard': { component: Dashboard, showFooter: true },
  'learning': { component: LearningView },
  'journal-learning': { component: JournalLearningView },
  'adjusting-learning': { component: AdjustingJournalLearningView },
  'final-learning': { component: FinalAdjustmentsLearningView },
  'exam-cheat-sheet': { component: ExamCheatSheetView },
  'academy-hub': { component: AcademyHub },
  'journal': { component: JournalEntry },
  'ledger': { component: TAccountLedger },
  'trial-balance': { component: TrialBalance },
  'running-balance': { component: RunningBalance },
  'managerial-dashboard': { component: ManagerialDashboard },
  'cashflow-learning': { component: CashFlowLearning },
  'cashflow-cheat-sheet': { component: CashFlowCheatSheet },
  'cashflow-direct': { component: CashFlowWorkbook },
  'cashflow-indirect': { component: CashFlowWorkbook },
};
