import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useLedgerContext } from '@/hooks/LedgerContext';
import { formatCurrency, type TrialBalance as TrialBalanceType, type TrialBalanceRow } from '@/types/accounting';
import { CheckCircle2, XCircle, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StartingBalancesDialog } from '@/components/StartingBalancesDialog';
import { downloadAsImage } from '@/lib/downloadImage';
interface TrialBalanceRowProps {
  row: TrialBalanceRow;
  index: number;
}

const TrialBalanceRowComponent = ({ row, index }: TrialBalanceRowProps) => {
  const isEven = index % 2 === 0;

  return (
    <div
      className={`grid grid-cols-[1fr_140px_140px] gap-4 items-center h-12 px-4 ${isEven ? 'bg-ivory' : 'bg-guide/30'
        }`}
    >
      <div className="font-serif text-body text-ink">
        {row.accountName}
      </div>
      <div className="font-mono text-data text-ink text-right tabular-nums">
        {row.debitBalance > 0 ? formatCurrency(row.debitBalance) : '—'}
      </div>
      <div className="font-mono text-data text-ink text-right tabular-nums">
        {row.creditBalance > 0 ? formatCurrency(row.creditBalance) : '—'}
      </div>
    </div>
  );
};

export const TrialBalance = () => {
  const { currentWorkbook, currentWorkbookId, generateTrialBalance } = useLedgerContext();
  const [trialBalance, setTrialBalance] = useState<TrialBalanceType | null>(null);
  const [showStamp, setShowStamp] = useState(false);

  const titleRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const totalsRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);

  // Generate trial balance when component mounts
  useEffect(() => {
    if (currentWorkbookId) {
      const tb = generateTrialBalance(currentWorkbookId);
      setTrialBalance(tb);
      // Show stamp after a short delay if balanced
      if (tb.isBalanced) {
        setTimeout(() => setShowStamp(true), 600);
      }
    }
  }, [currentWorkbookId, currentWorkbook, generateTrialBalance]);

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo(titleRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
        .fromTo(tableRef.current,
          { opacity: 0, y: 40, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6 },
          '-=0.3'
        )
        .fromTo(totalsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4 },
          '-=0.2'
        );

      if (showStamp && stampRef.current) {
        tl.fromTo(stampRef.current,
          { scale: 1.6, opacity: 0, rotate: -8 },
          { scale: 1, opacity: 1, rotate: 0, duration: 0.3, ease: 'back.out(1.7)' },
          '-=0.1'
        );
      }
    });

    return () => ctx.revert();
  }, [showStamp, trialBalance]);

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

  if (!trialBalance || trialBalance.rows.length === 0) {
    return (
      <section id="trial-balance-view" className="min-h-screen pt-28 pb-8 px-[8vw] bg-ivory">
        <div ref={titleRef} className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display text-display text-ink tracking-tight">
              Trial Balance
            </h1>
            <p className="font-sans text-label uppercase tracking-wide text-text-secondary mt-2">
              Verify the mathematical accuracy of your books
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StartingBalancesDialog />
          </div>
        </div>
        <div className="flex items-center justify-center h-64 border border-dashed border-guide rounded-paper bg-ivory/50">
          <div className="text-center">
            <p className="font-serif text-body text-text-secondary">
              No data available. Record journal entries to generate the trial balance.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="trial-balance-view" className="min-h-screen pt-28 pb-8 px-[8vw] bg-ivory">
      {/* Title */}
      <div ref={titleRef} className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-display text-ink tracking-tight">
            Trial Balance
          </h1>
          <p className="font-sans text-label uppercase tracking-wide text-text-secondary mt-2">
            Verify the mathematical accuracy of your books
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StartingBalancesDialog />
          <Button
            variant="outline"
            className="gap-2 font-serif"
            onClick={() => downloadAsImage('trial-balance-view', 'trial-balance')}
          >
            <Download className="w-4 h-4" />
            Download Image
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div
        ref={tableRef}
        className="border border-ink rounded-paper bg-surface overflow-hidden relative"
      >
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_140px_140px] gap-4 items-center h-12 px-4 bg-ink text-ivory">
          <div className="font-sans text-label uppercase tracking-wide">
            Account
          </div>
          <div className="font-sans text-label uppercase tracking-wide text-right">
            Debit Balance
          </div>
          <div className="font-sans text-label uppercase tracking-wide text-right">
            Credit Balance
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-guide">
          {trialBalance.rows.map((row, index) => (
            <TrialBalanceRowComponent key={row.accountCode} row={row} index={index} />
          ))}
        </div>

        {/* Totals Row */}
        <div
          ref={totalsRef}
          className="grid grid-cols-[1fr_140px_140px] gap-4 items-center h-14 px-4 bg-ivory border-t-2 border-ink double-underline"
        >
          <div className="font-serif text-heading text-ink">
            Total
          </div>
          <div className="font-mono text-data text-ink text-right tabular-nums font-medium">
            {formatCurrency(trialBalance.totalDebit)}
          </div>
          <div className="font-mono text-data text-ink text-right tabular-nums font-medium">
            {formatCurrency(trialBalance.totalCredit)}
          </div>
        </div>

        {/* Stamp */}
        {trialBalance.isBalanced && showStamp && (
          <div
            ref={stampRef}
            className="absolute bottom-6 right-8"
          >
            <div className="w-28 h-28 rounded-full border-4 border-accounting-red flex items-center justify-center transform -rotate-12">
              <div className="text-center">
                <CheckCircle2 className="w-8 h-8 text-accounting-red mx-auto mb-1" />
                <span className="font-sans text-[10px] uppercase tracking-wide text-accounting-red font-bold block">
                  Balance
                </span>
                <span className="font-sans text-[10px] uppercase tracking-wide text-accounting-red font-bold block">
                  Verified
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className={`mt-6 p-4 rounded-paper border flex items-center justify-between ${trialBalance.isBalanced
          ? 'bg-green-50 border-green-200'
          : 'bg-pale-red border-accounting-red/30'
        }`}>
        <div className="flex items-center gap-3">
          {trialBalance.isBalanced ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <span className="font-sans text-label uppercase tracking-wide text-green-700 block">
                  Books are Balanced
                </span>
                <span className="font-mono text-micro text-green-600">
                  Total Debits equal Total Credits
                </span>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 text-accounting-red" />
              <div>
                <span className="font-sans text-label uppercase tracking-wide text-accounting-red block">
                  Books are Unbalanced
                </span>
                <span className="font-mono text-micro text-accounting-red">
                  Difference: {formatCurrency(trialBalance.difference)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="font-sans text-label uppercase tracking-wide text-text-secondary block">
              Total Debit
            </span>
            <span className="font-mono text-data text-ink tabular-nums">
              {formatCurrency(trialBalance.totalDebit)}
            </span>
          </div>
          <div className="text-right">
            <span className="font-sans text-label uppercase tracking-wide text-text-secondary block">
              Total Credit
            </span>
            <span className="font-mono text-data text-ink tabular-nums">
              {formatCurrency(trialBalance.totalCredit)}
            </span>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-8 p-4 border border-guide rounded-paper bg-ivory/50">
        <h3 className="font-sans text-label uppercase tracking-wide text-text-secondary mb-3">
          About Trial Balance
        </h3>
        <p className="font-serif text-body text-text-secondary mb-3">
          A trial balance is a bookkeeping worksheet in which the balances of all ledgers are compiled into
          debit and credit account column totals that are equal. It verifies the mathematical accuracy of
          the bookkeeping system.
        </p>
        <div className="flex items-start gap-2 text-text-secondary">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="font-serif text-body">
            A balanced trial balance indicates that for every debit entry, a corresponding credit entry was recorded.
            However, it does not guarantee that all entries are correct—only that they are mathematically balanced.
          </p>
        </div>
      </div>
    </section>
  );
};
