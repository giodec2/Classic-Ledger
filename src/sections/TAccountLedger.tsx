import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useLedgerContext } from '@/hooks/LedgerContext';
import { formatCurrency, type TAccount, type TAccountEntry } from '@/types/accounting';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TAccountCardProps {
  account: TAccount;
  onEntryClick: (entry: TAccountEntry) => void;
}

const TAccountCard = ({ account, onEntryClick }: TAccountCardProps) => {
  return (
    <div className="bg-surface border border-guide rounded-paper overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-ink bg-ivory">
        <h3 className="font-serif text-heading text-ink text-center">
          {account.accountName}
        </h3>
        <p className="font-mono text-micro text-text-secondary text-center mt-1">
          Code: {account.accountCode}
        </p>
      </div>

      {/* T-Account Body */}
      <div className="grid grid-cols-2 divide-x divide-guide min-h-[120px]">
        {/* Debit Side */}
        <div className="p-3">
          <div className="font-sans text-label uppercase tracking-wide text-text-secondary text-center mb-2 pb-2 border-b border-guide">
            Debit (Dr)
          </div>
          <div className="space-y-1">
            {account.debitEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onEntryClick(entry)}
                className="w-full text-left py-1 px-2 hover:bg-guide/30 rounded transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-micro text-text-secondary">
                    #{entry.journalEntryNumber}
                  </span>
                  <span className="font-mono text-data text-ink tabular-nums">
                    {formatCurrency(entry.amount)}
                  </span>
                </div>
              </button>
            ))}
            {account.debitEntries.length === 0 && (
              <div className="text-center py-4 text-muted font-mono text-micro">
                No entries
              </div>
            )}
          </div>
        </div>

        {/* Credit Side */}
        <div className="p-3">
          <div className="font-sans text-label uppercase tracking-wide text-text-secondary text-center mb-2 pb-2 border-b border-guide">
            Credit (Cr)
          </div>
          <div className="space-y-1">
            {account.creditEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onEntryClick(entry)}
                className="w-full text-left py-1 px-2 hover:bg-guide/30 rounded transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-micro text-text-secondary">
                    #{entry.journalEntryNumber}
                  </span>
                  <span className="font-mono text-data text-ink tabular-nums">
                    {formatCurrency(entry.amount)}
                  </span>
                </div>
              </button>
            ))}
            {account.creditEntries.length === 0 && (
              <div className="text-center py-4 text-muted font-mono text-micro">
                No entries
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Balance Footer */}
      <div className="px-4 py-3 border-t border-ink bg-ivory">
        <div className="flex justify-between items-center">
          <span className="font-sans text-label uppercase tracking-wide text-text-secondary">
            Balance
          </span>
          <span className={`font-mono text-data tabular-nums ${
            account.balance >= 0 ? 'text-ink' : 'text-accounting-red'
          }`}>
            {formatCurrency(Math.abs(account.balance))} {account.balanceType === 'debit' ? 'Dr' : 'Cr'}
          </span>
        </div>
      </div>
    </div>
  );
};

export const TAccountLedger = () => {
  const { currentWorkbook, currentWorkbookId, generateTAccounts } = useLedgerContext();
  const [accounts, setAccounts] = useState<TAccount[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<TAccountEntry | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Generate T-Accounts when component mounts or workbook changes
  useEffect(() => {
    if (currentWorkbookId) {
      const generatedAccounts = generateTAccounts(currentWorkbookId);
      setAccounts(generatedAccounts);
    }
  }, [currentWorkbookId, currentWorkbook, generateTAccounts]);

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo(headerRef.current,
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.5 }
      )
      .fromTo(gridRef.current?.children || [],
        { opacity: 0, y: 50, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 },
        '-=0.3'
      );
    });

    return () => ctx.revert();
  }, [accounts.length]);

  if (!currentWorkbook) {
    return (
      <section className="min-h-screen pt-32 pb-16 px-[8vw] flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-body text-text-secondary">
            No workbook selected. Please return to the dashboard.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen pt-28 pb-8 px-[8vw]">
      {/* Header */}
      <div ref={headerRef} className="mb-8">
        <h1 className="font-display text-display text-ink tracking-tight">
          T-Accounts
        </h1>
        <p className="font-serif text-body text-text-secondary mt-2">
          T-accounts visualize the flow of value into specific account buckets.
        </p>
      </div>

      {/* T-Accounts Grid */}
      {accounts.length === 0 ? (
        <div className="flex items-center justify-center h-64 border border-dashed border-guide rounded-paper">
          <div className="text-center">
            <p className="font-serif text-body text-text-secondary">
              No accounts yet. Record journal entries to generate T-accounts.
            </p>
          </div>
        </div>
      ) : (
        <div 
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {accounts.map((account) => (
            <TAccountCard
              key={account.id}
              account={account}
              onEntryClick={setSelectedEntry}
            />
          ))}
        </div>
      )}

      {/* Entry Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="bg-surface border-ink/20 rounded-paper max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-heading text-ink">
              Entry Details
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-1">
                    Journal Entry
                  </label>
                  <p className="font-mono text-data text-ink">
                    #{selectedEntry.journalEntryNumber}
                  </p>
                </div>
                <div>
                  <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-1">
                    Date
                  </label>
                  <p className="font-mono text-data text-ink">
                    {new Date(selectedEntry.date).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
              <div>
                <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-1">
                  Description
                </label>
                <p className="font-serif text-body text-ink">
                  {selectedEntry.description}
                </p>
              </div>
              <div>
                <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-1">
                  Amount
                </label>
                <p className="font-mono text-data text-ink tabular-nums">
                  {formatCurrency(selectedEntry.amount)}
                </p>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="w-full mt-4 px-4 py-2 bg-ink text-ivory font-sans text-label uppercase tracking-wide rounded-paper hover:bg-ink/90 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <div className="mt-8 p-4 border border-guide rounded-paper bg-ivory/50">
        <h3 className="font-sans text-label uppercase tracking-wide text-text-secondary mb-3">
          Understanding T-Accounts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-serif text-body text-text-secondary">
          <div>
            <strong className="text-ink">Debit side:</strong>
            <p>Records increases in assets and expenses, decreases in liabilities, equity, and revenue.</p>
          </div>
          <div>
            <strong className="text-ink">Credit side:</strong>
            <p>Records increases in liabilities, equity, and revenue, decreases in assets and expenses.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
