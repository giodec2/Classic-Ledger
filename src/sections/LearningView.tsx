import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { BookOpen, CheckCircle2, FileText, Scale, TrendingUp, LayoutGrid, CalendarClock, Landmark } from 'lucide-react';
import { useLedgerContext } from '@/hooks/LedgerContext';

const TableRow = ({ label, debit, credit, isTotal = false }: { label: string, debit?: string, credit?: string, isTotal?: boolean }) => (
    <div className={`grid grid-cols-3 gap-4 border-b border-guide py-2 px-4 ${isTotal ? 'font-serif font-bold text-ink bg-guide/10 border-t-2 border-t-ink/30 border-b-2 border-b-ink/30 mt-2' : 'font-sans text-text-secondary hover:bg-surface transition-colors'}`}>
        <div className="col-span-1">{label}</div>
        <div className="col-span-1 text-right font-mono text-sm">{debit || '-'}</div>
        <div className="col-span-1 text-right font-mono text-sm">{credit || '-'}</div>
    </div>
);

export const LearningView = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { } = useLedgerContext();

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
            <div className="max-w-4xl mx-auto space-y-16">

                {/* Header */}
                <div className="space-y-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ink text-ivory mb-4">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h1 className="font-display text-display-lg text-ink tracking-tight">Financial Accounting 101</h1>
                    <p className="font-serif text-body text-text-secondary max-w-2xl mx-auto">
                        A straightforward guide to the principles of double-entry bookkeeping and how to use Classic Ledger.
                    </p>
                </div>

                {/* 1. Double-Entry Bookkeeping & The Golden Rule */}
                <div className="bg-surface border border-guide rounded-paper p-8 lg:p-12 space-y-8 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-ink/[0.03] rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />

                    <div className="space-y-4">
                        <h2 className="font-serif text-display text-ink flex items-center gap-3">
                            <span className="w-8 h-8 rounded bg-ink/10 text-ink flex items-center justify-center font-sans text-sm font-bold">1</span>
                            The Golden Rule
                        </h2>
                        <p className="font-sans text-body-long leading-relaxed text-text-secondary">
                            At the heart of accounting is <strong className="text-ink font-semibold">Double-Entry Bookkeeping</strong>. Every financial transaction affects at least two accounts. To keep the books balanced, the total amount entered as Debits must always equal the total amount entered as Credits.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-[#1e40af]/20 bg-[#eff6ff] rounded-paper p-6 relative">
                            <div className="absolute top-0 right-0 p-3 opacity-20"><TrendingUp className="w-12 h-12 text-[#1e40af]" /></div>
                            <h3 className="font-sans text-label uppercase tracking-wide text-[#1e40af] mb-4">Debits (Dr)</h3>
                            <p className="font-serif text-sm text-[#1e3a8a] mb-2">Used to record:</p>
                            <ul className="space-y-2 font-sans text-sm text-[#1e40af]/80">
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#3ba55c]" /> <span><strong>Increase</strong> in Assets (Cash, Equipment)</span></li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#3ba55c]" /> <span><strong>Increase</strong> in Expenses (Rent, Utilities)</span></li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#d94838]" /> <span><strong>Decrease</strong> in Liabilities or Equity</span></li>
                            </ul>
                        </div>

                        <div className="border border-[#b91c1c]/20 bg-[#fef2f2] rounded-paper p-6 relative">
                            <div className="absolute top-0 right-0 p-3 opacity-20"><TrendingUp className="w-12 h-12 text-[#b91c1c] scale-y-[-1]" /></div>
                            <h3 className="font-sans text-label uppercase tracking-wide text-[#b91c1c] mb-4">Credits (Cr)</h3>
                            <p className="font-serif text-sm text-[#7f1d1d] mb-2">Used to record:</p>
                            <ul className="space-y-2 font-sans text-sm text-[#b91c1c]/80">
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#3ba55c]" /> <span><strong>Increase</strong> in Liabilities (Loans, Payables)</span></li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#3ba55c]" /> <span><strong>Increase</strong> in Equity & Revenue</span></li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#d94838]" /> <span><strong>Decrease</strong> in Assets (Spending Cash)</span></li>
                            </ul>
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-paper border border-amber-200">
                        <p className="font-sans text-sm text-amber-800 text-center uppercase tracking-wide">
                            Assets = Liabilities + Equity
                        </p>
                    </div>
                </div>

                {/* 2. Journal Entries */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="font-serif text-display text-ink flex items-center gap-3">
                            <FileText className="w-6 h-6 text-muted" />
                            Journal Entries
                        </h2>
                        <p className="font-sans text-body-long leading-relaxed text-text-secondary">
                            A journal is a chronological record of all transactions. When you make a sale or pay a bill, you record it here first. Let's look at an example: <span className="italic">"You start a business by investing $10,000 cash."</span>
                        </p>
                    </div>

                    <div className="bg-white border text-sm border-guide rounded-paper overflow-hidden shadow-sm">
                        <div className="grid grid-cols-3 gap-4 border-b border-ink/20 py-3 px-4 bg-surface font-sans uppercase tracking-wide text-xs text-ink font-semibold">
                            <div className="col-span-1">Account</div>
                            <div className="col-span-1 text-right">Debit</div>
                            <div className="col-span-1 text-right">Credit</div>
                        </div>
                        <TableRow label="Cash (Asset increases)" debit="$10,000" />
                        <TableRow label="Owner's Equity (Equity increases)" credit="$10,000" />
                        <TableRow label="Totals" debit="$10,000" credit="$10,000" isTotal />
                    </div>
                </div>

                {/* 3. T-Accounts */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="font-serif text-display text-ink flex items-center gap-3">
                            <LayoutGrid className="w-6 h-6 text-muted" />
                            T-Accounts (The Ledger)
                        </h2>
                        <p className="font-sans text-body-long leading-relaxed text-text-secondary">
                            While the Journal records transactions chronologically, the Ledger groups them by account name using a "T" shape. Debits are always on the left, and Credits are always on the right. This helps you quickly see the total balance of a specific account like "Cash".
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <div className="w-64 border-t-[3px] border-ink pt-2 relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[2px] w-[3px] h-32 bg-ink" />
                            <div className="text-center font-serif text-lg text-ink font-bold -mt-10 mb-6 bg-ivory px-2 inline-block relative left-1/2 -translate-x-1/2">Cash Account</div>

                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="text-right pr-4 text-sm font-mono text-[#1e40af] border-r border-transparent">
                                    $10,000<br />
                                    $500
                                </div>
                                <div className="text-left pl-4 text-sm font-mono text-[#b91c1c]">
                                    $2,000<br />
                                    $100
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2 border-t border-guide pt-1">
                                <div className="text-right pr-4 font-mono font-bold text-ink border-r border-transparent">
                                    Total: $8,400
                                </div>
                                <div />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Summarizing Views */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-guide">

                    <div className="p-6 bg-surface border border-guide rounded-paper hover:border-ink/50 transition-colors">
                        <Scale className="w-6 h-6 text-ink mb-3" />
                        <h3 className="font-serif text-heading text-ink mb-2">Trial Balance</h3>
                        <p className="font-sans text-sm text-text-secondary">
                            A list of all your accounts and their final balances at a specific point in time. It is used to quickly "prove" that your total debits equal your total credits before preparing official statements.
                        </p>
                    </div>

                    <div className="p-6 bg-surface border border-guide rounded-paper hover:border-ink/50 transition-colors">
                        <CalendarClock className="w-6 h-6 text-ink mb-3" />
                        <h3 className="font-serif text-heading text-ink mb-2">Running Balance</h3>
                        <p className="font-sans text-sm text-text-secondary">
                            Useful for tracking long-term assets or liabilities (like loans or depreciation) over months or years, showing how much balance remains after each period.
                        </p>
                    </div>

                    <div className="p-6 bg-surface border border-guide rounded-paper hover:border-ink/50 transition-colors">
                        <Landmark className="w-6 h-6 text-ink mb-3" />
                        <h3 className="font-serif text-heading text-ink mb-2">Balance Sheet</h3>
                        <p className="font-sans text-sm text-text-secondary">
                            A snapshot of your financial position. It lists exactly what you own (Assets), what you owe (Liabilities), and what is left over for the owners (Equity).
                        </p>
                    </div>

                    <div className="p-6 bg-surface border border-guide rounded-paper hover:border-ink/50 transition-colors">
                        <TrendingUp className="w-6 h-6 text-ink mb-3" />
                        <h3 className="font-serif text-heading text-ink mb-2">Income Statement</h3>
                        <p className="font-sans text-sm text-text-secondary">
                            Shows how profitable the business was over a period of time. It simply takes your Total Revenues and subtracts your Total Expenses to calculate your Net Income (profit or loss).
                        </p>
                    </div>

                </div>

            </div>
        </section>
    );
};
