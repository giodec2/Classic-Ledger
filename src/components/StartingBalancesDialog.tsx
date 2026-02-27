import { useState } from 'react';
import { useLedgerContext } from '@/hooks/LedgerContext';
import { generateId } from '@/types/accounting';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface StartingBalanceRow {
    id: string;
    accountName: string;
    debit: string;
    credit: string;
}

export const StartingBalancesDialog = () => {
    const { currentWorkbookId, createJournalEntry, updateJournalEntry, workbooks } = useLedgerContext();
    const [open, setOpen] = useState(false);
    const [rows, setRows] = useState<StartingBalanceRow[]>([
        { id: generateId(), accountName: '', debit: '', credit: '' },
    ]);

    const currentWorkbook = workbooks.find(w => w.id === currentWorkbookId);
    const existingEntry = currentWorkbook?.entries.find(e => e.description === 'Starting Balances');
    const hasExistingBalances = !!(existingEntry && existingEntry.lines.length > 0);

    const addRow = () => {
        setRows([...rows, { id: generateId(), accountName: '', debit: '', credit: '' }]);
    };

    const removeRow = (id: string) => {
        if (rows.length > 1) {
            setRows(rows.filter((r) => r.id !== id));
        }
    };

    const updateRow = (id: string, field: keyof StartingBalanceRow, value: string) => {
        setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    };

    const handleSave = () => {
        if (!currentWorkbookId) return;

        // Filter out completely empty rows
        const validRows = rows.filter(r => r.accountName.trim() !== '' && (r.debit !== '' || r.credit !== ''));
        if (validRows.length === 0) {
            toast.error('Please enter at least one valid starting balance.');
            return;
        }

        // Basic balancing check (optional, but good practice)
        let totalDebit = 0;
        let totalCredit = 0;
        for (const r of validRows) {
            const db = parseFloat(r.debit) || 0;
            const cr = parseFloat(r.credit) || 0;
            totalDebit += db;
            totalCredit += cr;
        }

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            toast.warning(`Warning: Starting balances are not balanced. Difference: $${Math.abs(totalDebit - totalCredit).toFixed(2)}`, {
                duration: 5000,
            });
        }

        // Find existing starting balances entry, or create a new one.
        let entryId = existingEntry?.id;
        if (!entryId) {
            entryId = createJournalEntry(currentWorkbookId);
            updateJournalEntry(currentWorkbookId, entryId, {
                description: 'Starting Balances',
                date: new Date().toISOString()
            });
        }

        // Now we update or add lines to this entry
        // A more straightforward approach is to update the entry entirely
        // We can use updateJournalEntry to overwrite the lines
        const newLines = validRows.map(r => ({
            id: generateId(),
            date: new Date().toISOString(),
            description: r.accountName,
            reference: 'Start',
            debit: parseFloat(r.debit) || null,
            credit: parseFloat(r.credit) || null,
        }));

        updateJournalEntry(currentWorkbookId, entryId, {
            description: 'Starting Balances',
            lines: newLines
        });

        toast.success('Starting balances recorded successfully.');
        setOpen(false);
    };

    // Reset or populate rows when opening
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            if (hasExistingBalances) {
                const existingRows = existingEntry.lines
                    .filter(line => line.description.trim() !== '' || line.debit !== null || line.credit !== null)
                    .map(line => ({
                        id: generateId(),
                        accountName: line.description,
                        debit: line.debit !== null ? line.debit.toString() : '',
                        credit: line.credit !== null ? line.credit.toString() : ''
                    }));
                setRows(existingRows.length > 0 ? existingRows : [{ id: generateId(), accountName: '', debit: '', credit: '' }]);
            } else {
                setRows([{ id: generateId(), accountName: '', debit: '', credit: '' }]);
            }
        }
        setOpen(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 font-serif">
                    {hasExistingBalances ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {hasExistingBalances ? 'Edit Starting Balances' : 'Enter Starting Balances'}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-display">Enter Unadjusted Trial Balance</DialogTitle>
                    <DialogDescription className="font-sans">
                        Input the starting balances for your exercise. These will be recorded as a special journal entry.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 py-4">
                    <div className="space-y-3">
                        <div className="grid grid-cols-[1fr_120px_120px_auto] gap-3 items-center px-1">
                            <span className="font-sans text-xs uppercase tracking-wide text-muted-foreground font-semibold">Account Name</span>
                            <span className="font-sans text-xs uppercase tracking-wide text-muted-foreground font-semibold text-right">Debit</span>
                            <span className="font-sans text-xs uppercase tracking-wide text-muted-foreground font-semibold text-right">Credit</span>
                            <div className="w-8"></div>
                        </div>

                        {rows.map((row) => (
                            <div key={row.id} className="grid grid-cols-[1fr_120px_120px_auto] gap-3 items-center">
                                <Input
                                    placeholder="e.g. Cash, Capital"
                                    value={row.accountName}
                                    onChange={(e) => updateRow(row.id, 'accountName', e.target.value)}
                                    className="font-serif"
                                />
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={row.debit}
                                    onChange={(e) => updateRow(row.id, 'debit', e.target.value)}
                                    className="font-mono text-right"
                                />
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={row.credit}
                                    onChange={(e) => updateRow(row.id, 'credit', e.target.value)}
                                    className="font-mono text-right"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeRow(row.id)}
                                    className="text-muted-foreground hover:text-destructive shrink-0"
                                    disabled={rows.length === 1}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        onClick={addRow}
                        className="w-full mt-4 border-dashed border-2 text-muted-foreground hover:text-foreground"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Account Row
                    </Button>
                </div>

                <DialogFooter className="mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Balances</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
