// Accounting Types for Classic Ledger

export interface JournalEntryLine {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number | null;
  credit: number | null;
  accountCode?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: number;
  date: string;
  lines: JournalEntryLine[];
  description?: string;
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TAccount {
  id: string;
  accountName: string;
  accountCode: string;
  accountType: AccountType;
  debitEntries: TAccountEntry[];
  creditEntries: TAccountEntry[];
  balance: number;
  balanceType: 'debit' | 'credit';
}

export interface TAccountEntry {
  id: string;
  journalEntryId: string;
  journalEntryNumber: number;
  date: string;
  amount: number;
  description: string;
}

export interface TrialBalanceRow {
  accountName: string;
  accountCode: string;
  accountType: AccountType;
  debitBalance: number;
  creditBalance: number;
}

export interface TrialBalance {
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  difference: number;
}

// Running Balance for Prepaid Expenses / Accruals
export interface RunningBalanceItem {
  id: string;
  name: string;
  description: string;
  originalAmount: number;
  startDate: string;
  endDate: string;
  totalPeriods: number;
  periodType: 'month' | 'quarter' | 'year';
  entries: RunningBalanceEntry[];
  remainingBalance: number;
  expiredAmount: number;
  isFullyExpired: boolean;
}

export interface RunningBalanceEntry {
  id: string;
  periodNumber: number;
  periodStartDate: string;
  periodEndDate: string;
  amount: number;
  isExpired: boolean;
  expiredDate?: string;
}

// Account Types for Financial Statements
export type AccountType =
  | 'asset'
  | 'liability'
  | 'equity'
  | 'revenue'
  | 'expense'
  | 'contra-asset'
  | 'contra-equity';

// Financial Statements
export interface BalanceSheet {
  assets: {
    currentAssets: BalanceSheetItem[];
    nonCurrentAssets: BalanceSheetItem[];
    totalCurrentAssets: number;
    totalNonCurrentAssets: number;
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: BalanceSheetItem[];
    nonCurrentLiabilities: BalanceSheetItem[];
    totalCurrentLiabilities: number;
    totalNonCurrentLiabilities: number;
    totalLiabilities: number;
  };
  equity: {
    items: BalanceSheetItem[];
    totalEquity: number;
  };
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
}

export interface BalanceSheetItem {
  accountName: string;
  accountCode: string;
  amount: number;
  isContra: boolean;
}

export interface IncomeStatement {
  revenues: IncomeStatementItem[];
  totalRevenue: number;
  expenses: IncomeStatementItem[];
  totalExpenses: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
}

export interface IncomeStatementItem {
  accountName: string;
  accountCode: string;
  amount: number;
  isOperating: boolean;
}

export interface CashFlowStatement {
  operatingActivities: CashFlowItem[];
  investingActivities: CashFlowItem[];
  financingActivities: CashFlowItem[];
  netOperatingCashFlow: number;
  netInvestingCashFlow: number;
  netFinancingCashFlow: number;
  netChangeInCash: number;
  beginningCash: number;
  endingCash: number;
}

export interface CashFlowItem {
  description: string;
  amount: number;
  isInflow: boolean;
}

export interface Workbook {
  id: string;
  name: string;
  description?: string;
  entries: JournalEntry[];
  accounts: TAccount[];
  runningBalances: RunningBalanceItem[];
  createdAt: Date;
  updatedAt: Date;
  isBalanced: boolean;
}

export type ViewMode =
  | 'dashboard'
  | 'learning'
  | 'journal-learning'
  | 'adjusting-learning'
  | 'final-learning'
  | 'journal'
  | 'ledger'
  | 'trial-balance'
  | 'running-balance'
  | 'balance-sheet'
  | 'income-statement'
  | 'cash-flow';

// Utility functions
export const formatCurrency = (amount: number | null): string => {
  if (amount === null || amount === 0) return '—';
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatShortDate = (date: string | Date): string => {
  // If it's already in DD/MM format, return as-is
  if (typeof date === 'string' && /^\d{1,2}\/\d{1,2}$/.test(date.trim())) {
    return date.trim();
  }
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return typeof date === 'string' ? date : '';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
  });
};

export const generateId = (): string => {
  // Use crypto.randomUUID() to generate proper UUIDs that match the database uuid column type
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments: generate a v4-like UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const calculateTotals = (lines: JournalEntryLine[]) => {
  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  return {
    totalDebit,
    totalCredit,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.001,
    difference: Math.abs(totalDebit - totalCredit),
  };
};

// Account type classification helper
export const classifyAccount = (accountName: string): AccountType => {
  const name = accountName.toLowerCase();

  // Assets
  if (name.includes('cash') || name.includes('bank') || name.includes('receivable') ||
    name.includes('inventory') || name.includes('prepaid') || name.includes('supplies') ||
    name.includes('equipment') || name.includes('building') || name.includes('land') ||
    name.includes('vehicle') || name.includes('furniture') || name.includes('computer')) {
    return 'asset';
  }

  // Contra-assets
  if (name.includes('depreciation') || name.includes('allowance') || name.includes('accumulated')) {
    return 'contra-asset';
  }

  // Liabilities
  if (name.includes('payable') || name.includes('loan') || name.includes('debt') ||
    name.includes('mortgage') || name.includes('unearned') || name.includes('accrued') ||
    name.includes('warranty')) {
    return 'liability';
  }

  // Equity
  if (name.includes('capital') || name.includes('equity') || name.includes('retained') ||
    name.includes('owner') || name.includes('share') || name.includes('stock')) {
    return 'equity';
  }

  // Contra-equity
  if (name.includes('drawing') || name.includes('withdrawal') || name.includes('dividend')) {
    return 'contra-equity';
  }

  // Revenue
  if (name.includes('revenue') || name.includes('sales') || name.includes('income') ||
    name.includes('fee') || name.includes('commission') || name.includes('rent income') ||
    name.includes('interest income')) {
    return 'revenue';
  }

  // Expense (default)
  return 'expense';
};

// Calculate months between two dates
export const calculatePeriods = (
  startDate: string,
  endDate: string,
  periodType: 'month' | 'quarter' | 'year'
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  switch (periodType) {
    case 'month':
      return Math.ceil(diffDays / 30);
    case 'quarter':
      return Math.ceil(diffDays / 90);
    case 'year':
      return Math.ceil(diffDays / 365);
    default:
      return 12;
  }
};

// Generate running balance entries
export const generateRunningBalanceEntries = (
  originalAmount: number,
  startDate: string,
  endDate: string,
  periodType: 'month' | 'quarter' | 'year'
): RunningBalanceEntry[] => {
  const periods = calculatePeriods(startDate, endDate, periodType);
  const amountPerPeriod = originalAmount / periods;
  const entries: RunningBalanceEntry[] = [];

  const start = new Date(startDate);

  for (let i = 0; i < periods; i++) {
    const periodStart = new Date(start);
    const periodEnd = new Date(start);

    switch (periodType) {
      case 'month':
        periodStart.setMonth(start.getMonth() + i);
        periodEnd.setMonth(start.getMonth() + i + 1);
        periodEnd.setDate(0); // Last day of month
        break;
      case 'quarter':
        periodStart.setMonth(start.getMonth() + (i * 3));
        periodEnd.setMonth(start.getMonth() + ((i + 1) * 3));
        periodEnd.setDate(0);
        break;
      case 'year':
        periodStart.setFullYear(start.getFullYear() + i);
        periodEnd.setFullYear(start.getFullYear() + i + 1);
        periodEnd.setDate(0);
        break;
    }

    entries.push({
      id: generateId(),
      periodNumber: i + 1,
      periodStartDate: periodStart.toISOString(),
      periodEndDate: periodEnd.toISOString(),
      amount: amountPerPeriod,
      isExpired: false,
    });
  }

  return entries;
};
