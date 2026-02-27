import { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { useLedgerContext } from '@/hooks/LedgerContext';
import { Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatShortDate, type JournalEntryLine } from '@/types/accounting';

interface EditableRowProps {
  line: JournalEntryLine;
  isFirstRow: boolean;
  onUpdate: (lineId: string, updates: Partial<JournalEntryLine>) => void;
  onDelete: (lineId: string) => void;
  onAddLine: () => void;
}

const EditableRow = ({
  line,
  isFirstRow,
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
      className={`grid grid-cols-[100px_1fr_60px_120px_120px_40px] gap-2 items-center h-12 border-b border-guide transition-all ${
        isFocused ? 'bg-surface border-b-ink' : 'bg-transparent'
      }`}
    >
      {/* Date */}
      <div className="px-2">
        {isFirstRow ? (
          <input
            type="text"
            value={line.date ? formatShortDate(line.date) : ''}
            onChange={(e) => onUpdate(line.id, { date: e.target.value })}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="DD/MM"
            className="w-full bg-transparent font-mono text-data text-ink placeholder:text-muted outline-none"
          />
        ) : (
          <span className="font-mono text-data text-muted" />
        )}
      </div>

      {/* Description */}
      <div className={`px-2 ${isCredit ? 'pl-8' : ''}`}>
        <input
          type="text"
          value={line.description}
          onChange={(e) => onUpdate(line.id, { description: e.target.value })}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={isCredit ? 'Credit account' : 'Debit account'}
          className="w-full bg-transparent font-serif text-body text-ink placeholder:text-muted outline-none"
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
          className="p-1.5 text-muted hover:text-accounting-red transition-colors opacity-0 hover:opacity-100 focus:opacity-100"
          title="Delete line"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const JournalEntry = () => {
  const {
    currentWorkbook,
    currentEntry,
    currentWorkbookId,
    addJournalLine,
    updateJournalLine,
    deleteJournalLine,
    createJournalEntry,
    setCurrentEntryId,
  } = useLedgerContext();

  const headerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Create initial entry if none exists
  useEffect(() => {
    if (currentWorkbookId && currentWorkbook && currentWorkbook.entries.length === 0) {
      const entryId = createJournalEntry(currentWorkbookId);
      setCurrentEntryId(entryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkbookId, currentWorkbook]);

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo(headerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
      .fromTo(tableRef.current,
        { opacity: 0, y: 40, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 },
        '-=0.3'
      )
      .fromTo(footerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4 },
        '-=0.3'
      );
    });

    return () => ctx.revert();
  }, []);

  const handleUpdateLine = useCallback((lineId: string, updates: Partial<JournalEntryLine>) => {
    if (currentWorkbookId && currentEntry) {
      updateJournalLine(currentWorkbookId, currentEntry.id, lineId, updates);
    }
  }, [currentWorkbookId, currentEntry, updateJournalLine]);

  const handleDeleteLine = useCallback((lineId: string) => {
    if (currentWorkbookId && currentEntry) {
      deleteJournalLine(currentWorkbookId, currentEntry.id, lineId);
    }
  }, [currentWorkbookId, currentEntry, deleteJournalLine]);

  const handleAddLine = useCallback(() => {
    if (currentWorkbookId && currentEntry) {
      addJournalLine(currentWorkbookId, currentEntry.id);
    }
  }, [currentWorkbookId, currentEntry, addJournalLine]);

  if (!currentWorkbook || !currentEntry) {
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

  const entry = currentEntry;
  const totals = {
    debit: entry.totalDebit,
    credit: entry.totalCredit,
    diff: Math.abs(entry.totalDebit - entry.totalCredit),
    isBalanced: entry.isBalanced,
  };

  return (
    <section className="min-h-screen pt-28 pb-8 px-[8vw]">
      {/* Header */}
      <div ref={headerRef} className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-display text-ink tracking-tight">
            General Journal
          </h1>
          <p className="font-serif text-body text-text-secondary mt-1">
            Record double-entry transactions with precision
          </p>
        </div>
        <div className="font-mono text-data text-text-secondary">
          Entry #{entry.entryNumber} • {formatShortDate(entry.date)}
        </div>
      </div>

      {/* Table */}
      <div 
        ref={tableRef} 
        className="border border-guide rounded-paper bg-surface overflow-hidden"
      >
        {/* Table Header */}
        <div className="grid grid-cols-[100px_1fr_60px_120px_120px_40px] gap-2 h-10 bg-ivory border-b border-guide items-center">
          <div className="px-2 font-sans text-label uppercase tracking-wide text-text-secondary">
            Date
          </div>
          <div className="px-2 font-sans text-label uppercase tracking-wide text-text-secondary">
            Details
          </div>
          <div className="px-2 font-sans text-label uppercase tracking-wide text-text-secondary text-center">
            Ref
          </div>
          <div className="px-2 font-sans text-label uppercase tracking-wide text-text-secondary text-right">
            Debit
          </div>
          <div className="px-2 font-sans text-label uppercase tracking-wide text-text-secondary text-right">
            Credit
          </div>
          <div />
        </div>

        {/* Table Body */}
        <div className="min-h-[320px]">
          {entry.lines.map((line, index) => (
            <EditableRow
              key={line.id}
              line={line}
              isFirstRow={index === 0}
              onUpdate={handleUpdateLine}
              onDelete={handleDeleteLine}
              onAddLine={handleAddLine}
            />
          ))}
        </div>

        {/* Add Line Button */}
        <div className="p-3 border-t border-guide bg-ivory">
          <button
            onClick={handleAddLine}
            className="flex items-center gap-2 px-4 py-2 font-mono text-data text-text-secondary hover:text-ink transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add line
          </button>
        </div>
      </div>

      {/* Balance Bar */}
      <div 
        ref={footerRef}
        className={`mt-4 p-4 rounded-paper border transition-all ${
          totals.isBalanced
            ? 'bg-ivory border-guide'
            : 'bg-pale-red border-accounting-red/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="font-sans text-label uppercase tracking-wide text-text-secondary">
                Debit
              </span>
              <span className="font-mono text-data text-ink tabular-nums">
                {formatCurrency(totals.debit)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-sans text-label uppercase tracking-wide text-text-secondary">
                Credit
              </span>
              <span className="font-mono text-data text-ink tabular-nums">
                {formatCurrency(totals.credit)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-sans text-label uppercase tracking-wide text-text-secondary">
                Diff
              </span>
              <span className={`font-mono text-data tabular-nums ${
                totals.diff > 0 ? 'text-accounting-red' : 'text-green-600'
              }`}>
                {formatCurrency(totals.diff)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totals.isBalanced ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-sans text-label uppercase tracking-wide text-green-600">
                  Balanced
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-accounting-red" />
                <span className="font-sans text-label uppercase tracking-wide text-accounting-red">
                  Unbalanced
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 border border-guide rounded-paper bg-ivory/50">
        <h3 className="font-sans text-label uppercase tracking-wide text-text-secondary mb-2">
          How to record
        </h3>
        <ul className="font-serif text-body text-text-secondary space-y-1 list-disc list-inside">
          <li>Enter the date on the first line (DD/MM format)</li>
          <li>Type the account name in Details</li>
          <li>Enter the amount in either Debit or Credit column</li>
          <li>Credit entries are automatically indented</li>
          <li>Press Enter or click "Add line" for additional lines</li>
        </ul>
      </div>
    </section>
  );
};
