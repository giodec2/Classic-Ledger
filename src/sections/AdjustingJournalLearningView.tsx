import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CheckCircle2, Clock, Scale, ArrowRight } from 'lucide-react';

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

export const AdjustingJournalLearningView = () => {
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
                        <Clock className="w-8 h-8" />
                    </div>
                    <h1 className="font-display text-display-lg text-ink tracking-tight">Adjusting Entries</h1>
                    <p className="font-serif text-body text-text-secondary max-w-2xl mx-auto">
                        A guide to the end-of-period adjustments required by accrual accounting to ensure your revenues and expenses are recognized in the correct period.
                    </p>
                </div>

                {/* The Why Section */}
                <div className="bg-surface border border-guide rounded-paper p-8 lg:p-12 space-y-8 shadow-sm">
                    <div className="space-y-4 text-center max-w-2xl mx-auto mb-12">
                        <h2 className="font-serif text-display text-ink items-center gap-3">
                            Why do we need Adjustments?
                        </h2>
                        <p className="font-sans text-body text-text-secondary">
                            Cash isn't always paid exactly when a service is provided or an expense is incurred. Under the <strong>Accrual Basis of Accounting</strong>, we must match revenues to the period they are earned, and expenses to the period they are incurred (The Matching Principle).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Deferrals */}
                        <div className="space-y-4">
                            <div className="bg-purple-600 text-white rounded-t-paper p-4 text-center">
                                <h3 className="font-sans font-bold tracking-widest text-xl">DEFERRALS</h3>
                                <p className="text-purple-100 text-sm mt-1">Cash moved BEFORE action</p>
                            </div>
                            <div className="border border-purple-200 border-t-0 -mt-4 rounded-b-paper bg-white p-6 space-y-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold font-mono">1</div>
                                    <div>
                                        <div className="font-bold text-ink">Prepaid Expenses</div>
                                        <div className="text-sm text-text-secondary">Paid cash in advance (e.g., insurance). Asset becomes an Expense.</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold font-mono">2</div>
                                    <div>
                                        <div className="font-bold text-ink">Unearned Revenues</div>
                                        <div className="text-sm text-text-secondary">Received cash in advance. Liability becomes Revenue.</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Accruals */}
                        <div className="space-y-4">
                            <div className="bg-emerald-600 text-white rounded-t-paper p-4 text-center">
                                <h3 className="font-sans font-bold tracking-widest text-xl">ACCRUALS</h3>
                                <p className="text-emerald-100 text-sm mt-1">Action happened BEFORE cash</p>
                            </div>
                            <div className="border border-emerald-200 border-t-0 -mt-4 rounded-b-paper bg-white p-6 space-y-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold font-mono">3</div>
                                    <div>
                                        <div className="font-bold text-ink">Accrued Expenses</div>
                                        <div className="text-sm text-text-secondary">Expense incurred but not yet paid (e.g., salaries). Expense & Liability.</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold font-mono">4</div>
                                    <div>
                                        <div className="font-bold text-ink">Accrued Revenues</div>
                                        <div className="text-sm text-text-secondary">Revenue earned but not yet received (e.g., billed services). Asset & Revenue.</div>
                                    </div>
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
                            Real World Adjustments
                        </h2>
                        <p className="font-sans text-body text-text-secondary">
                            At the end of the month, you review your books. Here are the adjusting entries you must make to reflect reality. Notice that <strong>Cash is NEVER entirely part of an adjusting entry</strong>.
                        </p>
                    </div>

                    <JournalEntryDemo
                        title="1. Prepaid Expense (Deferral)"
                        description="On Jan 1st, you paid $1,200 for 12 months of insurance (Asset). Now it is Jan 31st. One month of insurance has been 'used up'."
                        debitAccount="Insurance Expense"
                        debitAmount="$100"
                        creditAccount="Prepaid Insurance (Asset)"
                        creditAmount="$100"
                        explanation={
                            <span>
                                <strong>Why?</strong> You consumed $100 ($1,200 / 12) of your asset. To show you used it, you Debit the Expense (Expense ↑). To reduce your Prepaid asset balance, you Credit it (Asset ↓).
                            </span>
                        }
                    />

                    <JournalEntryDemo
                        title="2. Unearned Revenue (Deferral)"
                        description="A customer paid you $500 in advance on Jan 15th to build them a website (recorded as Unearned Revenue Liability). By Jan 31st, you have completed half the work."
                        debitAccount="Unearned Revenue (Liability)"
                        debitAmount="$250"
                        creditAccount="Service Revenue"
                        creditAmount="$250"
                        explanation={
                            <span>
                                <strong>Why?</strong> Since you did half the work, you no longer owe the customer that $250 in service. Liability decreases with a Debit. You have now earned that chunk, so Revenue increases with a Credit.
                            </span>
                        }
                    />

                    <JournalEntryDemo
                        title="3. Accrued Expense (Accrual)"
                        description="Your employees worked the last week of January and earned $2,000, but they won't be paid until February 5th."
                        debitAccount="Salaries Expense"
                        debitAmount="$2,000"
                        creditAccount="Salaries Payable (Liability)"
                        creditAmount="$2,000"
                        explanation={
                            <span>
                                <strong>Why?</strong> The expense belongs to January, so we must recognize it now (Expense ↑ = Debit). Because we haven't paid them yet, we owe them (Liability ↑ = Credit).
                            </span>
                        }
                    />

                    <JournalEntryDemo
                        title="4. Accrued Revenue (Accrual)"
                        description="You provided $800 worth of consulting services to a client in January, but haven't billed them or received cash yet."
                        debitAccount="Accounts Receivable (Asset)"
                        debitAmount="$800"
                        creditAccount="Consulting Revenue"
                        creditAmount="$800"
                        explanation={
                            <span>
                                <strong>Why?</strong> You've earned the money, so Revenue goes up (Revenue ↑ = Credit). The client now owes you, increasing the value of money coming to you in the future (Asset ↑ = Debit).
                            </span>
                        }
                    />

                    <JournalEntryDemo
                        title="5. Depreciation (Special Deferral)"
                        description="You bought a delivery van for $24,000 lasting 4 years. It loses $500 of value every month. It's the end of the month."
                        debitAccount="Depreciation Expense"
                        debitAmount="$500"
                        creditAccount="Accumulated Depreciation (Contra-Asset)"
                        creditAmount="$500"
                        explanation={
                            <span>
                                <strong>Why?</strong> As equipment is used, its cost is slowly spread out over its useful life. You recognize the expense (Debit). Instead of crediting the Van directly, we credit a "Contra-Asset" called Accumulated Depreciation which sits right below the Van on the balance sheet and reduces its total book value.
                            </span>
                        }
                    />

                </div>
            </div>
        </section>
    );
};
