import { useState } from 'react';
import { Building2, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/types/accounting';

interface LineItem {
    id: string;
    description: string;
    amount: number;
    type: 'add' | 'deduct';
}

export const BankReconciliation = () => {
    const [unadjustedBank, setUnadjustedBank] = useState<number>(15400);
    const [unadjustedBook, setUnadjustedBook] = useState<number>(14250);

    const [bankItems, setBankItems] = useState<LineItem[]>([
        { id: '1', description: 'Deposit in Transit', amount: 800, type: 'add' },
        { id: '2', description: 'Outstanding Check #104', amount: 500, type: 'deduct' },
    ]);

    const [bookItems, setBookItems] = useState<LineItem[]>([
        { id: '3', description: 'Bank Service Charge', amount: 50, type: 'deduct' },
        { id: '4', description: 'Note Collected by Bank', amount: 1500, type: 'add' },
    ]);

    const handleAddItem = (side: 'bank' | 'book', type: 'add' | 'deduct') => {
        const newItem: LineItem = { id: crypto.randomUUID(), description: '', amount: 0, type };
        if (side === 'bank') setBankItems([...bankItems, newItem]);
        else setBookItems([...bookItems, newItem]);
    };

    const updateItem = (side: 'bank' | 'book', id: string, field: keyof LineItem, value: any) => {
        if (side === 'bank') {
            setBankItems(bankItems.map(i => i.id === id ? { ...i, [field]: value } : i));
        } else {
            setBookItems(bookItems.map(i => i.id === id ? { ...i, [field]: value } : i));
        }
    };

    const removeItem = (side: 'bank' | 'book', id: string) => {
        if (side === 'bank') setBankItems(bankItems.filter(i => i.id !== id));
        else setBookItems(bookItems.filter(i => i.id !== id));
    };

    const bankAdjustments = bankItems.reduce((acc, curr) => curr.type === 'add' ? acc + curr.amount : acc - curr.amount, 0);
    const bookAdjustments = bookItems.reduce((acc, curr) => curr.type === 'add' ? acc + curr.amount : acc - curr.amount, 0);

    const adjustedBank = unadjustedBank + bankAdjustments;
    const adjustedBook = unadjustedBook + bookAdjustments;
    const isBalanced = Math.abs(adjustedBank - adjustedBook) < 0.01;

    const renderColumn = (title: string, unadjusted: number, setUnadjusted: (v: number) => void, items: LineItem[], side: 'bank' | 'book') => (
        <div className="bg-ivory border border-guide rounded-paper p-6 space-y-6">
            <div className="flex justify-between items-end border-b border-guide pb-4">
                <h4 className="font-serif font-bold text-ink uppercase tracking-wide text-sm">{title} Balance</h4>
                <div className="w-1/3">
                    <label className="text-xs uppercase text-text-secondary tracking-wide">Unadjusted</label>
                    <Input type="number" value={unadjusted} onChange={e => setUnadjusted(Number(e.target.value))} className="h-8 text-sm font-mono mt-1 bg-white border-guide" />
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="font-sans text-xs font-bold uppercase text-emerald-600 tracking-wide">Additions (+)</span>
                        <Button variant="ghost" size="sm" onClick={() => handleAddItem(side, 'add')} className="h-6 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"><Plus className="w-3 h-3 mr-1" /> Add</Button>
                    </div>
                    {items.filter(i => i.type === 'add').map(item => (
                        <div key={item.id} className="flex gap-2">
                            <Input placeholder="Description" value={item.description} onChange={e => updateItem(side, item.id, 'description', e.target.value)} className="h-8 text-sm bg-white border-guide" />
                            <Input type="number" value={item.amount || ''} onChange={e => updateItem(side, item.id, 'amount', Number(e.target.value))} className="h-8 text-sm w-24 font-mono bg-white border-guide" />
                            <Button variant="ghost" size="icon" onClick={() => removeItem(side, item.id)} className="h-8 w-8 text-text-secondary hover:text-accounting-red"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-guide/50">
                    <div className="flex justify-between items-center">
                        <span className="font-sans text-xs font-bold uppercase text-accounting-red tracking-wide">Deductions (-)</span>
                        <Button variant="ghost" size="sm" onClick={() => handleAddItem(side, 'deduct')} className="h-6 text-xs text-accounting-red hover:text-[#991b1b] hover:bg-red-50"><Plus className="w-3 h-3 mr-1" /> Add</Button>
                    </div>
                    {items.filter(i => i.type === 'deduct').map(item => (
                        <div key={item.id} className="flex gap-2">
                            <Input placeholder="Description" value={item.description} onChange={e => updateItem(side, item.id, 'description', e.target.value)} className="h-8 text-sm bg-white border-guide" />
                            <Input type="number" value={item.amount || ''} onChange={e => updateItem(side, item.id, 'amount', Number(e.target.value))} className="h-8 text-sm w-24 font-mono bg-white border-guide" />
                            <Button variant="ghost" size="icon" onClick={() => removeItem(side, item.id)} className="h-8 w-8 text-text-secondary hover:text-accounting-red"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t-2 border-ink pt-4 flex justify-between items-center">
                <span className="font-sans text-sm font-bold uppercase tracking-wide text-ink">Adjusted Balance</span>
                <span className="font-mono font-bold text-lg text-ink">${formatCurrency(side === 'bank' ? adjustedBank : adjustedBook)}</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-guide pb-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Building2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="font-serif text-2xl text-ink">Bank Reconciliation</h3>
                    <p className="font-sans text-sm text-text-secondary mt-1 leading-relaxed max-w-2xl">
                        Add deposits in transit, outstanding checks, bank fees, and errors to bridge the gap between what the bank says you have and what your ledger says you have. Get them to match to find the true cash balance.
                    </p>
                </div>
                <div className={`mt-2 px-4 py-3 rounded-paper border flex items-center gap-2 shadow-sm shrink-0 ${isBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${isBalanced ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="font-sans text-sm uppercase tracking-wider font-bold">
                        {isBalanced ? 'Balanced' : 'Out of Balance'}
                    </span>
                    {!isBalanced && (
                        <span className="font-mono text-sm ml-2 bg-white/50 px-2 py-0.5 rounded text-red-900 border border-red-200">
                            diff: ${formatCurrency(Math.abs(adjustedBank - adjustedBook))}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {renderColumn('Bank Statement', unadjustedBank, setUnadjustedBank, bankItems, 'bank')}
                {renderColumn('Company Ledger (Book)', unadjustedBook, setUnadjustedBook, bookItems, 'book')}
            </div>
        </div>
    );
};
