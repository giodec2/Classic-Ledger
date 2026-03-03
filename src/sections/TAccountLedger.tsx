import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Plus } from 'lucide-react';
import { useLedgerContext } from '@/hooks/LedgerContext';
import { formatCurrency, formatShortDate, type TAccount, type TAccountEntry } from '@/types/accounting';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AccountCombobox } from '@/components/AccountCombobox';
import { DateInput } from '@/components/JournalComponents';
import { Input } from '@/components/ui/input';

interface TAccountCardProps {
  account: TAccount;
  onEntryClick: (entry: TAccountEntry) => void;
  onAddClick: (accountName: string) => void;
}

const TAccountCard = ({ account, onEntryClick, onAddClick }: TAccountCardProps) => {
  return (
    <div className="bg-surface border border-guide rounded-paper overflow-hidden relative group">
      {/* Action Button */}
      <button
        onClick={() => onAddClick(account.accountName)}
        className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-ink text-white rounded-full hover:bg-ink/80 shadow-sm"
        title="Record Transaction"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {/* Header */}
      <div className="px-4 py-3 border-b border-ink bg-ivory">
        <h3 className="font-serif text-heading text-ink text-center flex items-center justify-center gap-2">
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
                    {formatShortDate(entry.date)}
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
                    {formatShortDate(entry.date)}
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
          <span className={`font-mono text-data tabular-nums ${account.balance >= 0 ? 'text-ink' : 'text-accounting-red'
            }`}>
            {formatCurrency(Math.abs(account.balance))} {account.balanceType === 'debit' ? 'Dr' : 'Cr'}
          </span>
        </div>
      </div>
    </div>
  );
};

export const TAccountLedger = () => {
  const { currentWorkbook, currentWorkbookId, generateTAccounts, createFastJournalEntry } = useLedgerContext();
  const [accounts, setAccounts] = useState<TAccount[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<TAccountEntry | null>(null);

  // Fast Transaction Dialog State
  const [isFastTxOpen, setIsFastTxOpen] = useState(false);
  const [txDate, setTxDate] = useState('');
  const [txPrimaryAccount, setTxPrimaryAccount] = useState('');
  const [txOffsetAccount, setTxOffsetAccount] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txIsDebit, setTxIsDebit] = useState(true);
  const [txDescription, setTxDescription] = useState('');

  const handleOpenFastTx = (accountName: string = '') => {
    setTxPrimaryAccount(accountName);
    setTxOffsetAccount('');
    setTxAmount('');
    setTxDate('');
    setTxIsDebit(true);
    setTxDescription('');
    setIsFastTxOpen(true);
  };

  const handleSubmitFastTx = () => {
    if (!currentWorkbookId || !txDate || !txPrimaryAccount || !txOffsetAccount || !txAmount || parseFloat(txAmount) <= 0) return;

    let debitAcc = txPrimaryAccount;
    let creditAcc = txOffsetAccount;

    if (!txIsDebit) {
      debitAcc = txOffsetAccount;
      creditAcc = txPrimaryAccount;
    }

    createFastJournalEntry(currentWorkbookId, txDate, debitAcc, creditAcc, parseFloat(txAmount), txDescription);
    setIsFastTxOpen(false);
  };

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
        <div className="flex items-center justify-between mt-2">
          <p className="font-serif text-body text-text-secondary">
            T-accounts visualize the flow of value. They perfectly mirror the General Journal so any changes made there will update the T-accounts here automatically.
          </p>
          <button
            onClick={() => handleOpenFastTx()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-accounting-red text-white font-sans text-[11px] uppercase tracking-wide rounded-paper hover:bg-accounting-red/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </div>

      {/* T-Accounts Grid */}
      {accounts.length === 0 ? (
        <div className="flex items-center justify-center h-64 border border-dashed border-guide rounded-paper">
          <div className="text-center">
            <p className="font-serif text-body text-text-secondary mb-4">
              No accounts yet. Record journal entries to generate T-accounts.
            </p>
            <button
              onClick={() => handleOpenFastTx()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accounting-red text-white font-sans text-label uppercase tracking-wide rounded-paper hover:bg-accounting-red/90 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Register First Entry
            </button>
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
              onAddClick={handleOpenFastTx}
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
                    {formatShortDate(selectedEntry.date)}
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

      {/* Fast Transaction Dialog */}
      <Dialog open={isFastTxOpen} onOpenChange={setIsFastTxOpen}>
        <DialogContent className="bg-surface border-ink/20 rounded-paper max-w-lg">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-display text-heading text-ink flex items-center gap-2">
              <span className="w-8 h-8 rounded bg-accounting-red/10 text-accounting-red flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </span>
              Record Transaction
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-32 shrink-0">
                <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-2">
                  Date
                </label>
                <div className="h-10 flex items-center px-3 border border-guide rounded bg-white">
                  <DateInput
                    value={txDate}
                    onChange={setTxDate}
                    onFocus={() => { }}
                    onBlur={() => { }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted">$</span>
                  <Input
                    type="number"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="pl-7 font-mono text-lg bg-white h-10 border-guide"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-guide/10 border border-guide rounded space-y-4">
              <div className="flex items-center gap-4 border-b border-guide pb-4">
                <div className="flex-1">
                  <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-2">
                    Primary Account
                  </label>
                  <AccountCombobox
                    value={txPrimaryAccount}
                    onChange={setTxPrimaryAccount}
                    existingAccounts={accounts.map(a => a.accountName)}
                    placeholder="Select account"
                    className="font-serif bg-white h-10 px-3 w-full border border-guide rounded"
                    onFocus={() => { }} onBlur={() => { }} onKeyDown={() => { }}
                  />
                </div>
                <div className="flex flex-col gap-2 shrink-0 pt-6">
                  <div className="flex bg-white rounded border border-guide overflow-hidden">
                    <button
                      onClick={() => setTxIsDebit(true)}
                      className={`px-4 py-1.5 font-sans text-xs uppercase tracking-wider font-bold transition-colors \${txIsDebit ? 'bg-accounting-red text-white' : 'text-text-secondary hover:bg-guide/30'}`}
                    >
                      Debit
                    </button>
                    <button
                      onClick={() => setTxIsDebit(false)}
                      className={`px-4 py-1.5 font-sans text-xs uppercase tracking-wider font-bold transition-colors \${!txIsDebit ? 'bg-emerald-700 text-white' : 'text-text-secondary hover:bg-guide/30'}`}
                    >
                      Credit
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-2">
                  Offsetting Account (Auto-Balances)
                </label>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 bg-white font-sans text-[10px] font-bold uppercase rounded border border-guide \${txIsDebit ? 'text-emerald-700' : 'text-accounting-red'}`}>
                    {txIsDebit ? 'CREDIT' : 'DEBIT'}
                  </span>
                  <div className="flex-1">
                    <AccountCombobox
                      value={txOffsetAccount}
                      onChange={setTxOffsetAccount}
                      existingAccounts={accounts.map(a => a.accountName)}
                      placeholder="Select opposing account"
                      className="font-serif bg-white h-10 px-3 w-full border border-guide rounded"
                      onFocus={() => { }} onBlur={() => { }} onKeyDown={() => { }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-2">
                Memo (Optional)
              </label>
              <Input
                value={txDescription}
                onChange={(e) => setTxDescription(e.target.value)}
                placeholder="Description for the journal entry..."
                className="font-serif bg-white border-guide"
              />
            </div>

            <div className="flex justify-end pt-4 mt-6 border-t border-guide gap-3">
              <button
                onClick={() => setIsFastTxOpen(false)}
                className="px-5 py-2.5 font-sans text-label uppercase tracking-wide text-text-secondary hover:bg-guide/30 rounded-paper transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFastTx}
                disabled={!txDate || !txPrimaryAccount || !txOffsetAccount || !txAmount}
                className="px-5 py-2.5 bg-ink text-white font-sans text-label uppercase tracking-wide rounded-paper hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Record Entry
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
