import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FileText, Building2, Calculator, Package, CheckCircle2, AlertTriangle, Factory, Trash2 } from 'lucide-react';

export const ExamCheatSheetView = () => {
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
        <section className="min-h-screen pt-8 pb-8 px-[6vw] bg-ivory paper-grain" ref={containerRef}>
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="space-y-2 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-600 text-white mb-2 shadow-sm">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h1 className="font-display text-4xl text-ink tracking-tight mb-1">Exam Cheat Sheet</h1>
                    <p className="font-serif text-sm text-text-secondary max-w-2xl mx-auto leading-tight">
                        Quick reference for Bank Reconciliations, Accounts Receivable, Inventory methods, Depreciation, and Asset Disposals.
                    </p>
                </div>

                {/* 1. Bank Reconciliation */}
                <div className="bg-surface border border-guide rounded-paper p-4 lg:p-6 space-y-3 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.03] rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />

                    <div className="space-y-1">
                        <h2 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-blue-600" />
                            1. Bank Reconciliation
                        </h2>
                        <p className="font-sans text-xs leading-snug text-text-secondary">
                            Ensure the company's Cash account matches the Bank Statement. Both sides must reconcile to the same <strong className="text-ink">True (Adjusted) Balance</strong>. Only Book Adjustments require journal entries.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Book Side */}
                        <div className="border border-blue-200 bg-blue-50/50 rounded-paper p-4 relative">
                            <h3 className="font-sans text-xs font-bold uppercase tracking-wide text-blue-800 mb-2 flex justify-between">
                                <span>Book Balance (Ledger)</span>
                                <span>(Needs JEs)</span>
                            </h3>
                            <div className="space-y-1 font-mono text-[11px] lg:text-xs text-blue-900">
                                <div className="flex justify-between items-center border-b border-blue-200 pb-1">
                                    <span>Unadjusted Book Balance</span>
                                    <span>$X,XXX</span>
                                </div>
                                <div className="text-emerald-700">
                                    <div className="flex justify-between items-center"><span className="flex items-center gap-1">+ Bank Collections (Notes)</span></div>
                                    <div className="flex justify-between items-center"><span className="flex items-center gap-1">+ Interest Earned</span></div>
                                </div>
                                <div className="text-red-700">
                                    <div className="flex justify-between items-center"><span className="flex items-center gap-1">- Service Charges / Fees</span></div>
                                    <div className="flex justify-between items-center"><span className="flex items-center gap-1">- NSF Checks (Bounced)</span></div>
                                </div>
                                <div className="flex justify-between items-center text-blue-800">
                                    <span>± Book Errors (e.g. typos)</span>
                                </div>
                                <div className="flex justify-between items-center border-t-2 border-blue-300 pt-1 font-bold">
                                    <span>Adjusted Book Balance</span>
                                    <span>= True Bal</span>
                                </div>
                            </div>
                        </div>

                        {/* Bank Side */}
                        <div className="border border-slate-200 bg-slate-50/50 rounded-paper p-4 relative">
                            <h3 className="font-sans text-xs font-bold uppercase tracking-wide text-slate-800 mb-2 flex justify-between">
                                <span>Bank Balance (Statement)</span>
                                <span>(No JEs needed)</span>
                            </h3>
                            <div className="space-y-1 font-mono text-[11px] lg:text-xs text-slate-900">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                                    <span>Unadjusted Bank Balance</span>
                                    <span>$X,XXX</span>
                                </div>
                                <div className="text-emerald-700">
                                    <div className="flex justify-between items-center"><span className="flex items-center gap-1">+ Deposits in Transit (DIT)</span></div>
                                </div>
                                <div className="text-red-700">
                                    <div className="flex justify-between items-center"><span className="flex items-center gap-1">- Outstanding Checks</span></div>
                                </div>
                                <div className="flex justify-between items-center text-slate-800">
                                    <span>± Bank Errors</span>
                                </div>
                                <div className="flex justify-between items-center border-t-2 border-slate-300 pt-1 font-bold mt-[20px]">
                                    <span>Adjusted Bank Balance</span>
                                    <span>= True Bal</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Book Adjusting Journal Entries */}
                    <div className="mt-1 border-t border-guide pt-3">
                        <h3 className="font-sans text-[11px] font-bold uppercase tracking-wide text-ink mb-2">Required Book Adjusting Entries (Compound JEs)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-white p-2 rounded border border-guide font-mono text-[11px] shadow-sm space-y-1">
                                <p className="text-emerald-700 font-sans font-bold mb-1 pb-1 border-b border-guide/50 text-[11px]">To record items INCREASING Cash:</p>
                                <div className="flex justify-between"><span>Cash</span><span>XXX</span></div>
                                <div className="flex justify-between pl-6 text-text-secondary"><span>Notes Receivable</span><span>XXX</span></div>
                                <div className="flex justify-between pl-6 text-text-secondary"><span>Interest Revenue</span><span>XXX</span></div>
                            </div>
                            <div className="bg-white p-2 rounded border border-guide font-mono text-[11px] shadow-sm space-y-1">
                                <p className="text-red-700 font-sans font-bold mb-1 pb-1 border-b border-guide/50 text-[11px]">To record items DECREASING Cash:</p>
                                <div className="flex justify-between"><span>Accounts Receivable (NSF)</span><span>XXX</span></div>
                                <div className="flex justify-between"><span>Bank Fee Expense</span><span>XXX</span></div>
                                <div className="flex justify-between pl-6 text-text-secondary"><span>Cash</span><span>XXX</span></div>
                            </div>
                        </div>
                        <p className="text-[11px] text-text-secondary mt-2 italic flex items-start gap-1 leading-tight">
                            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>Use exact titles like "Accounts Receivable" for NSF. No abbreviations. Indent credits. List outstanding checks individually on the bank side if given. Single/split JEs will not be accepted.</span>
                        </p>
                    </div>
                </div>

                {/* 2. Accounts Receivable */}
                <div className="bg-surface border border-guide rounded-paper p-4 lg:p-6 space-y-3 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/[0.03] rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />

                    <div className="space-y-1">
                        <h2 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
                            <Calculator className="w-6 h-6 text-rose-600" />
                            2. Accounts Receivable (Bad Debts)
                        </h2>
                        <p className="font-sans text-xs leading-snug text-text-secondary">
                            Estimating uncollectible accounts using the Allowance Method. Remember: <strong className="text-ink text-xs font-mono">Net Realizable Value = A/R - Allowance for Doubtful Accounts</strong>.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Income Statement Approach */}
                        <div className="border border-rose-200 bg-rose-50/50 rounded-paper p-4">
                            <h3 className="font-sans text-xs font-bold uppercase tracking-wide text-rose-800 mb-1">
                                % of Credit Sales Method
                            </h3>
                            <p className="font-serif text-[11px] text-rose-900/70 mb-2">(Income Statement Approach)</p>
                            
                            <div className="bg-white p-2 rounded border border-rose-100 mb-2">
                                <p className="font-mono text-[11px] font-bold text-ink mb-1">Formula:</p>
                                <p className="font-mono flex items-center justify-center py-1 bg-rose-100/50 rounded text-rose-900 border border-rose-200 border-dashed text-[11px]">
                                    Exp = Net Credit Sales × % Uncollectible
                                </p>
                            </div>
                            
                            <ul className="space-y-1 font-sans text-[11px] text-text-secondary leading-tight">
                                <li className="flex gap-1 items-start">
                                    <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" /> 
                                    <span><strong>Ignores</strong> the existing balance in the Allowance account.</span>
                                </li>
                                <li className="flex gap-1 items-start">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /> 
                                    <span>Calculates the <strong className="text-ink">Bad Debt Expense</strong> directly.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Balance Sheet Approach */}
                        <div className="border border-amber-200 bg-amber-50/50 rounded-paper p-4">
                            <h3 className="font-sans text-xs font-bold uppercase tracking-wide text-amber-800 mb-1">
                                Aging of Receivables Method
                            </h3>
                            <p className="font-serif text-[11px] text-amber-900/70 mb-2">(Balance Sheet Approach)</p>
                            
                            <div className="bg-white p-2 rounded border border-amber-100 mb-2">
                                <p className="font-mono text-[11px] font-bold text-ink mb-1">Formula:</p>
                                <div className="font-mono text-[11px] bg-amber-100/50 p-1.5 rounded text-amber-900 border border-amber-200 border-dashed leading-tight">
                                    <div>1. Target Allowance = Σ (Aging Bucket × Bucket %)</div>
                                    <div className="pt-0.5 mt-0.5 border-t border-amber-200/50">2. Exp = Target Allowance - Current Unadj. Balance</div>
                                </div>
                            </div>
                            
                            <ul className="space-y-1 font-sans text-[11px] text-text-secondary leading-tight">
                                <li className="flex gap-1 items-start">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /> 
                                    <span>Calculates the <strong className="text-ink">Target Ending Balance</strong> of the Allowance account.</span>
                                </li>
                                <li className="flex gap-1 items-start">
                                    <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" /> 
                                    <span>Must subtract existing credit balance (or add debit balance) to find the expense.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* A/R Journal Entries */}
                    <div className="mt-2 border-t border-guide pt-3">
                        <h3 className="font-sans text-[11px] font-bold uppercase tracking-wide text-ink mb-2">Common A/R Journal Entries</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 font-mono text-[11px]">
                            <div className="bg-white p-2 rounded border border-guide shadow-sm space-y-1">
                                <p className="font-sans font-bold text-[10px] uppercase text-text-secondary mb-1 border-b border-guide/50 pb-0.5">1. Credit Sale</p>
                                <div className="flex justify-between"><span>Accounts Receivable</span><span>X</span></div>
                                <div className="flex justify-between pl-4 text-text-secondary"><span>Sales Revenue</span><span>X</span></div>
                            </div>
                            <div className="bg-white p-2 rounded border border-guide shadow-sm space-y-1">
                                <p className="font-sans font-bold text-[10px] uppercase text-text-secondary mb-1 border-b border-guide/50 pb-0.5">2. Bad Debt Expense</p>
                                <div className="flex justify-between"><span>Bad Debt Expense</span><span>X</span></div>
                                <div className="flex justify-between pl-4 text-text-secondary"><span>Allowance for D.A.</span><span>X</span></div>
                            </div>
                            <div className="bg-white p-2 rounded border border-guide shadow-sm space-y-1">
                                <p className="font-sans font-bold text-[10px] uppercase text-text-secondary mb-1 border-b border-guide/50 pb-0.5">3. Write-off Uncollectible</p>
                                <div className="flex justify-between"><span>Allowance for D.A.</span><span>X</span></div>
                                <div className="flex justify-between pl-4 text-text-secondary"><span>Accounts Receivable</span><span>X</span></div>
                            </div>
                            <div className="bg-white p-2 rounded border border-guide shadow-sm space-y-1">
                                <p className="font-sans font-bold text-[10px] uppercase text-text-secondary mb-1 border-b border-guide/50 pb-0.5">4. Recovery (Two JEs)</p>
                                <div className="flex justify-between"><span>Accounts Receivable</span><span>X</span></div>
                                <div className="flex justify-between pl-4 text-text-secondary mb-1 pb-0.5 border-b border-guide/30"><span>Allowance for D.A.</span><span>X</span></div>
                                <div className="flex justify-between"><span>Cash</span><span>X</span></div>
                                <div className="flex justify-between pl-4 text-text-secondary"><span>Accounts Receivable</span><span>X</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Inventory */}
                <div className="bg-surface border border-guide rounded-paper p-4 lg:p-6 space-y-3 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />

                    <div className="space-y-1">
                        <h2 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
                            <Package className="w-6 h-6 text-emerald-600" />
                            3. Inventory Valuation
                        </h2>
                        <div className="p-2 bg-emerald-50 rounded-paper border border-emerald-200 font-mono text-[11px] text-center font-bold text-emerald-900 mt-1 mb-2">
                            Beg. Inventory + Purchases = Cost of Goods Available for Sale = COGS + End. Inventory
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Perpetual vs Periodic */}
                        <div>
                            <h3 className="font-sans text-[11px] font-bold uppercase tracking-wide text-text-secondary mb-2 border-b border-guide pb-1">Tracking Systems</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-3 border border-guide rounded-paper bg-surface flex flex-col">
                                    <div className="mb-2">
                                        <strong className="text-ink block mb-0.5 text-xs">Perpetual System</strong>
                                        <p className="font-sans text-[11px] text-text-secondary leading-tight">Updates real-time. Every sale requires two JEs: one for Revenue/AR, and one to decrease Inventory and increase COGS. Uses "Inventory" account for purchases.</p>
                                    </div>
                                    <div className="mt-auto bg-white p-2 rounded border border-guide shadow-sm">
                                        <p className="font-mono text-[11px] font-bold text-ink mb-1">Formula (Continuous):</p>
                                        <div className="font-mono text-[11px] p-1.5 rounded bg-surface border border-guide border-dashed text-text-secondary">
                                            <div>Beg. Inv + Purchases = COGAS</div>
                                            <div className="pt-0.5 mt-0.5 border-t border-guide/50">COGAS - COGS (per sale) = <strong className="text-ink">End. Inv</strong></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 border border-guide rounded-paper bg-surface flex flex-col">
                                    <div className="mb-2 space-y-1.5">
                                        <strong className="text-ink block mb-0.5 text-xs">Periodic System</strong>
                                        <p className="font-sans text-[11px] text-text-secondary leading-tight">Updates at period end. No COGS recorded at time of sale. Uses "Purchases" temporary account.</p>
                                        <div className="p-1.5 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] leading-tight">
                                            <strong className="text-red-700 block mb-0.5 uppercase tracking-wide text-[10px]">Critical Exam Rule:</strong>
                                            You must calculate <strong>Ending Inventory FIRST</strong>, then deduct it from COGAS to find COGS.
                                        </div>
                                    </div>
                                    <div className="mt-auto bg-white p-2 rounded border border-guide shadow-sm">
                                        <p className="font-mono text-[11px] font-bold text-ink mb-1">Formula (End of Period):</p>
                                        <div className="font-mono text-[11px] p-1.5 rounded bg-surface border border-guide border-dashed text-text-secondary">
                                            <div>Beg. Inv + Net Purchases = COGAS</div>
                                            <div className="pt-0.5 mt-0.5 border-t border-guide/50">COGAS - End. Inv (calc'd) = <strong className="text-ink">COGS</strong></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cost Flow Methods */}
                        <div>
                            <h3 className="font-sans text-[11px] font-bold uppercase tracking-wide text-text-secondary mb-2 border-b border-guide pb-1">Cost Flow Assumptions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {/* FIFO */}
                                <div className="border-t-2 border-t-emerald-500 bg-white border border-guide rounded-paper p-3 shadow-sm">
                                    <h4 className="font-serif font-bold text-sm text-ink mb-1">FIFO</h4>
                                    <p className="font-sans text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">First-In, First-Out</p>
                                    <ul className="space-y-1 font-sans text-[11px] text-text-secondary leading-tight">
                                        <li>• Oldest units sold first.</li>
                                        <li>• Ending Inventory = newest costs.</li>
                                        <li>• <strong>Inflation:</strong> Highest Net Income.</li>
                                        <li className="pt-1 mt-1 border-t border-guide italic text-[10px]">Note: Yields IDENTICAL results in both Perpetual and Periodic.</li>
                                    </ul>
                                </div>

                                {/* LIFO */}
                                <div className="border-t-2 border-t-rose-500 bg-white border border-guide rounded-paper p-3 shadow-sm">
                                    <h4 className="font-serif font-bold text-sm text-ink mb-1">LIFO</h4>
                                    <p className="font-sans text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Last-In, First-Out</p>
                                    <ul className="space-y-1 font-sans text-[11px] text-text-secondary leading-tight">
                                        <li>• Newest units sold first.</li>
                                        <li>• Ending Inventory = oldest costs.</li>
                                        <li>• <strong>Inflation:</strong> Lowest Net Income, lowest taxes.</li>
                                        <li className="pt-1 mt-1 border-t border-guide italic text-[10px]">Note: Results DIFFER between Perpetual and Periodic.</li>
                                    </ul>
                                </div>

                                {/* Average */}
                                <div className="border-t-2 border-t-blue-500 bg-white border border-guide rounded-paper p-3 shadow-sm">
                                    <h4 className="font-serif font-bold text-sm text-ink mb-1">Average Cost</h4>
                                    <p className="font-sans text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Smoothed Costs</p>
                                    <ul className="space-y-1 font-sans text-[11px] text-text-secondary leading-tight">
                                        <li>• <strong className="text-ink">Periodic:</strong> Tot. Cost / Tot. Units calculated ONCE at period end.</li>
                                        <li>• <strong className="text-ink">Perpetual:</strong> New average calculated after EVERY purchase.</li>
                                        <li className="pt-1 mt-1 border-t border-guide italic text-[10px]">Note: Balances out price volatility.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 4. Plant Assets & Depreciation */}
                <div className="bg-surface border border-guide rounded-paper p-4 lg:p-6 space-y-3 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/[0.03] rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />

                    <div className="space-y-1">
                        <h2 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
                            <Factory className="w-6 h-6 text-purple-600" />
                            4. Plant Assets & Depreciation
                        </h2>
                        <p className="font-sans text-xs leading-snug text-text-secondary">
                            Capitalize: Price, Taxes, Freight, Installation, Testing. Exclude: Interest after ready, Damage repairs, Advertising.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                        {/* Straight-Line */}
                        <div className="border border-purple-200 bg-purple-50/50 rounded-paper p-3">
                            <h3 className="font-sans text-[11px] font-bold uppercase tracking-wide text-purple-800 mb-1.5 border-b border-purple-200 pb-1">Straight-Line</h3>
                            <div className="bg-white p-1.5 rounded border border-purple-100 mb-2 text-center">
                                <p className="font-mono text-[11px] text-purple-900">(Cost − Residual) / Useful Life</p>
                            </div>
                            <ul className="space-y-1 font-sans text-[11px] text-text-secondary leading-tight">
                                <li>• Same expense every year</li>
                                <li>• Uses residual value in calc</li>
                                <li>• Best for buildings, stable assets</li>
                                <li className="pt-1 mt-1 border-t border-purple-200/50 text-purple-700"><strong>Half-Year:</strong> ×0.5 for first AND last year</li>
                            </ul>
                        </div>

                        {/* Double-Declining */}
                        <div className="border border-indigo-200 bg-indigo-50/50 rounded-paper p-3">
                            <h3 className="font-sans text-[11px] font-bold uppercase tracking-wide text-indigo-800 mb-1.5 border-b border-indigo-200 pb-1">Double-Declining (DDB)</h3>
                            <div className="bg-white p-1.5 rounded border border-indigo-100 mb-2 text-center">
                                <p className="font-mono text-[11px] text-indigo-900">(1/Life) × 2 × Beg.Book Value</p>
                            </div>
                            <ul className="space-y-1 font-sans text-[11px] text-text-secondary leading-tight">
                                <li className="text-red-600 font-semibold">• IGNORE Residual in calculation!</li>
                                <li>• Highest early expense</li>
                                <li>• Best for tech, vehicles</li>
                                <li className="pt-1 mt-1 border-t border-indigo-200/50 text-indigo-700"><strong>Half-Year:</strong> ×0.5 for Year 1 AND disposal year</li>
                            </ul>
                        </div>

                        {/* Units-of-Output */}
                        <div className="border border-fuchsia-200 bg-fuchsia-50/50 rounded-paper p-3">
                            <h3 className="font-sans text-[11px] font-bold uppercase tracking-wide text-fuchsia-800 mb-1.5 border-b border-fuchsia-200 pb-1">Units-of-Output</h3>
                            <div className="bg-white p-1.5 rounded border border-fuchsia-100 mb-2 space-y-0.5 text-center font-mono text-[10px]">
                                <div>$/Unit = (Cost−Residual)/Total Units</div>
                                <div className="border-t border-fuchsia-100 pt-0.5">Exp = $/Unit × Units Used</div>
                            </div>
                            <ul className="space-y-1 font-sans text-[11px] text-text-secondary leading-tight">
                                <li>• Varies by actual use</li>
                                <li>• Uses residual value in calc</li>
                                <li>• Best for production equipment</li>
                            </ul>
                        </div>
                    </div>

                    {/* Partial Year Depreciation */}
                    <div className="bg-surface border border-guide p-2.5 rounded-paper shadow-sm">
                         <h3 className="font-sans text-[11px] font-bold uppercase tracking-wide text-ink mb-1">Partial Year Depreciation</h3>
                         <div className="flex flex-col md:flex-row gap-2 font-sans text-[11px] text-text-secondary leading-tight">
                             <div className="flex-1"><strong className="text-ink">Months Method:</strong> Annual Depr × (Months Used / 12)</div>
                             <div className="flex-1"><strong className="text-ink">Half-Year Convention:</strong> Record ½ year depr. in purchase AND disposal year</div>
                         </div>
                    </div>
                </div>

                {/* 5. Disposal of Plant Assets */}
                <div className="bg-surface border border-guide rounded-paper p-4 lg:p-6 space-y-3 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/[0.03] rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />

                    <div className="space-y-1">
                        <h2 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
                            <Trash2 className="w-6 h-6 text-orange-600" />
                            5. Disposal of Plant Assets
                        </h2>
                        <div className="flex flex-col md:flex-row gap-2 font-mono text-[11px] text-center">
                            <div className="flex-1 p-1.5 bg-orange-50 rounded border border-orange-200 text-orange-900">
                                <strong>Book Value</strong> = Cost − Accum.Depreciation
                            </div>
                            <div className="flex-1 p-1.5 bg-orange-50 rounded border border-orange-200 text-orange-900">
                                <strong>Gain/Loss</strong> = Cash Received − Book Value
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="border border-emerald-200 bg-emerald-50/50 rounded-paper p-3">
                            <h3 className="font-sans text-[11px] font-bold uppercase tracking-wide text-emerald-800 mb-1.5 border-b border-emerald-200 pb-1">Gain (Cash &gt; Book Value)</h3>
                            <div className="bg-white p-2 rounded border border-emerald-100 shadow-sm font-mono text-[11px] space-y-0.5">
                                <div className="flex justify-between"><span>Dr. Cash (received)</span><span>X</span></div>
                                <div className="flex justify-between"><span>Dr. Accum.Depreciation (total)</span><span>X</span></div>
                                <div className="flex justify-between pl-4 text-text-secondary"><span>Cr. Equipment (cost)</span><span>X</span></div>
                                <div className="flex justify-between pl-4 text-text-secondary"><span>Cr. Gain on Sale</span><span>X</span></div>
                            </div>
                        </div>
                        <div className="border border-red-200 bg-red-50/50 rounded-paper p-3">
                            <h3 className="font-sans text-[11px] font-bold uppercase tracking-wide text-red-800 mb-1.5 border-b border-red-200 pb-1">Loss (Cash &lt; Book Value)</h3>
                            <div className="bg-white p-2 rounded border border-red-100 shadow-sm font-mono text-[11px] space-y-0.5">
                                <div className="flex justify-between"><span>Dr. Cash (received)</span><span>X</span></div>
                                <div className="flex justify-between"><span>Dr. Accum.Depreciation (total)</span><span>X</span></div>
                                <div className="flex justify-between"><span>Dr. Loss on Sale</span><span>X</span></div>
                                <div className="flex justify-between pl-4 text-text-secondary"><span>Cr. Equipment (cost)</span><span>X</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Special cases and checklist */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-2 border-t border-guide">
                        <div className="lg:col-span-2 space-y-2">
                             <h3 className="font-sans text-[11px] font-bold uppercase tracking-wide text-ink">Special Disposal Cases</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="bg-surface border border-guide rounded p-2.5 font-sans text-[11px] leading-tight">
                                    <strong className="text-ink block mb-0.5">Fully Depreciated / Scrapped</strong>
                                    <p className="text-text-secondary mb-1.5">No gain or loss if fully depreciated. If scraped with value remaining, Loss = Book Value.</p>
                                    <div className="font-mono bg-white p-1 border border-guide rounded text-[10px]">
                                        <div className="flex justify-between"><span>Dr. Accum.Depr. (full)</span></div>
                                        <div className="flex justify-between pl-4 text-text-secondary"><span>Cr. Asset (full cost)</span></div>
                                    </div>
                                </div>
                                <div className="bg-surface border border-guide rounded p-2.5 font-sans text-[11px] leading-tight">
                                    <strong className="text-ink block mb-0.5">Trade-in (Exchange)</strong>
                                    <p className="text-text-secondary"><strong>Commercial Substance:</strong> Record new asset at fair value, recognize gain/loss.<br/><strong>Without:</strong> Record at book value of old + cash paid. No gain recognized.</p>
                                </div>
                             </div>
                        </div>
                        <div>
                             <h3 className="font-sans text-[11px] font-bold uppercase tracking-wide text-ink mb-2">Disposal Checklist</h3>
                             <ul className="space-y-1 font-sans text-[11px] text-text-secondary leading-tight">
                                 <li className="flex gap-1.5 items-start"><CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /> 1. Update depr. to date</li>
                                 <li className="flex gap-1.5 items-start"><CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /> 2. Calculate Book Value</li>
                                 <li className="flex gap-1.5 items-start"><CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /> 3. Compare Cash to BV</li>
                                 <li className="flex gap-1.5 items-start"><CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /> 4. Record JE (Gain OR Loss)</li>
                                 <li className="flex gap-1.5 items-start"><CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /> 5. Verify: Debits = Credits</li>
                             </ul>
                        </div>
                    </div>
                </div>

                {/* Key Exam Reminders */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-paper shadow-sm">
                    <h3 className="font-serif text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Key Exam Reminders
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 font-sans text-[11px] text-amber-800 leading-tight">
                        <ul className="space-y-1 list-disc list-inside">
                            <li><strong>Bank Rec:</strong> Only book side needs JEs</li>
                            <li><strong>Bad Debts:</strong> %Sales ignores ADA; Aging uses it</li>
                            <li><strong>Inventory:</strong> ALWAYS calc End.Inv first</li>
                        </ul>
                        <ul className="space-y-1 list-disc list-inside">
                            <li><strong>Depreciation:</strong> DDB ignores residual value</li>
                            <li><strong>Disposal:</strong> Update depr. first! Gain OR Loss</li>
                            <li><strong>General:</strong> Use exact account titles</li>
                        </ul>
                    </div>
                </div>

            </div>
        </section>
    );
};
