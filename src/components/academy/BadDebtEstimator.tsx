import { useState, useMemo } from 'react';
import { TrendingDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/types/accounting';

export const BadDebtEstimator = () => {
    const [method, setMethod] = useState<'IS' | 'BS'>('IS');
    
    // IS Approach (% of Net Credit Sales)
    const [netCreditSales, setNetCreditSales] = useState<number>(500000);
    const [badDebtPercentage, setBadDebtPercentage] = useState<number>(1.5);
    
    // BS Approach (A/R Aging)
    const [allowanceBalance, setAllowanceBalance] = useState<number>(2500); // unadjusted
    const [allowanceBalanceType, setAllowanceBalanceType] = useState<'cr' | 'dr'>('cr');
    const [agingCategories, setAgingCategories] = useState([
        { id: '1', days: 'Not yet due', amount: 80000, uncollectiblePercent: 1 },
        { id: '2', days: '1-30 days past due', amount: 15000, uncollectiblePercent: 5 },
        { id: '3', days: '31-60 days past due', amount: 5000, uncollectiblePercent: 15 },
        { id: '4', days: 'Over 60 days past due', amount: 2000, uncollectiblePercent: 50 },
    ]);

    const updateAging = (id: string, field: 'amount' | 'uncollectiblePercent', value: number) => {
        setAgingCategories(agingCategories.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const calculation = useMemo(() => {
        if (method === 'IS') {
            const expense = netCreditSales * (badDebtPercentage / 100);
            return {
                expense,
                explanation: `Bad Debt Expense = Net Credit Sales × ${badDebtPercentage}%\n$${formatCurrency(expense)} = $${formatCurrency(netCreditSales)} × ${(badDebtPercentage / 100).toFixed(4)}`
            };
        } else {
            let targetAllowance = 0;
            const detailed = agingCategories.map(cat => {
                const est = cat.amount * (cat.uncollectiblePercent / 100);
                targetAllowance += est;
                return { ...cat, est };
            });

            const currentBalance = allowanceBalanceType === 'cr' ? allowanceBalance : -allowanceBalance;
            const expense = targetAllowance - currentBalance;

            return {
                expense,
                targetAllowance,
                detailed,
                explanation: `Target Allowance (Ending Balance) = $${formatCurrency(targetAllowance)}\nBad Debt Expense = Target - Unadjusted Balance\n$${formatCurrency(expense)} = $${formatCurrency(targetAllowance)} - $${formatCurrency(currentBalance)}`
            };
        }
    }, [method, netCreditSales, badDebtPercentage, agingCategories, allowanceBalance, allowanceBalanceType]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-guide pb-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                    <TrendingDown className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-serif text-2xl text-ink">Bad Debt Estimator</h3>
                    <p className="font-sans text-sm text-text-secondary mt-1 leading-relaxed max-w-2xl">
                        Calculate the adjusting entry required for uncollectible accounts using standard GAAP methods. Compare the Income Statement approach (% of Sales) vs the Balance Sheet approach (A/R Aging).
                    </p>
                </div>
            </div>

            <div className="flex p-1 bg-guide/30 rounded-paper w-fit">
                {[
                    { id: 'IS', label: 'Income Statement (% of Sales)' },
                    { id: 'BS', label: 'Balance Sheet (A/R Aging)' },
                ].map(m => (
                    <button
                        key={m.id}
                        onClick={() => setMethod(m.id as any)}
                        className={`px-4 py-2 text-sm font-sans uppercase tracking-wide rounded transition-colors ${method === m.id ? 'bg-ivory text-ink shadow-sm' : 'text-text-secondary hover:text-ink'}`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6 bg-ivory border border-guide rounded-paper p-6">
                    <h4 className="font-sans text-xs uppercase tracking-wide font-bold text-text-secondary mb-4 border-b border-guide pb-2">
                        {method === 'IS' ? 'Net Credit Sales Method' : 'Aging of Accounts Receivable Method'}
                    </h4>
                    
                    {method === 'IS' ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-serif text-text-secondary">Net Credit Sales ($)</label>
                                <Input type="number" value={netCreditSales} onChange={e => setNetCreditSales(Number(e.target.value))} className="font-mono bg-white border-guide" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-serif text-text-secondary">Estimated Bad Debt (%)</label>
                                <Input type="number" step="0.1" value={badDebtPercentage} onChange={e => setBadDebtPercentage(Number(e.target.value))} className="font-mono bg-white border-guide" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex gap-4 items-end bg-surface p-4 rounded border border-guide/50">
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-serif text-text-secondary">Unadjusted Allowance Balance ($)</label>
                                    <Input type="number" value={allowanceBalance} onChange={e => setAllowanceBalance(Number(e.target.value))} className="font-mono bg-white border-guide" />
                                </div>
                                <div className="space-y-2 flex flex-col">
                                    <label className="text-sm font-serif text-text-secondary">Type</label>
                                    <div className="flex bg-white rounded border border-guide overflow-hidden h-10">
                                        <button onClick={() => setAllowanceBalanceType('dr')} className={`px-3 font-sans uppercase text-xs font-bold ${allowanceBalanceType === 'dr' ? 'bg-[#b91c1c] text-white' : 'text-text-secondary'}`}>Dr</button>
                                        <button onClick={() => setAllowanceBalanceType('cr')} className={`px-3 font-sans uppercase text-xs font-bold ${allowanceBalanceType === 'cr' ? 'bg-[#1e40af] text-white' : 'text-text-secondary'}`}>Cr</button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-12 gap-2 mb-2 px-2">
                                    <div className="col-span-6 text-xs uppercase text-text-secondary font-bold font-sans">Age Group</div>
                                    <div className="col-span-3 text-xs uppercase text-text-secondary font-bold font-sans text-right">Amount ($)</div>
                                    <div className="col-span-3 text-xs uppercase text-text-secondary font-bold font-sans text-right">Rate (%)</div>
                                </div>
                                {agingCategories.map(cat => (
                                    <div key={cat.id} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-6 font-serif text-sm text-ink">{cat.days}</div>
                                        <div className="col-span-4">
                                            <Input type="number" value={cat.amount} onChange={e => updateAging(cat.id, 'amount', Number(e.target.value))} className="h-8 text-xs font-mono bg-white border-guide" />
                                        </div>
                                        <div className="col-span-2">
                                            <Input type="number" value={cat.uncollectiblePercent} onChange={e => updateAging(cat.id, 'uncollectiblePercent', Number(e.target.value))} className="h-8 text-xs font-mono bg-white border-guide" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Outputs */}
                <div className="space-y-6">
                    <div className="bg-ivory border border-guide rounded-paper overflow-hidden">
                        <div className="p-6 bg-surface/50 border-b border-guide">
                            <h4 className="font-sans text-xs uppercase tracking-wide font-bold text-text-secondary mb-4">Required Adjusting Entry</h4>
                            
                            <div className="bg-white border text-sm border-guide rounded-paper overflow-hidden shadow-sm mt-4">
                                <div className="grid grid-cols-4 gap-4 border-b border-ink/20 py-2 px-4 bg-guide/20 font-sans uppercase tracking-wide text-[10px] text-ink font-bold">
                                    <div className="col-span-2">Account</div>
                                    <div className="col-span-1 text-right">Debit</div>
                                    <div className="col-span-1 text-right">Credit</div>
                                </div>
                                <div className="grid grid-cols-4 gap-4 border-b border-guide/50 py-3 px-4 text-sm hover:bg-surface">
                                    <div className="col-span-2 font-serif text-ink">Bad Debt Expense</div>
                                    <div className="col-span-1 text-right font-mono">${formatCurrency(calculation.expense)}</div>
                                    <div className="col-span-1 text-right font-mono">—</div>
                                </div>
                                <div className="grid grid-cols-4 gap-4 py-3 px-4 text-sm hover:bg-surface">
                                    <div className="col-span-2 font-serif text-ink pl-6">Allowance for Doubtful Accts</div>
                                    <div className="col-span-1 text-right font-mono">—</div>
                                    <div className="col-span-1 text-right font-mono">${formatCurrency(calculation.expense)}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <h4 className="font-sans text-xs uppercase tracking-wide font-bold text-text-secondary mb-2">Calculation Logic</h4>
                            <pre className="font-mono text-xs whitespace-pre-wrap text-[#1e40af] bg-[#eff6ff] p-4 rounded border border-[#1e40af]/20">
                                {calculation.explanation}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
