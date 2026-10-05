import { generateId } from '@/types/accounting';

export type CourseMode = 'financial' | 'managerial';
export type CashFlowMethod = 'direct' | 'indirect';
export type ManagerialExampleSource = 'allison' | 'auto-supply';
export type ManagerialExampleMode = 'practice' | 'reveal';

export interface CashFlowRow {
  id: string;
  title: string;
  amount: number | null;
  direction: 'inflow' | 'outflow';
}

export interface IndirectAdjustmentRow {
  id: string;
  title: string;
  amount: number | null;
  direction: 'add' | 'deduct';
}

export interface NoncashRow {
  id: string;
  title: string;
  amount: number | null;
}

export interface ManagerialWorkbook {
  id: string;
  name: string;
  description?: string;
  periodLabel: string;
  openingCash: number | null;
  closingCash: number | null;
  netIncome: number | null;
  directOperating: CashFlowRow[];
  indirectAdjustments: IndirectAdjustmentRow[];
  investing: CashFlowRow[];
  financing: CashFlowRow[];
  noncash: NoncashRow[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  sourceExample?: ManagerialExampleSource | null;
  exampleMode?: ManagerialExampleMode;
}

export type ManagerialWorkbookUpdates = Partial<Omit<ManagerialWorkbook, 'id' | 'createdAt' | 'updatedAt'>>;
export type ManagerialWorkbookInput = ManagerialWorkbookUpdates;
export type ManagerialSaveStatus = 'pending' | 'saving' | 'saved' | 'error' | 'pending-deletion';

export function createBlankManagerialWorkbook(name = 'Untitled cash-flow workbook', input: ManagerialWorkbookInput = {}): ManagerialWorkbook {
  const now = new Date().toISOString();
  return {
    periodLabel: '',
    openingCash: null,
    closingCash: null,
    netIncome: null,
    directOperating: [],
    indirectAdjustments: [],
    investing: [],
    financing: [],
    noncash: [],
    notes: '',
    sourceExample: null,
    exampleMode: 'practice',
    ...input,
    id: generateId(),
    name: name.trim() || 'Untitled cash-flow workbook',
    createdAt: now,
    updatedAt: now,
  };
}
