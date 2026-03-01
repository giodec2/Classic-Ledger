import { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { useLedgerContext } from '@/hooks/LedgerContext';
import { Plus, Trash2, AlertCircle, CheckCircle2, Download, BookOpen, FileText } from 'lucide-react';
import { formatCurrency, formatShortDate, type JournalEntryLine, type JournalEntry as JournalEntryType } from '@/types/accounting';
import { Button } from '@/components/ui/button';
import { downloadAsImage } from '@/lib/downloadImage';
import { AccountCombobox } from '@/components/AccountCombobox';

/* ─────────────────── Date Input Helper ─────────────────── */

const DateInput = ({
  value,
  onChange,
  onFocus,
  onBlur,
}: {
  value: string;
  onChange: (val: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}) => {
  const displayValue = value ? formatShortDate(value) : '';
  const parts = displayValue.split('/');
  const day = parts[0] || '';
  const month = parts[1] || '';

  const getDaysInMonth = (m: number) => {
    if (m === 2) return 28;
    if ([4, 6, 9, 11].includes(m)) return 30;
    return 31;
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value;
    let currentDayStr = day || '01';
    let currentDayInt = parseInt(currentDayStr, 10);

    const maxDays = getDaysInMonth(parseInt(newMonth, 10));
    if (currentDayInt > maxDays) {
      currentDayStr = maxDays.toString().padStart(2, '0');
    }
    onChange(`${currentDayStr}/${newMonth}`);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDay = e.target.value;
    const currentMonthStr = month || (new Date().getMonth() + 1).toString().padStart(2, '0');
    onChange(`${newDay}/${currentMonthStr}`);
  };

  const currentMonthInt = parseInt(month, 10) || (new Date().getMonth() + 1);
  const maxDays = getDaysInMonth(currentMonthInt);

  return (
    <div
      className="flex items-center gap-1.5"
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <select
        value={month}
        onChange={handleMonthChange}
        className="bg-transparent font-sans text-[13px] font-medium uppercase tracking-wide text-ink outline-none cursor-pointer appearance-none text-left hover:text-ink/70"
      >
        <option value="" disabled>MMM</option>
        {monthNames.map((m, i) => {
          const val = (i + 1).toString().padStart(2, '0');
          return <option key={val} value={val}>{m}</option>;
        })}
      </select>
      <select
        value={day}
        onChange={handleDayChange}
        className="bg-transparent font-mono text-sm text-ink outline-none cursor-pointer appearance-none text-center hover:text-ink/70 min-w-[24px]"
      >
        <option value="" disabled>DD</option>
        {Array.from({ length: maxDays }, (_, i) => {
          const d = (i + 1).toString().padStart(2, '0');
          return <option key={d} value={d}>{d}</option>;
        })}
      </select>
    </div>
  );
};

/* ─────────────────── Editable Line Row ─────────────────── */

interface EditableRowProps {
  line: JournalEntryLine;
  isFirstRow: boolean;
  existingAccounts: string[];
  onUpdate: (lineId: string, updates: Partial<JournalEntryLine>) => void;
  onDelete: (lineId: string) => void;
  onAddLine: () => void;
}

const EditableRow = ({
  line,
  isFirstRow,
  existingAccounts,
  onUpdate,
  onDelete,
  onAddLine,
}: EditableRowProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const isCredit = line.credit !== null && line.credit > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddLine();
    }
  };

  return (
    <div
      className={`grid grid-cols-[80px_1fr_60px_110px_110px_36px] gap-1 items-center h-11 border-b border-guide transition-all ${isFocused ? 'bg-surface border-b-ink' : 'bg-transparent'
        }`}
    >
      {/* Date */}
      <div className="px-2">
        {isFirstRow ? (
          <DateInput
            value={line.date}
            onChange={(val) => onUpdate(line.id, { date: val })}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        ) : (
          <span className="font-mono text-data text-muted" />
        )}
      </div>

      {/* Account Name */}
      <div className={`px-2 ${isCredit ? 'pl-8' : ''}`}>
        <AccountCombobox
          value={line.description}
          onChange={(val) => onUpdate(line.id, { description: val })}
          existingAccounts={existingAccounts}
          placeholder={isCredit ? 'Credit account' : 'Debit account'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className="font-serif text-body text-ink placeholder:text-muted"
        />
      </div>

      {/* Reference */}
      <div className="px-2">
        <input
          type="text"
          value={line.reference}
          onChange={(e) => onUpdate(line.id, { reference: e.target.value })}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ref"
          className="w-full bg-transparent font-mono text-micro text-ink placeholder:text-muted outline-none text-center"
        />
      </div>

      {/* Debit */}
      <div className="px-2 text-right">
        <input
          type="number"
          value={line.debit || ''}
          onChange={(e) => {
            const value = e.target.value ? parseFloat(e.target.value) : null;
            onUpdate(line.id, { debit: value, credit: null });
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="—"
          className="w-full bg-transparent font-mono text-data text-ink placeholder:text-muted outline-none text-right"
        />
      </div>

      {/* Credit */}
      <div className="px-2 text-right">
        <input
          type="number"
          value={line.credit || ''}
          onChange={(e) => {
            const value = e.target.value ? parseFloat(e.target.value) : null;
            onUpdate(line.id, { credit: value, debit: null });
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="—"
          className="w-full bg-transparent font-mono text-data text-ink placeholder:text-muted outline-none text-right"
        />
      </div>

      {/* Delete */}
      <div className="flex justify-center">
        <button
          onClick={() => onDelete(line.id)}
          className="p-1 text-muted hover:text-accounting-red transition-colors"
          title="Delete line"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

/* ─────────────────── Single Entry Block ─────────────────── */

interface EntryBlockProps {
  entry: JournalEntryType;
  existingAccounts: string[];
  onUpdateLine: (entryId: string, lineId: string, updates: Partial<JournalEntryLine>) => void;
  onDeleteLine: (entryId: string, lineId: string) => void;
  onAddLine: (entryId: string) => void;
  onDeleteEntry: (entryId: string) => void;
}

const EntryBlock = ({
  entry,
  existingAccounts,
  onUpdateLine,
  onDeleteLine,
  onAddLine,
  onDeleteEntry,
}: EntryBlockProps) => {
  const blockRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={blockRef} className="border border-guide rounded-paper bg-surface">
      {/* Entry Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-ivory border-b border-guide">
        <div className="flex items-center gap-3">
          <span className="font-mono text-data text-ink font-medium">
            Entry #{entry.entryNumber}
          </span>
          {entry.isBalanced ? (
            <span className="flex items-center gap-1 font-sans text-[10px] uppercase tracking-wide text-green-600">
              <CheckCircle2 className="w-3 h-3" />
              Balanced
            </span>
          ) : (
            <span className="flex items-center gap-1 font-sans text-[10px] uppercase tracking-wide text-accounting-red">
              <AlertCircle className="w-3 h-3" />
              Unbalanced
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-micro text-text-secondary">
            Dr {formatCurrency(entry.totalDebit)} · Cr {formatCurrency(entry.totalCredit)}
          </span>
          <button
            onClick={() => onDeleteEntry(entry.id)}
            className="p-1.5 text-muted hover:text-accounting-red transition-colors"
            title="Delete entry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Lines */}
      <div>
        {entry.lines.map((line, index) => (
          <EditableRow
            key={line.id}
            line={line}
            isFirstRow={index === 0}
            existingAccounts={existingAccounts}
            onUpdate={(lineId, updates) => onUpdateLine(entry.id, lineId, updates)}
            onDelete={(lineId) => onDeleteLine(entry.id, lineId)}
            onAddLine={() => onAddLine(entry.id)}
          />
        ))}
      </div>

      {/* Add Line */}
      <div className="px-3 py-2 border-t border-guide bg-ivory/50">
        <button
          onClick={() => onAddLine(entry.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] text-text-secondary hover:text-ink transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add line
        </button>
      </div>
    </div>
  );
};

/* ─────────────────── Main Journal Component ─────────────────── */

export const JournalEntry = () => {
  const {
    currentWorkbook,
    currentWorkbookId,
    addJournalLine,
    updateJournalLine,
    deleteJournalLine,
    deleteJournalEntry,
    createJournalEntry,
    setCurrentEntryId,
  } = useLedgerContext();

  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo(headerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
        .fromTo(contentRef.current,
          { opacity: 0, y: 40, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6 },
          '-=0.3'
        );

      if (footerRef.current) {
        tl.fromTo(footerRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4 },
          '-=0.3'
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const handleUpdateLine = useCallback((entryId: string, lineId: string, updates: Partial<JournalEntryLine>) => {
    if (currentWorkbookId) {
      updateJournalLine(currentWorkbookId, entryId, lineId, updates);
    }
  }, [currentWorkbookId, updateJournalLine]);

  const handleDeleteLine = useCallback((entryId: string, lineId: string) => {
    if (currentWorkbookId) {
      deleteJournalLine(currentWorkbookId, entryId, lineId);
    }
  }, [currentWorkbookId, deleteJournalLine]);

  const handleAddLine = useCallback((entryId: string) => {
    if (currentWorkbookId) {
      addJournalLine(currentWorkbookId, entryId);
    }
  }, [currentWorkbookId, addJournalLine]);

  const handleDeleteEntry = useCallback((entryId: string) => {
    if (currentWorkbookId) {
      deleteJournalEntry(currentWorkbookId, entryId);
    }
  }, [currentWorkbookId, deleteJournalEntry]);

  const handleNewEntry = useCallback(() => {
    if (currentWorkbookId) {
      const entryId = createJournalEntry(currentWorkbookId);
      setCurrentEntryId(entryId);
    }
  }, [currentWorkbookId, createJournalEntry, setCurrentEntryId]);

  // ── No workbook selected ──
  if (!currentWorkbook) {
    return (
      <section className="min-h-screen pt-32 pb-16 px-[8vw] flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-body text-text-secondary">
            No workbook selected. Please return to the dashboard.
          </p>
        </div>
      </section>
    );
  }

  // ── Workbook exists but no entries yet ──
  if (currentWorkbook.entries.length === 0) {
    return (
      <section className="min-h-screen pt-32 pb-16 px-[8vw] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-ivory border-2 border-guide flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8 text-text-secondary" />
          </div>
          <div>
            <h2 className="font-display text-heading text-ink mb-2">
              Your journal is empty
            </h2>
            <p className="font-serif text-body text-text-secondary max-w-md">
              Start recording your double-entry transactions. Each journal entry captures debits and credits that flow into the ledger.
            </p>
          </div>
          <button
            onClick={handleNewEntry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accounting-red text-white font-sans text-label uppercase tracking-wide rounded-paper hover:bg-accounting-red/90 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Register First Entry
          </button>
        </div>
      </section>
    );
  }

  // ── Full Journal View ──
  const entries = currentWorkbook.entries;

  // Collect all unique account names used in this workbook
  const existingAccounts = (() => {
    const seen = new Set<string>();
    for (const entry of entries) {
      for (const line of entry.lines) {
        if (line.description?.trim()) {
          seen.add(line.description.trim());
        }
      }
    }
    return Array.from(seen);
  })();

  const totalDebit = entries.reduce((s, e) => s + e.totalDebit, 0);
  const totalCredit = entries.reduce((s, e) => s + e.totalCredit, 0);
  const allBalanced = entries.every(e => e.isBalanced);

  return (
    <section id="journal-view" className="min-h-screen pt-28 pb-8 px-[8vw]">
      {/* Header */}
      <div ref={headerRef} className="flex flex-col md:flex-row items-start md:items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display text-display text-ink tracking-tight">
            General Journal
          </h1>
          <p className="font-serif text-body text-text-secondary mt-1">
            Record and manage double-entry transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-data text-text-secondary">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
          <Button
            variant="outline"
            className="gap-2 font-serif"
            onClick={() => downloadAsImage('journal-view', 'general-journal')}
          >
            <Download className="w-4 h-4" />
            Download Image
          </Button>
          <button
            onClick={handleNewEntry}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-accounting-red text-white font-sans text-[11px] uppercase tracking-wide rounded-paper hover:bg-accounting-red/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </div>

      {/* Table Header (sticky columns labels) */}
      <div ref={contentRef} className="space-y-3">
        <div className="grid grid-cols-[80px_1fr_60px_110px_110px_36px] gap-1 h-9 bg-ink text-ivory items-center rounded-t-paper px-0">
          <div className="px-2 font-sans text-[10px] uppercase tracking-wide">Date</div>
          <div className="px-2 font-sans text-[10px] uppercase tracking-wide">Details</div>
          <div className="px-2 font-sans text-[10px] uppercase tracking-wide text-center">Ref</div>
          <div className="px-2 font-sans text-[10px] uppercase tracking-wide text-right">Debit</div>
          <div className="px-2 font-sans text-[10px] uppercase tracking-wide text-right">Credit</div>
          <div />
        </div>

        {/* Entry Blocks */}
        {entries.map((entry) => (
          <EntryBlock
            key={entry.id}
            entry={entry}
            existingAccounts={existingAccounts}
            onUpdateLine={handleUpdateLine}
            onDeleteLine={handleDeleteLine}
            onAddLine={handleAddLine}
            onDeleteEntry={handleDeleteEntry}
          />
        ))}
      </div>

      {/* Grand Totals Bar */}
      <div
        ref={footerRef}
        className={`mt-4 p-4 rounded-paper border transition-all ${allBalanced
          ? 'bg-ivory border-guide'
          : 'bg-pale-red border-accounting-red/30'
          }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="font-sans text-label uppercase tracking-wide text-text-secondary">
                Total Debit
              </span>
              <span className="font-mono text-data text-ink tabular-nums">
                {formatCurrency(totalDebit)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-sans text-label uppercase tracking-wide text-text-secondary">
                Total Credit
              </span>
              <span className="font-mono text-data text-ink tabular-nums">
                {formatCurrency(totalCredit)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-sans text-label uppercase tracking-wide text-text-secondary">
                Diff
              </span>
              <span className={`font-mono text-data tabular-nums ${Math.abs(totalDebit - totalCredit) > 0.001 ? 'text-accounting-red' : 'text-green-600'
                }`}>
                {formatCurrency(Math.abs(totalDebit - totalCredit))}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {allBalanced ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-sans text-label uppercase tracking-wide text-green-600">
                  All Balanced
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-accounting-red" />
                <span className="font-sans text-label uppercase tracking-wide text-accounting-red">
                  Unbalanced Entries
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-8 p-4 border border-guide rounded-paper bg-ivory/50">
        <h3 className="font-sans text-label uppercase tracking-wide text-text-secondary mb-2">
          About the General Journal
        </h3>
        <p className="font-serif text-body text-text-secondary mb-3">
          The general journal is the book of original entry where all business transactions are first recorded
          in chronological order. Each entry must follow the double-entry principle: total debits must equal
          total credits.
        </p>
        <ul className="font-serif text-body text-text-secondary space-y-1 list-disc list-inside">
          <li>Enter the date on the first line (DD/MM format)</li>
          <li>Type the account name in Details — debit accounts listed first</li>
          <li>Credit accounts are automatically indented</li>
          <li>Press Enter to quickly add a new line</li>
          <li>Use the <strong>New Entry</strong> button for each separate transaction</li>
        </ul>
      </div>
    </section>
  );
};
