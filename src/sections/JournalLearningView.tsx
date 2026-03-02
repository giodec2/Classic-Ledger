import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CheckCircle2, FileText, Scale, ArrowRight, ArrowUpCircle } from 'lucide-react';

const JournalEntryDemo = ({
    title,
    description,
    debitAccount,
    debitAmount,
    creditAccount,
    creditAmount,
    explanation
}: {
    title: string,
    description: string,
    debitAccount: string,
    debitAmount: string,
    creditAccount: string,
    creditAmount: string,
    explanation: React.ReactNode
}) => (
    <div className="bg-white border border-guide rounded-paper shadow-sm overflow-hidden mb-8 group hover:border-ink/30 transition-colors">
        <div className="bg-surface px-6 py-4 border-b border-guide flex justify-between items-center">
            <h3 className="font-serif text-heading text-ink">{title}</h3>
            <span className="font-sans text-xs uppercase tracking-wider text-text-secondary bg-white px-3 py-1 rounded-full border border-guide">Example</span>
        </div>
        <div className="p-6">
            <p className="font-sans text-body text-text-secondary mb-6">{description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 relative">
                <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-surface border border-guide flex items-center justify-center text-text-secondary">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>

                {/* Debit side */}
                <div className="border border-blue-200 bg-blue-50/50 rounded-paper p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-sans text-label tracking-wide text-blue-800 uppercase">Debit (Dr)</span>
                        <span className="font-mono font-bold text-blue-900">{debitAmount}</span>
                    </div>
                    <div className="font-serif text-lg text-blue-950">{debitAccount}</div>
                </div>

                {/* Credit side */}
                <div className="border border-red-200 bg-red-50/50 rounded-paper p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-red-500" />
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-sans text-label tracking-wide text-red-800 uppercase">Credit (Cr)</span>
                        <span className="font-mono font-bold text-red-900">{creditAmount}</span>
                    </div>
                    <div className="font-serif text-lg text-red-950 ml-4">{creditAccount}</div>
                </div>
            </div>

            <div className="bg-amber-50 rounded p-4 text-amber-900 font-sans text-sm border border-amber-100 flex gap-3 items-start">
                <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-amber-600" /></div>
                <div>{explanation}</div>
            </div>
        </div>
    </div>
);

export const JournalLearningView = () => {
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
            <div className="max-w-4xl mx-auto space-y-16">

                {/* Header */}
                <div className="space-y-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ink text-ivory mb-4">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h1 className="font-display text-display-lg text-ink tracking-tight">Mastering Journal Entries</h1>
                    <p className="font-serif text-body text-text-secondary max-w-2xl mx-auto">
                        A visual, practical guide to correctly recording debits, credits, and keeping your ledger perfectly balanced.
                    </p>
                </div>

                {/* The DEALER Graphic Section */}
                <div className="bg-surface border border-guide rounded-paper p-8 lg:p-12 space-y-8 shadow-sm">
                    <div className="space-y-4 text-center max-w-2xl mx-auto mb-12">
                        <h2 className="font-serif text-display text-ink items-center gap-3">
                            The "DEALER" Framework
                        </h2>
                        <p className="font-sans text-body text-text-secondary">
                            The easiest way to remember which accounts take Debits to increase, and which take Credits to increase, is the <strong>DEALER</strong> mnemonic.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* DEAL (Debits) */}
                        <div className="space-y-4">
                            <div className="bg-blue-600 text-white rounded-t-paper p-4 text-center">
                                <h3 className="font-sans font-bold tracking-widest text-xl">DEA</h3>
                                <p className="text-blue-100 text-sm mt-1">Normal Balance: DEBIT</p>
                            </div>
                            <div className="border border-blue-200 border-t-0 -mt-4 rounded-b-paper bg-white p-6 space-y-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold font-mono">D</div>
                                    <div>
                                        <div className="font-bold text-ink">Dividends / Draws</div>
                                        <div className="text-sm text-text-secondary w-full">Owner takes money out</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold font-mono">E</div>
                                    <div>
                                        <div className="font-bold text-ink">Expenses</div>
                                        <div className="text-sm text-text-secondary">Rent, Payroll, Utilities</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold font-mono">A</div>
                                    <div>
                                        <div className="font-bold text-ink">Assets</div>
                                        <div className="text-sm text-text-secondary">Cash, Inventory, Equipment</div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 p-3 rounded text-sm text-blue-800 text-center flex items-center justify-center gap-2 mt-4">
                                    <ArrowUpCircle className="w-4 h-4" /> To INCREASE these, you <strong>DEBIT</strong> them.
                                </div>
                            </div>
                        </div>

                        {/* LER (Credits) */}
                        <div className="space-y-4">
                            <div className="bg-red-600 text-white rounded-t-paper p-4 text-center">
                                <h3 className="font-sans font-bold tracking-widest text-xl">LER</h3>
                                <p className="text-red-100 text-sm mt-1">Normal Balance: CREDIT</p>
                            </div>
                            <div className="border border-red-200 border-t-0 -mt-4 rounded-b-paper bg-white p-6 space-y-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold font-mono">L</div>
                                    <div>
                                        <div className="font-bold text-ink">Liabilities</div>
                                        <div className="text-sm text-text-secondary">Loans, Payables, Debt</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold font-mono">E</div>
                                    <div>
                                        <div className="font-bold text-ink">Equity</div>
                                        <div className="text-sm text-text-secondary">Capital, Retained Earnings</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold font-mono">R</div>
                                    <div>
                                        <div className="font-bold text-ink">Revenue</div>
                                        <div className="text-sm text-text-secondary">Sales, Fees earned</div>
                                    </div>
                                </div>

                                <div className="bg-red-50 border border-red-100 p-3 rounded text-sm text-red-800 text-center flex items-center justify-center gap-2 mt-4">
                                    <ArrowUpCircle className="w-4 h-4" /> To INCREASE these, you <strong>CREDIT</strong> them.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Examples Section */}
                <div className="space-y-6">
                    <div className="space-y-4 mb-8">
                        <h2 className="font-serif text-display text-ink flex items-center gap-3">
                            <Scale className="w-6 h-6 text-muted" />
                            Real World Examples
                        </h2>
                        <p className="font-sans text-body text-text-secondary">
                            Let's walk through common business scenarios and how you'd record them in the Classic Ledger. We always start by asking: "What accounts are changing?" and "Are they increasing or decreasing?"
                        </p>
                    </div>

                    <JournalEntryDemo
                        title="1. The Owner's Investment"
                        description="You decide to start a fresh business, 'Classic Bakery', and transfer $10,000 from your personal account into the new business bank account."
                        debitAccount="Cash (Asset)"
                        debitAmount="$10,000"
                        creditAccount="Owner's Capital (Equity)"
                        creditAmount="$10,000"
                        explanation={
                            <span>
                                <strong>Why?</strong> The business now has more Cash (Asset), and Assets increase with a <strong>Debit</strong>. The business also now owes that value to the owner (Equity), and Equity increases with a <strong>Credit</strong>. Both sides balance exactly!
                            </span>
                        }
                    />

                    <JournalEntryDemo
                        title="2. Buying Equipment on Credit"
                        description="You buy a new fancy oven for $2,500. You don't pay cash right now; instead, the supplier gives you an invoice to pay in 30 days."
                        debitAccount="Equipment (Asset)"
                        debitAmount="$2,500"
                        creditAccount="Accounts Payable (Liability)"
                        creditAmount="$2,500"
                        explanation={
                            <span>
                                <strong>Why?</strong> Your business gained Equipment (Asset ↑ = <strong>Debit</strong>). However, you didn't pay cash, so you owe money. You gained a debt (Liability ↑ = <strong>Credit</strong>).
                            </span>
                        }
                    />

                    <JournalEntryDemo
                        title="3. Making a Sale for Cash"
                        description="A happy customer walks in and buys a massive wedding cake, paying you $800 in cash right over the counter."
                        debitAccount="Cash (Asset)"
                        debitAmount="$800"
                        creditAccount="Sales Revenue (Revenue)"
                        creditAmount="$800"
                        explanation={
                            <span>
                                <strong>Why?</strong> The business received money, so Cash increases (Asset ↑ = <strong>Debit</strong>). You earned this money through your business activity, so Revenue increases (Revenue ↑ = <strong>Credit</strong>).
                            </span>
                        }
                    />

                    <JournalEntryDemo
                        title="4. Paying the Monthly Rent"
                        description="It's the 1st of the month, and you write a check for $1,200 to pay the landlord for shop rent."
                        debitAccount="Rent Expense (Expense)"
                        debitAmount="$1,200"
                        creditAccount="Cash (Asset)"
                        creditAmount="$1,200"
                        explanation={
                            <span>
                                <strong>Why?</strong> You incurred a cost of doing business, so Expenses go up (Expense ↑ = <strong>Debit</strong>). You paid it out of your bank account, so Cash goes down (Asset ↓ = <strong>Credit</strong>). Yes, Cash reduces with a Credit!
                            </span>
                        }
                    />

                </div>
            </div>
        </section>
    );
};
