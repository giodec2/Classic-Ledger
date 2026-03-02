import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Calculator, CheckCircle2, TrendingUp, Landmark, ArrowRight, Layers, FileSpreadsheet } from 'lucide-react';

const TableRow = ({ account, debit, credit, isHighlight = false, isTotal = false }: { account: string, debit: string, credit: string, isHighlight?: boolean, isTotal?: boolean }) => (
    <div className={`grid grid-cols-3 gap-4 border-b border-guide py-2 px-4 text-sm 
    ${isTotal ? 'font-serif font-bold text-ink bg-guide/10 border-y-2 border-y-ink/30 mt-2' : 'font-sans hover:bg-surface transition-colors'} 
    ${isHighlight ? 'text-red-600 font-medium bg-red-50/20' : 'text-text-secondary'}
  `}>
        <div className="col-span-1 truncate">{account}</div>
        <div className="col-span-1 text-right font-mono">{debit || '-'}</div>
        <div className="col-span-1 text-right font-mono">{credit || '-'}</div>
    </div>
);

const MiniJournalEntry = ({ date, debitAcc, debitAmt, creditAcc, creditAmt }: { date: string, debitAcc: string, debitAmt: string, creditAcc: string, creditAmt: string }) => (
    <div className="text-sm font-sans mb-3 border-l-2 border-guide pl-4 py-1 hover:border-ink/50 transition-colors">
        <div className="text-muted text-xs mb-1">{date}</div>
        <div className="flex justify-between items-center"><span className="text-ink">{debitAcc}</span><span className="font-mono">{debitAmt}</span></div>
        <div className="flex justify-between items-center ml-4"><span className="text-text-secondary">{creditAcc}</span><span className="font-mono">{creditAmt}</span></div>
    </div>
);

const CalcCard = ({ icon: Icon, title, accounts, formula, steps, result, colorClass }: any) => (
    <div className="bg-white border border-guide rounded-paper shadow-sm overflow-hidden mb-6 group hover:border-ink/30 transition-colors">
        <div className={`px-6 py-4 border-b border-guide flex items-center gap-3 ${colorClass} bg-opacity-10`}>
            <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-').replace('-50', '-600')}`} />
            <h3 className="font-serif text-heading text-ink">{title}</h3>
        </div>
        <div className="p-6">
            <div className="font-mono text-xs text-text-secondary uppercase tracking-wider mb-2">Accounts to consider:</div>
            <div className="flex flex-wrap gap-2 mb-6">
                {accounts.map((acc: string) => (
                    <span key={acc} className="px-2.5 py-1 bg-surface border border-guide rounded-md text-sm text-ink">{acc}</span>
                ))}
            </div>

            <div className="mb-4">
                <span className="font-mono text-xs text-text-secondary uppercase tracking-wider block mb-2">Formula:</span>
                <div className="font-serif text-lg text-ink bg-surface p-3 rounded-md border border-guide/50">{formula}</div>
            </div>

            <div className="space-y-1 mb-6 font-mono text-sm text-text-secondary bg-surface p-4 rounded-md border border-guide/30">
                {steps.map((step: string, i: number) => <div key={i}>{step}</div>)}
            </div>

            <div className="flex items-center justify-between border-t border-guide pt-4">
                <span className="font-sans font-bold uppercase tracking-wide text-ink text-sm">Final Result:</span>
                <span className="font-mono font-bold text-xl text-ink bg-amber-50 px-3 py-1 rounded border border-amber-200">{result}</span>
            </div>
        </div>
    </div>
);

export const FinalAdjustmentsLearningView = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(containerRef.current?.children || [],
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
            );
        });

        return () => ctx.revert();
    }, []);

    return (
        <section className="min-h-screen pt-24 pb-24 px-[6vw] bg-ivory paper-grain" ref={containerRef}>
            <div className="max-w-5xl mx-auto space-y-16">

                {/* Header */}
                <div className="space-y-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ink text-ivory mb-4">
                        <Calculator className="w-8 h-8" />
                    </div>
                    <h1 className="font-display text-display-lg text-ink tracking-tight">The Accounting Cycle Completion</h1>
                    <p className="font-serif text-body text-text-secondary max-w-3xl mx-auto">
                        From an unadjusted trial balance, to applying month-end adjustments, down to calculating the final Net Income, new Retained Earnings, and Balance Sheet totals. Here is a complete end-to-end example.
                    </p>
                </div>

                {/* Phase 1 & 2: Initial and Adjustments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="font-serif text-display text-ink flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-ink/10 text-ink flex items-center justify-center font-sans text-xs font-bold">1</span>
                                Unadjusted Trial Balance
                            </h2>
                            <p className="font-sans text-sm text-text-secondary">Before December adjustments are made.</p>
                        </div>

                        <div className="bg-white border border-guide rounded-paper overflow-hidden shadow-sm">
                            <div className="grid grid-cols-3 gap-4 border-b border-ink/20 py-2 px-4 bg-surface font-sans uppercase tracking-wide text-[10px] text-ink font-semibold">
                                <div className="col-span-1">Account</div>
                                <div className="col-span-1 text-right">Debit</div>
                                <div className="col-span-1 text-right">Credit</div>
                            </div>
                            <TableRow account="Cash" debit="12,000" credit="" />
                            <TableRow account="Accounts Receivable" debit="4,000" credit="" />
                            <TableRow account="Prepaid Insurance" debit="2,400" credit="" />
                            <TableRow account="Equipment" debit="30,000" credit="" />
                            <TableRow account="Accumulated Depr." debit="" credit="10,000" />
                            <TableRow account="Accounts Payable" debit="" credit="3,000" />
                            <TableRow account="Unearned Revenue" debit="" credit="5,000" />
                            <TableRow account="Common Stock" debit="" credit="15,000" />
                            <TableRow account="Retained Earnings" debit="" credit="8,000" />
                            <TableRow account="Dividends" debit="2,000" credit="" />
                            <TableRow account="Service Revenue" debit="" credit="40,000" />
                            <TableRow account="Salaries Expense" debit="25,000" credit="" />
                            <TableRow account="Rent Expense" debit="5,600" credit="" />
                            <TableRow account="Totals" debit="81,000" credit="81,000" isTotal />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="font-serif text-display text-ink flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-ink/10 text-ink flex items-center justify-center font-sans text-xs font-bold">2</span>
                                Adjusting Operations
                            </h2>
                            <p className="font-sans text-sm text-text-secondary">Journal entries recorded at the end of December.</p>
                        </div>

                        <div className="bg-white border border-guide rounded-paper p-5 shadow-sm space-y-4">
                            <div>
                                <p className="text-xs text-text-secondary mb-2 uppercase tracking-wide">A) Insurance expired during month: $200</p>
                                <MiniJournalEntry date="Dec 31" debitAcc="Insurance Expense" debitAmt="200" creditAcc="Prepaid Insurance" creditAmt="200" />
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary mb-2 uppercase tracking-wide">B) Depreciation on equipment: $500</p>
                                <MiniJournalEntry date="Dec 31" debitAcc="Depreciation Expense" debitAmt="500" creditAcc="Accumulated Depr." creditAmt="500" />
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary mb-2 uppercase tracking-wide">C) Unearned revenue now earned: $1,000</p>
                                <MiniJournalEntry date="Dec 31" debitAcc="Unearned Revenue" debitAmt="1,000" creditAcc="Service Revenue" creditAmt="1,000" />
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary mb-2 uppercase tracking-wide">D) Accrued salaries unpaid: $800</p>
                                <MiniJournalEntry date="Dec 31" debitAcc="Salaries Expense" debitAmt="800" creditAcc="Salaries Payable" creditAmt="800" />
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary mb-2 uppercase tracking-wide">E) Services provided, not billed: $1,500</p>
                                <MiniJournalEntry date="Dec 31" debitAcc="Accounts Receivable" debitAmt="1,500" creditAcc="Service Revenue" creditAmt="1,500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center -my-2 opacity-50">
                    <ArrowRight className="w-8 h-8 text-ink rotate-90" />
                </div>

                {/* Phase 3: Adjusted Trial Balance */}
                <div className="bg-surface border border-guide rounded-paper p-8 shadow-sm">
                    <div className="space-y-2 mb-6 text-center max-w-2xl mx-auto">
                        <h2 className="font-serif text-display text-ink flex items-center justify-center gap-2">
                            <span className="w-6 h-6 rounded bg-ink/10 text-ink flex items-center justify-center font-sans text-xs font-bold">3</span>
                            Adjusted Trial Balance
                        </h2>
                        <p className="font-sans text-sm text-text-secondary">
                            We apply the debits and credits from step 2 to the unadjusted balances in step 1. Changed accounts are highlighted in <strong className="text-red-500">red</strong>.
                        </p>
                    </div>

                    <div className="bg-white border border-guide rounded-paper overflow-hidden shadow-sm max-w-3xl mx-auto">
                        <div className="grid grid-cols-3 gap-4 border-b border-ink/20 py-2 px-4 bg-surface font-sans uppercase tracking-wide text-[10px] text-ink font-semibold">
                            <div className="col-span-1">Account</div>
                            <div className="col-span-1 text-right">Debit</div>
                            <div className="col-span-1 text-right">Credit</div>
                        </div>
                        <TableRow account="Cash" debit="12,000" credit="" />
                        <TableRow account="Accounts Receivable" debit="5,500" credit="" isHighlight />
                        <TableRow account="Prepaid Insurance" debit="2,200" credit="" isHighlight />
                        <TableRow account="Equipment" debit="30,000" credit="" />
                        <TableRow account="Accumulated Depr." debit="" credit="10,500" isHighlight />
                        <TableRow account="Accounts Payable" debit="" credit="3,000" />
                        <TableRow account="Salaries Payable" debit="" credit="800" isHighlight />
                        <TableRow account="Unearned Revenue" debit="" credit="4,000" isHighlight />
                        <TableRow account="Common Stock" debit="" credit="15,000" />
                        <TableRow account="Retained Earnings" debit="" credit="8,000" />
                        <TableRow account="Dividends" debit="2,000" credit="" />
                        <TableRow account="Service Revenue" debit="" credit="42,500" isHighlight />
                        <TableRow account="Salaries Expense" debit="25,800" credit="" isHighlight />
                        <TableRow account="Rent Expense" debit="5,600" credit="" />
                        <TableRow account="Insurance Expense" debit="200" credit="" isHighlight />
                        <TableRow account="Depreciation Expense" debit="500" credit="" isHighlight />
                        <TableRow account="Totals" debit="83,800" credit="83,800" isTotal />
                    </div>
                </div>

                {/* Phase 4: Statement Calculations */}
                <div className="space-y-6">
                    <div className="space-y-2 mb-8 text-center max-w-2xl mx-auto">
                        <h2 className="font-serif text-display text-ink flex items-center justify-center gap-2">
                            <span className="w-6 h-6 rounded bg-ink/10 text-ink flex items-center justify-center font-sans text-xs font-bold">4</span>
                            Final Calculations
                        </h2>
                        <p className="font-sans text-body text-text-secondary">
                            Now that we have the <strong>Adjusted Trial Balance</strong>, we can mathematically calculate our financial statements in order: Income Statement (Net Income) {'->'} Statement of Retained Earnings {'->'} Balance Sheet.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CalcCard
                            icon={TrendingUp}
                            colorClass="bg-blue-50"
                            title="1. Net Income"
                            accounts={['Service Revenue', 'All Expenses']}
                            formula="Net Income = Total Revenues - Total Expenses"
                            steps={[
                                '+ Revenues: 42,500',
                                '- Salaries Exp: 25,800',
                                '- Rent Exp: 5,600',
                                '- Insurance Exp: 200',
                                '- Depr. Exp: 500',
                                '= Total Expenses: 32,100'
                            ]}
                            result="$10,400"
                        />

                        <CalcCard
                            icon={FileSpreadsheet}
                            colorClass="bg-purple-50"
                            title="2. Ending Retained Earnings"
                            accounts={['Retained Earnings (Beg.)', 'Net Income', 'Dividends']}
                            formula="End R.E. = Beg R.E. + Net Income - Dividends"
                            steps={[
                                '+ Beginning R.E.: 8,000',
                                '+ Net Income (from step 1): 10,400',
                                '- Dividends: 2,000'
                            ]}
                            result="$16,400"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <CalcCard
                                icon={Landmark}
                                colorClass="bg-emerald-50"
                                title="3a. Total Assets (Balance Sheet)"
                                accounts={['Cash', 'A/R', 'Prepaid Ins.', 'Equipment', 'Accum. Depr.']}
                                formula="Assets = Current Assets + (Long Term Assets - Accum. Depr)"
                                steps={[
                                    '+ Cash: 12,000',
                                    '+ A/R: 5,500',
                                    '+ Prepaid Ins: 2,200',
                                    '= Total Current Assets: 19,700',
                                    ' ',
                                    '+ Equipment: 30,000',
                                    '- Accum. Depr (Contra-Asset): 10,500',
                                    '= Net Equipment: 19,500',
                                    ' ',
                                    '= 19,700 + 19,500'
                                ]}
                                result="$39,200"
                            />
                        </div>

                        <div className="space-y-6">
                            <CalcCard
                                icon={Layers}
                                colorClass="bg-red-50"
                                title="3b. Total Liabilities"
                                accounts={['Accounts Payable', 'Salaries Payable', 'Unearned Revenue']}
                                formula="Liabilities = Sum of all debt/payable accounts"
                                steps={[
                                    '+ Accounts Payable: 3,000',
                                    '+ Salaries Payable: 800',
                                    '+ Unearned Revenue: 4,000'
                                ]}
                                result="$7,800"
                            />

                            <CalcCard
                                icon={Layers}
                                colorClass="bg-orange-50"
                                title="3c. Total Equity"
                                accounts={['Common Stock', 'Ending Retained Earnings']}
                                formula="Equity = Common Stock + End R.E."
                                steps={[
                                    '+ Common Stock: 15,000',
                                    '+ Ending R.E. (from step 2): 16,400'
                                ]}
                                result="$31,400"
                            />
                        </div>
                    </div>

                    {/* Validation Check */}
                    <div className="mt-8 bg-surface border border-guide rounded-paper p-6 flex flex-col items-center text-center">
                        <h3 className="font-serif text-heading text-ink mb-2">The Accounting Equation Check</h3>
                        <p className="font-sans text-sm text-text-secondary mb-4">Does it all balance in the end?</p>

                        <div className="flex items-center gap-4 text-xl md:text-2xl font-serif">
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-4 py-2 rounded">Assets: $39,200</span>
                            <span className="text-muted">=</span>
                            <span className="text-red-700 font-bold bg-red-50 px-4 py-2 rounded">Liab: $7,800</span>
                            <span className="text-muted">+</span>
                            <span className="text-orange-700 font-bold bg-orange-50 px-4 py-2 rounded">Equity: $31,400</span>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-full font-bold text-sm tracking-wide shadow-sm border border-green-200">
                            <CheckCircle2 className="w-5 h-5" />
                            BALANCED: $39,200 = $39,200
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
};
