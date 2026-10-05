import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  JournalEntry,
  JournalEntryLine,
  Workbook,
  TAccount,
  TrialBalance,
  TrialBalanceRow,
  RunningBalanceItem,
} from '@/types/accounting';
import {
  generateId,
  calculateTotals,
  classifyAccount,
  generateRunningBalanceEntries
} from '@/types/accounting';



export const useLedger = (userId?: string, workbookId?: string | null) => {
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const currentWorkbookId = workbookId ?? null;
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  // Track which workbook IDs have unsaved changes
  const dirtyIds = useRef<Set<string>>(new Set());
  // Keep a ref to the latest workbooks so debounce-save never reads stale data
  const workbooksRef = useRef<Workbook[]>(workbooks);
  useEffect(() => { workbooksRef.current = workbooks; }, [workbooks]);

  // Workbook selection lives in the URL; switching workbooks clears the selected entry.
  const [selectedWorkbookId, setSelectedWorkbookId] = useState(currentWorkbookId);
  if (selectedWorkbookId !== currentWorkbookId) {
    setSelectedWorkbookId(currentWorkbookId);
    if (currentEntryId !== null) setCurrentEntryId(null);
  }

  // Helper: update workbooks state AND mark the changed workbook as dirty
  const markDirty = useCallback((workbookId: string, updater: (prev: Workbook[]) => Workbook[]) => {
    dirtyIds.current.add(workbookId);
    setWorkbooks(updater);
  }, []);

  // ---------- Load workbooks from Supabase ----------
  useEffect(() => {
    if (!userId) { setDbLoading(false); return; }
    setDbLoading(true);
    console.log('[Supabase] Loading workbooks for user:', userId);
    supabase
      .from('workbooks')
      .select('id, name, data, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('[Supabase] Load error:', error);
          setDbLoading(false);
          return;
        }
        console.log('[Supabase] Loaded rows:', data?.length ?? 0);
        const loaded: Workbook[] = (data ?? []).map((row) => {
          const d = row.data as Record<string, unknown>;
          // Deep-deserialize Date fields inside entries stored as ISO strings
          const entries = Array.isArray(d.entries)
            ? (d.entries as Record<string, unknown>[]).map((e) => ({
              ...e,
              createdAt: e.createdAt ? new Date(e.createdAt as string) : new Date(),
              updatedAt: e.updatedAt ? new Date(e.updatedAt as string) : new Date(),
            }))
            : [];
          return {
            ...d,
            entries,
            id: row.id as string,
            name: row.name as string,
            createdAt: new Date(row.created_at as string),
            updatedAt: new Date(row.updated_at as string),
          } as Workbook;
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
      // Always read from the ref to get the latest state, avoiding stale closures
      const currentWorkbooks = workbooksRef.current;
      for (const id of idsToSave) {
        const wb = currentWorkbooks.find(w => w.id === id);
        if (!wb) { console.warn('[Supabase] Skipping save for missing workbook:', id); continue; }
        const { id: _id, name, createdAt, updatedAt, ...rest } = wb;
        console.log('[Supabase] Saving workbook:', id, name);
        const { error } = await supabase.from('workbooks').upsert({
          id,
          user_id: userId,
          name,
          data: rest,
          created_at: createdAt instanceof Date ? createdAt.toISOString() : String(createdAt),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
        if (error) {
          console.error('[Supabase] Save error for workbook', id, ':', error);
        } else {
          console.log('[Supabase] Saved workbook successfully:', id);
        }
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
    // Use markDirty so the unified debounce-save path handles persistence
    markDirty(id, prev => [newWorkbook, ...prev]);
    // Also do an immediate insert so the row exists right away (the debounce upsert
    // will update it with the same data shape later if needed)
    if (userId) {
      const { id: _id, name: _name, createdAt, updatedAt, ...rest } = newWorkbook;
      console.log('[Supabase] Creating workbook:', id, name);
      const { error } = await supabase.from('workbooks').insert({
        id,
        user_id: userId,
        name,
        data: rest,
        created_at: createdAt.toISOString(),
        updated_at: updatedAt.toISOString(),
      });
      if (error) console.error('[Supabase] Create workbook error:', error);
      else console.log('[Supabase] Created workbook successfully:', id);
    }
    return id;
  }, [userId, markDirty]);

  const deleteWorkbook = useCallback(async (id: string) => {
    setWorkbooks(prev => prev.filter(wb => wb.id !== id));
    if (currentEntryId) setCurrentEntryId(null);
    if (userId) {
      const { error } = await supabase.from('workbooks').delete().eq('id', id);
      if (error) console.error('Delete workbook error:', error);
    }
  }, [currentEntryId, userId]);

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

  const createFastJournalEntry = useCallback((
    workbookId: string,
    date: string,
    debitAccount: string,
    creditAccount: string,
    amount: number,
    description: string = ''
  ): string => {
    const newEntry: JournalEntry = {
      id: generateId(),
      entryNumber: 0,
      date: new Date().toISOString(),
      description,
      lines: [
        {
          id: generateId(),
          date,
          description: debitAccount,
          reference: '',
          debit: amount,
          credit: null,
        },
        {
          id: generateId(),
          date: '',
          description: creditAccount,
          reference: '',
          debit: null,
          credit: amount,
        },
      ],
      isBalanced: true,
      totalDebit: amount,
      totalCredit: amount,
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

  const addCompleteJournalEntry = useCallback((
    workbookId: string,
    date: string,
    description: string,
    lines: Omit<JournalEntryLine, 'id'>[]
  ): string => {
    const newEntry: JournalEntry = {
      id: generateId(),
      entryNumber: 0,
      date: date || new Date().toISOString(),
      description,
      lines: lines.map(line => ({ ...line, id: generateId() })),
      isBalanced: false, // Calculated next
      totalDebit: 0,
      totalCredit: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const totals = calculateTotals(newEntry.lines);
    newEntry.totalDebit = totals.totalDebit;
    newEntry.totalCredit = totals.totalCredit;
    newEntry.isBalanced = totals.isBalanced;

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

  const deleteJournalEntry = useCallback((workbookId: string, entryId: string) => {
    markDirty(workbookId, prev => prev.map(wb => {
      if (wb.id !== workbookId) return wb;
      const filtered = wb.entries.filter(e => e.id !== entryId);
      // Re-number remaining entries
      const renumbered = filtered.map((e, i) => ({ ...e, entryNumber: i + 1 }));
      return {
        ...wb,
        entries: renumbered,
        updatedAt: new Date(),
      };
    }));
    // If we deleted the current entry, clear it
    if (currentEntryId === entryId) {
      setCurrentEntryId(null);
    }
  }, [markDirty, currentEntryId]);

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
            date: entry.lines[0]?.date || entry.date,
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
            date: entry.lines[0]?.date || entry.date,
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

  return {
    // State
    workbooks,
    currentWorkbook,
    currentEntry,
    currentWorkbookId,
    currentEntryId,
    dbLoading,

    // Actions
    createWorkbook,
    deleteWorkbook,
    createJournalEntry,
    addCompleteJournalEntry,
    createFastJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    addJournalLine,
    updateJournalLine,
    deleteJournalLine,
    generateTAccounts,
    generateTrialBalance,

    // Running Balance
    createRunningBalance,
    expireRunningBalancePeriod,
    deleteRunningBalance,

    // Entry selection
    setCurrentEntryId,
  };
};

export type LedgerContextType = ReturnType<typeof useLedger>;
