import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useLedgerContext } from '@/hooks/LedgerContext';
import { Package, Building2, Calculator, Settings2, ShieldCheck, PieChart, ArrowLeft } from 'lucide-react';
import { InventoryValuation } from '@/components/academy/InventoryValuation';
import { BankReconciliation } from '@/components/academy/BankReconciliation';
import { BadDebtEstimator } from '@/components/academy/BadDebtEstimator';

const MODULES = [
    { id: 'inventory', title: 'Inventory Cost Flow', description: 'Simulate FIFO, LIFO, and Average Cost on dynamic layers.', icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'hover:border-emerald-200 hover:bg-emerald-50/50' },
    { id: 'bank', title: 'Bank Reconciliation', description: 'Balance your books against bank statements and errors.', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', hover: 'hover:border-blue-200 hover:bg-blue-50/50' },
    { id: 'bad-debt', title: 'Bad Debt Estimator', description: 'Test Aging vs. % of Sales methods for uncollectible accounts.', icon: Calculator, color: 'text-rose-600', bg: 'bg-rose-50', hover: 'hover:border-rose-200 hover:bg-rose-50/50' },
];

export const AcademyHub = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { } = useLedgerContext();
    const [selectedModule, setSelectedModule] = useState<string | null>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(containerRef.current?.children || [],
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
            );
        });
        return () => ctx.revert();
    }, [selectedModule]);

    const renderActiveModule = () => {
        if (selectedModule === 'inventory') return <InventoryValuation />;
        if (selectedModule === 'bank') return <BankReconciliation />;
        if (selectedModule === 'bad-debt') return <BadDebtEstimator />;
        return null;
    };

    return (
        <section className="min-h-screen pt-24 pb-24 px-[6vw] bg-ivory paper-grain" ref={containerRef}>
            <div className="max-w-5xl mx-auto space-y-12">

                {/* Back button logic integrated elegantly */}
                {selectedModule && (
                    <button 
                        onClick={() => setSelectedModule(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-surface border border-guide rounded-full font-sans text-xs uppercase tracking-wide text-text-secondary hover:text-ink hover:border-ink/50 transition-all group w-fit shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Simulation Library
                    </button>
                )}

                {/* Header */}
                <div className={`space-y-4 ${selectedModule ? 'text-left border-b border-guide pb-8' : 'text-center'}`}>
                    {!selectedModule && (
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4">
                            <PieChart className="w-8 h-8" />
                        </div>
                    )}
                    <h1 className="font-display text-display-lg text-ink tracking-tight">
                        {selectedModule ? MODULES.find(m => m.id === selectedModule)?.title : 'Interactive Academy'}
                    </h1>
                    <p className={`font-serif text-body text-text-secondary ${!selectedModule && 'max-w-2xl mx-auto'}`}>
                        {selectedModule 
                            ? 'Adjust the variables in real-time below to see how different business scenarios affect the financial outcomes.' 
                            : 'Master complex accounting concepts through hands-on, risk-free simulations. These tools are completely isolated from your main ledgers.'}
                    </p>
                </div>

                {!selectedModule ? (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {MODULES.map((mod) => (
                                <button
                                    key={mod.id}
                                    onClick={() => setSelectedModule(mod.id)}
                                    className={`text-left p-8 bg-surface border border-guide rounded-paper transition-all flex flex-col gap-6 group shadow-sm ${mod.hover}`}
                                >
                                    <div className={`w-14 h-14 rounded-full ${mod.bg} flex items-center justify-center ${mod.color} group-hover:scale-110 transition-transform shadow-sm`}>
                                        <mod.icon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-serif text-heading text-ink">{mod.title}</h3>
                                        <p className="font-sans text-sm leading-relaxed text-text-secondary">
                                            {mod.description}
                                        </p>
                                    </div>
                                    <div className={`mt-auto pt-4 border-t border-guide uppercase tracking-wide text-[10px] font-bold font-sans flex items-center gap-1 ${mod.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                        Launch Simulator <ArrowLeft className="w-3 h-3 rotate-180" />
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="border-t border-guide pt-12">
                            <h3 className="font-sans text-xs uppercase tracking-wide text-text-secondary font-bold mb-6">Coming Soon in V2</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 pointer-events-none">
                                <div className="p-6 bg-surface/50 border border-guide dashed rounded-paper flex items-center gap-4">
                                    <div className="w-10 h-10 rounded bg-ink/5 flex items-center justify-center text-ink/40">
                                        <Settings2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-ink mb-1">Operating Cycle Visualizer</h3>
                                        <p className="font-sans text-xs text-text-secondary">Track cash converted to inventory and back to cash.</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-surface/50 border border-guide dashed rounded-paper flex items-center gap-4">
                                    <div className="w-10 h-10 rounded bg-ink/5 flex items-center justify-center text-ink/40">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-ink mb-1">Ethics Scenarios (CYOA)</h3>
                                        <p className="font-sans text-xs text-text-secondary">Interactive choose-your-own-adventure game.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-surface border border-guide rounded-paper shadow-sm overflow-hidden p-8 lg:p-12 relative group">
                         {/* Subtle background decoration */}
                         <div className="absolute top-0 right-0 w-64 h-64 bg-guide/10 rounded-bl-[100px] -z-10 transition-transform duration-700 group-hover:scale-110" />
                        {renderActiveModule()}
                    </div>
                )}

            </div>
        </section>
    );
};
