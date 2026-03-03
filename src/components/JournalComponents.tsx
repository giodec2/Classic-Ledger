import { useState, useRef } from 'react';
import { Trash2, AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import { formatCurrency, formatShortDate, type JournalEntryLine, type JournalEntry as JournalEntryType } from '@/types/accounting';
import { AccountCombobox } from '@/components/AccountCombobox';

/* ─────────────────── Date Input Helper ─────────────────── */

export const DateInput = ({
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

export interface EditableRowProps {
    line: JournalEntryLine;
    isFirstRow: boolean;
    existingAccounts: string[];
    onUpdate: (lineId: string, updates: Partial<JournalEntryLine>) => void;
    onDelete: (lineId: string) => void;
    onAddLine: () => void;
}

export const EditableRow = ({
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

export interface EntryBlockProps {
    entry: JournalEntryType;
    existingAccounts: string[];
    onUpdateLine: (entryId: string, lineId: string, updates: Partial<JournalEntryLine>) => void;
    onDeleteLine: (entryId: string, lineId: string) => void;
    onAddLine: (entryId: string) => void;
    onDeleteEntry: (entryId: string) => void;
}

export const EntryBlock = ({
    entry,
    existingAccounts,
    onUpdateLine,
    onDeleteLine,
    onAddLine,
    onDeleteEntry,
}: EntryBlockProps) => {
    const blockRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={blockRef} className="border border-guide rounded-paper bg-surface overflow-x-auto min-w-[600px]">
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
            <div className="min-w-max">
                <div className="grid grid-cols-[80px_1fr_60px_110px_110px_36px] gap-1 h-9 bg-ink/5 text-ink/70 items-center justify-items-stretch px-0 border-b border-guide sticky top-0">
                    <div className="px-2 font-sans text-[10px] uppercase tracking-wide">Date</div>
                    <div className="px-2 font-sans text-[10px] uppercase tracking-wide">Account Name</div>
                    <div className="px-2 font-sans text-[10px] uppercase tracking-wide text-center">Ref</div>
                    <div className="px-2 font-sans text-[10px] uppercase tracking-wide text-right">Debit</div>
                    <div className="px-2 font-sans text-[10px] uppercase tracking-wide text-right">Credit</div>
                    <div />
                </div>
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
