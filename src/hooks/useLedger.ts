import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  JournalEntry,
  JournalEntryLine,
  Workbook,
  TAccount,
  TrialBalance,
  TrialBalanceRow,
  ViewMode,
  RunningBalanceItem,
  BalanceSheet,
  BalanceSheetItem,
  IncomeStatement,
  IncomeStatementItem,
  CashFlowStatement,
  CashFlowItem,
} from '@/types/accounting';
import {
  generateId,
  calculateTotals,
  classifyAccount,
  generateRunningBalanceEntries
} from '@/types/accounting';

// Sample initial data
// Sample initial data (kept for reference)
const _createSampleWorkbook = (): Workbook => {
  const now = new Date();
  const sampleEntry: JournalEntry = {
    id: generateId(),
    entryNumber: 1,
    date: now.toISOString(),
    lines: [
      {
        id: generateId(),
        date: now.toISOString(),
        description: 'Cash',
        reference: '',
        debit: 1000,
        credit: null,
        accountCode: '100',
      },
      {
        id: generateId(),
        date: '',
        description: 'Capital',
        reference: '',
        debit: null,
        credit: 1000,
        accountCode: '300',
      },
    ],
    isBalanced: true,
    totalDebit: 1000,
    totalCredit: 1000,
    createdAt: now,
    updatedAt: now,
  };

  return {
    id: generateId(),
    name: 'Accounting 101 - Homework 1',
    description: 'Introduction to double-entry bookkeeping',
    entries: [sampleEntry],
    accounts: [],
    runningBalances: [],
    createdAt: now,
    updatedAt: now,
    isBalanced: true,
  };
};

export const useLedger = (userId?: string) => {
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [currentWorkbookId, setCurrentWorkbookId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  // Track which workbook IDs have unsaved changes
  const dirtyIds = useRef<Set<string>>(new Set());

  // Helper: update workbooks state AND mark the changed workbook as dirty
  const markDirty = useCallback((workbookId: string, updater: (prev: Workbook[]) => Workbook[]) => {
    dirtyIds.current.add(workbookId);
    setWorkbooks(updater);
  }, []);

  // ---------- Load workbooks from Supabase ----------
  useEffect(() => {
    if (!userId) { setDbLoading(false); return; }
    setDbLoading(true);
    supabase
      .from('workbooks')
      .select('id, name, data, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error('Load error:', error); setDbLoading(false); return; }
        const loaded: Workbook[] = (data ?? []).map((row) => {
          const d = row.data as Omit<Workbook, 'id' | 'name' | 'createdAt' | 'updatedAt'>;
          return {
            ...d,
            id: row.id as string,
            name: row.name as string,
            createdAt: new Date(row.created_at as string),
            updatedAt: new Date(row.updated_at as string),
          };
        });
        setWorkbooks(loaded);
        setDbLoading(false);
      });
  }, [userId]);

  // ---------- Debounce-save dirty workbooks ----------
  useEffect(() => {
    if (!userId || dirtyIds.current.size === 0) return;
    const timer = setTimeout(async () => {
      const idsToSave = [...dirtyIds.current];
      dirtyIds.current.clear();
      for (const id of idsToSave) {
        const wb = workbooks.find(w => w.id === id);
        if (!wb) continue;
        const { id: _id, name, createdAt, updatedAt, ...rest } = wb;
        await supabase.from('workbooks').upsert({
          id,
          user_id: userId,
          name,
          data: rest,
          created_at: createdAt.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [workbooks, userId]);

  const currentWorkbook = useMemo(() => {
    return workbooks.find(wb => wb.id === currentWorkbookId) || null;
  }, [workbooks, currentWorkbookId]);

  const currentEntry = useMemo(() => {
    if (!currentWorkbook) return null;
    return currentWorkbook.entries.find(e => e.id === currentEntryId) || null;
  }, [currentWorkbook, currentEntryId]);

  // Workbook operations
  const createWorkbook = useCallback(async (name: string, description?: string): Promise<string> => {
    const id = generateId();
    const now = new Date();
    const newWorkbook: Workbook = {
      id,
      name,
      description,
      entries: [],
      accounts: [],
      runningBalances: [],
      createdAt: now,
      updatedAt: now,
      isBalanced: true,
    };
    setWorkbooks(prev => [newWorkbook, ...prev]);
    if (userId) {
      const { error } = await supabase.from('workbooks').insert({
        id,
        user_id: userId,
        name,
        data: { description, entries: [], accounts: [], runningBalances: [], isBalanced: true },
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      });
      if (error) console.error('Create workbook error:', error);
    }
    return id;
  }, [userId]);

  const deleteWorkbook = useCallback(async (id: string) => {
    setWorkbooks(prev => prev.filter(wb => wb.id !== id));
    if (currentWorkbookId === id) {
      setCurrentWorkbookId(null);
      setCurrentView('dashboard');
    }
    if (userId) {
      const { error } = await supabase.from('workbooks').delete().eq('id', id);
      if (error) console.error('Delete workbook error:', error);
    }
  }, [currentWorkbookId, userId]);

  const selectWorkbook = useCallback((id: string) => {
    setCurrentWorkbookId(id);
    setCurrentView('journal');
  }, []);

  // Journal entry operations
  const createJournalEntry = useCallback((workbookId: string): string => {
    const newEntry: JournalEntry = {
      id: generateId(),
      entryNumber: 0,
      date: new Date().toISOString(),
      lines: [
        {
          id: generateId(),
          date: new Date().toISOString(),
          description: '',
          reference: '',
          debit: null,
          credit: null,
        },
      ],
      isBalanced: false,
      totalDebit: 0,
      totalCredit: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    markDirty(workbookId, prev => prev.map(wb => {
      if (wb.id !== workbookId) return wb;
      const entryNumber = wb.entries.length + 1;
      const entryWithNumber = { ...newEntry, entryNumber };
      return {
        ...wb,
        entries: [...wb.entries, entryWithNumber],
        updatedAt: new Date(),
      };
    }));

    return newEntry.id;
  }, [markDirty]);

  const updateJournalEntry = useCallback((workbookId: string, entryId: string, updates: Partial<JournalEntry>) => {
    markDirty(workbookId, prev => prev.map(wb => {
      if (wb.id !== workbookId) return wb;
      return {
        ...wb,
        entries: wb.entries.map(e => {
          if (e.id !== entryId) return e;
          const updated = { ...e, ...updates, updatedAt: new Date() };
          const totals = calculateTotals(updated.lines);
          return {
            ...updated,
            totalDebit: totals.totalDebit,
            totalCredit: totals.totalCredit,
            isBalanced: totals.isBalanced,
          };
        }),
        updatedAt: new Date(),
      };
    }));
  }, [markDirty]);

  const addJournalLine = useCallback((workbookId: string, entryId: string) => {
    markDirty(workbookId, prev => prev.map(wb => {
      if (wb.id !== workbookId) return wb;
      return {
        ...wb,
        entries: wb.entries.map(e => {
          if (e.id !== entryId) return e;
          const newLine: JournalEntryLine = {
            id: generateId(),
            date: '',
            description: '',
            reference: '',
            debit: null,
            credit: null,
          };
          const updatedLines = [...e.lines, newLine];
          const totals = calculateTotals(updatedLines);
          return {
            ...e,
            lines: updatedLines,
            totalDebit: totals.totalDebit,
            totalCredit: totals.totalCredit,
            isBalanced: totals.isBalanced,
            updatedAt: new Date(),
          };
        }),
        updatedAt: new Date(),
      };
    }));
  }, [markDirty]);

  const updateJournalLine = useCallback((
    workbookId: string,
    entryId: string,
    lineId: string,
    updates: Partial<JournalEntryLine>
  ) => {
    markDirty(workbookId, prev => prev.map(wb => {
      if (wb.id !== workbookId) return wb;
      return {
        ...wb,
        entries: wb.entries.map(e => {
          if (e.id !== entryId) return e;
          const updatedLines = e.lines.map(line => {
            if (line.id !== lineId) return line;
            return { ...line, ...updates };
          });
          const totals = calculateTotals(updatedLines);
          return {
            ...e,
            lines: updatedLines,
            totalDebit: totals.totalDebit,
            totalCredit: totals.totalCredit,
            isBalanced: totals.isBalanced,
            updatedAt: new Date(),
          };
        }),
        updatedAt: new Date(),
      };
    }));
  }, [markDirty]);

  const deleteJournalLine = useCallback((workbookId: string, entryId: string, lineId: string) => {
    markDirty(workbookId, prev => prev.map(wb => {
      if (wb.id !== workbookId) return wb;
      return {
        ...wb,
        entries: wb.entries.map(e => {
          if (e.id !== entryId) return e;
          const updatedLines = e.lines.filter(line => line.id !== lineId);
          if (updatedLines.length === 0) {
            updatedLines.push({
              id: generateId(),
              date: '',
              description: '',
              reference: '',
              debit: null,
              credit: null,
            });
          }
          const totals = calculateTotals(updatedLines);
          return {
            ...e,
            lines: updatedLines,
            totalDebit: totals.totalDebit,
            totalCredit: totals.totalCredit,
            isBalanced: totals.isBalanced,
            updatedAt: new Date(),
          };
        }),
        updatedAt: new Date(),
      };
    }));
  }, [markDirty]);

  // Generate T-Accounts from journal entries
  const generateTAccounts = useCallback((workbookId: string): TAccount[] => {
    const workbook = workbooks.find(wb => wb.id === workbookId);
    if (!workbook) return [];

    const accountMap = new Map<string, TAccount>();

    workbook.entries.forEach(entry => {
      entry.lines.forEach(line => {
        if (!line.description || (!line.debit && !line.credit)) return;

        const accountName = line.description;
        const accountCode = line.accountCode || accountName.toLowerCase().replace(/\s+/g, '_');
        const accountType = classifyAccount(accountName);

        if (!accountMap.has(accountCode)) {
          accountMap.set(accountCode, {
            id: generateId(),
            accountName,
            accountCode,
            accountType,
            debitEntries: [],
            creditEntries: [],
            balance: 0,
            balanceType: 'debit',
          });
        }

        const account = accountMap.get(accountCode)!;

        if (line.debit) {
          account.debitEntries.push({
            id: generateId(),
            journalEntryId: entry.id,
            journalEntryNumber: entry.entryNumber,
            date: entry.date,
            amount: line.debit,
            description: entry.description || `Entry #${entry.entryNumber}`,
          });
          account.balance += line.debit;
        }

        if (line.credit) {
          account.creditEntries.push({
            id: generateId(),
            journalEntryId: entry.id,
            journalEntryNumber: entry.entryNumber,
            date: entry.date,
            amount: line.credit,
            description: entry.description || `Entry #${entry.entryNumber}`,
          });
          account.balance -= line.credit;
        }

        account.balanceType = account.balance >= 0 ? 'debit' : 'credit';
      });
    });

    return Array.from(accountMap.values());
  }, [workbooks]);

  // Generate Trial Balance
  const generateTrialBalance = useCallback((workbookId: string): TrialBalance => {
    const accounts = generateTAccounts(workbookId);
    const rows: TrialBalanceRow[] = accounts.map(account => ({
      accountName: account.accountName,
      accountCode: account.accountCode,
      accountType: account.accountType,
      debitBalance: account.balance > 0 ? account.balance : 0,
      creditBalance: account.balance < 0 ? Math.abs(account.balance) : 0,
    }));

    const totalDebit = rows.reduce((sum, row) => sum + row.debitBalance, 0);
    const totalCredit = rows.reduce((sum, row) => sum + row.creditBalance, 0);
    const difference = Math.abs(totalDebit - totalCredit);

    return {
      rows,
      totalDebit,
      totalCredit,
      isBalanced: difference < 0.001,
      difference,
    };
  }, [generateTAccounts]);

  // Running Balance Operations
  const createRunningBalance = useCallback((
    workbookId: string,
    name: string,
    description: string,
    originalAmount: number,
    startDate: string,
    endDate: string,
    periodType: 'month' | 'quarter' | 'year'
  ): string => {
    const id = generateId();
    const entries = generateRunningBalanceEntries(originalAmount, startDate, endDate, periodType);

    const newRunningBalance: RunningBalanceItem = {
      id,
      name,
      description,
      originalAmount,
      startDate,
      endDate,
      totalPeriods: entries.length,
      periodType,
      entries,
      remainingBalance: originalAmount,
      expiredAmount: 0,
      isFullyExpired: false,
    };

    markDirty(workbookId, prev => prev.map(wb => {
      if (wb.id !== workbookId) return wb;
      return {
        ...wb,
        runningBalances: [...wb.runningBalances, newRunningBalance],
        updatedAt: new Date(),
      };
    }));

    return id;
  }, [markDirty]);

  const expireRunningBalancePeriod = useCallback((
    workbookId: string,
    runningBalanceId: string,
    entryId: string
  ) => {
    markDirty(workbookId, prev => prev.map(wb => {
      if (wb.id !== workbookId) return wb;
      return {
        ...wb,
        runningBalances: wb.runningBalances.map(rb => {
          if (rb.id !== runningBalanceId) return rb;

          const updatedEntries = rb.entries.map(entry => {
            if (entry.id !== entryId) return entry;
            return {
              ...entry,
              isExpired: true,
              expiredDate: new Date().toISOString(),
            };
          });

          const expiredAmount = updatedEntries
            .filter(e => e.isExpired)
            .reduce((sum, e) => sum + e.amount, 0);

          return {
            ...rb,
            entries: updatedEntries,
            expiredAmount,
            remainingBalance: rb.originalAmount - expiredAmount,
            isFullyExpired: expiredAmount >= rb.originalAmount,
          };
        }),
        updatedAt: new Date(),
      };
    }));
  }, [markDirty]);

  const deleteRunningBalance = useCallback((workbookId: string, runningBalanceId: string) => {
    markDirty(workbookId, prev => prev.map(wb => {
      if (wb.id !== workbookId) return wb;
      return {
        ...wb,
        runningBalances: wb.runningBalances.filter(rb => rb.id !== runningBalanceId),
        updatedAt: new Date(),
      };
    }));
  }, [markDirty]);

  // Generate Balance Sheet
  const generateBalanceSheet = useCallback((workbookId: string): BalanceSheet => {
    const accounts = generateTAccounts(workbookId);

    const currentAssets: BalanceSheetItem[] = [];
    const nonCurrentAssets: BalanceSheetItem[] = [];
    const currentLiabilities: BalanceSheetItem[] = [];
    const nonCurrentLiabilities: BalanceSheetItem[] = [];
    const equityItems: BalanceSheetItem[] = [];

    accounts.forEach(account => {
      const amount = Math.abs(account.balance);
      const isContra = account.accountType === 'contra-asset' || account.accountType === 'contra-equity';
      const item: BalanceSheetItem = {
        accountName: account.accountName,
        accountCode: account.accountCode,
        amount,
        isContra,
      };

      switch (account.accountType) {
        case 'asset':
          // Simple heuristic: cash, receivables, inventory = current; others = non-current
          if (['cash', 'bank', 'receivable', 'inventory', 'prepaid'].some(k =>
            account.accountName.toLowerCase().includes(k))) {
            currentAssets.push(item);
          } else {
            nonCurrentAssets.push(item);
          }
          break;
        case 'contra-asset':
          nonCurrentAssets.push(item);
          break;
        case 'liability':
          if (['payable', 'accrued', 'unearned', 'short-term'].some(k =>
            account.accountName.toLowerCase().includes(k))) {
            currentLiabilities.push(item);
          } else {
            nonCurrentLiabilities.push(item);
          }
          break;
        case 'equity':
        case 'contra-equity':
          equityItems.push(item);
          break;
      }
    });

    const totalCurrentAssets = currentAssets.reduce((sum, item) => sum + item.amount, 0);
    const totalNonCurrentAssets = nonCurrentAssets.reduce((sum, item) =>
      sum + (item.isContra ? -item.amount : item.amount), 0);
    const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

    const totalCurrentLiabilities = currentLiabilities.reduce((sum, item) => sum + item.amount, 0);
    const totalNonCurrentLiabilities = nonCurrentLiabilities.reduce((sum, item) => sum + item.amount, 0);
    const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

    const totalEquity = equityItems.reduce((sum, item) =>
      sum + (item.isContra ? -item.amount : item.amount), 0);

    return {
      assets: {
        currentAssets,
        nonCurrentAssets,
        totalCurrentAssets,
        totalNonCurrentAssets,
        totalAssets,
      },
      liabilities: {
        currentLiabilities,
        nonCurrentLiabilities,
        totalCurrentLiabilities,
        totalNonCurrentLiabilities,
        totalLiabilities,
      },
      equity: {
        items: equityItems,
        totalEquity,
      },
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.001,
    };
  }, [generateTAccounts]);

  // Generate Income Statement
  const generateIncomeStatement = useCallback((workbookId: string): IncomeStatement => {
    const accounts = generateTAccounts(workbookId);

    const revenues: IncomeStatementItem[] = [];
    const expenses: IncomeStatementItem[] = [];

    accounts.forEach(account => {
      const amount = Math.abs(account.balance);
      const item: IncomeStatementItem = {
        accountName: account.accountName,
        accountCode: account.accountCode,
        amount,
        isOperating: !['interest', 'tax', 'extraordinary'].some(k =>
          account.accountName.toLowerCase().includes(k)),
      };

      if (account.accountType === 'revenue') {
        revenues.push(item);
      } else if (account.accountType === 'expense') {
        expenses.push(item);
      }
    });

    const totalRevenue = revenues.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const grossProfit = totalRevenue; // Simplified - no COGS tracking
    const operatingIncome = grossProfit - expenses.filter(e => e.isOperating).reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    return {
      revenues,
      totalRevenue,
      expenses,
      totalExpenses,
      grossProfit,
      operatingIncome,
      netIncome,
    };
  }, [generateTAccounts]);

  // Generate Cash Flow Statement (simplified indirect method)
  const generateCashFlowStatement = useCallback((workbookId: string): CashFlowStatement => {
    const accounts = generateTAccounts(workbookId);
    const incomeStatement = generateIncomeStatement(workbookId);

    const operatingActivities: CashFlowItem[] = [];
    const investingActivities: CashFlowItem[] = [];
    const financingActivities: CashFlowItem[] = [];

    // Start with net income
    operatingActivities.push({
      description: 'Net Income',
      amount: incomeStatement.netIncome,
      isInflow: incomeStatement.netIncome > 0,
    });

    accounts.forEach(account => {
      const amount = Math.abs(account.balance);
      const description = account.accountName;

      // Categorize based on account type and name
      if (account.accountType === 'asset' && !account.accountName.toLowerCase().includes('cash')) {
        // Changes in working capital
        const isInflow = account.balance < 0; // Decrease in asset = inflow
        operatingActivities.push({ description, amount, isInflow });
      } else if (account.accountType === 'liability') {
        const isInflow = account.balance > 0; // Increase in liability = inflow
        operatingActivities.push({ description, amount, isInflow });
      } else if (['equipment', 'building', 'land', 'vehicle'].some(k =>
        account.accountName.toLowerCase().includes(k))) {
        const isInflow = account.balance < 0;
        investingActivities.push({ description, amount, isInflow });
      } else if (['capital', 'loan', 'debt', 'dividend', 'drawing'].some(k =>
        account.accountName.toLowerCase().includes(k))) {
        const isInflow = account.balance > 0;
        financingActivities.push({ description, amount, isInflow });
      }
    });

    const netOperatingCashFlow = operatingActivities.reduce((sum, item) =>
      sum + (item.isInflow ? item.amount : -item.amount), 0);
    const netInvestingCashFlow = investingActivities.reduce((sum, item) =>
      sum + (item.isInflow ? item.amount : -item.amount), 0);
    const netFinancingCashFlow = financingActivities.reduce((sum, item) =>
      sum + (item.isInflow ? item.amount : -item.amount), 0);

    const netChangeInCash = netOperatingCashFlow + netInvestingCashFlow + netFinancingCashFlow;

    // Find cash balance
    const cashAccount = accounts.find(a =>
      a.accountName.toLowerCase().includes('cash') ||
      a.accountName.toLowerCase().includes('bank'));
    const endingCash = cashAccount ? Math.abs(cashAccount.balance) : 0;
    const beginningCash = Math.max(0, endingCash - netChangeInCash);

    return {
      operatingActivities,
      investingActivities,
      financingActivities,
      netOperatingCashFlow,
      netInvestingCashFlow,
      netFinancingCashFlow,
      netChangeInCash,
      beginningCash,
      endingCash,
    };
  }, [generateTAccounts, generateIncomeStatement]);

  // Navigation
  const navigateTo = useCallback((view: ViewMode, entryId?: string) => {
    setCurrentView(view);
    if (entryId) {
      setCurrentEntryId(entryId);
    }
  }, []);

  const goToDashboard = useCallback(() => {
    setCurrentView('dashboard');
    setCurrentWorkbookId(null);
    setCurrentEntryId(null);
  }, []);

  return {
    // State
    workbooks,
    currentWorkbook,
    currentEntry,
    currentView,
    currentWorkbookId,
    currentEntryId,
    dbLoading,

    // Actions
    createWorkbook,
    deleteWorkbook,
    selectWorkbook,
    createJournalEntry,
    updateJournalEntry,
    addJournalLine,
    updateJournalLine,
    deleteJournalLine,
    generateTAccounts,
    generateTrialBalance,

    // Running Balance
    createRunningBalance,
    expireRunningBalancePeriod,
    deleteRunningBalance,

    // Financial Statements
    generateBalanceSheet,
    generateIncomeStatement,
    generateCashFlowStatement,

    // Navigation
    navigateTo,
    goToDashboard,
    setCurrentView,
    setCurrentEntryId,
  };
};

export type LedgerContextType = ReturnType<typeof useLedger>;
