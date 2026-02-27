import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useLedgerContext } from '@/hooks/LedgerContext';
import { formatCurrency, type BalanceSheet } from '@/types/accounting';
import { CheckCircle2, XCircle, Building2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadAsImage } from '@/lib/downloadImage';

// Default empty balance sheet structure
const emptyBalanceSheet: BalanceSheet = {
  assets: {
    currentAssets: [],
    nonCurrentAssets: [],
    totalCurrentAssets: 0,
    totalNonCurrentAssets: 0,
    totalAssets: 0,
  },
  liabilities: {
    currentLiabilities: [],
    nonCurrentLiabilities: [],
    totalCurrentLiabilities: 0,
    totalNonCurrentLiabilities: 0,
    totalLiabilities: 0,
  },
  equity: {
    items: [],
    totalEquity: 0,
  },
  totalLiabilitiesAndEquity: 0,
  isBalanced: true,
};

export const BalanceSheetView = () => {
  const { currentWorkbook, currentWorkbookId, generateBalanceSheet } = useLedgerContext();
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet>(emptyBalanceSheet);
  const [isLoading, setIsLoading] = useState(true);

  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Generate balance sheet when component mounts
  useEffect(() => {
    if (currentWorkbookId) {
      try {
        const bs = generateBalanceSheet(currentWorkbookId);
        setBalanceSheet(bs || emptyBalanceSheet);
      } catch (error) {
        console.error('Error generating balance sheet:', error);
        setBalanceSheet(emptyBalanceSheet);
      }
    }
    setIsLoading(false);
  }, [currentWorkbookId, currentWorkbook, generateBalanceSheet]);

  // Entrance animation
  useEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
      if (contentRef.current) {
        gsap.fromTo(contentRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: 'power2.out' }
        );
      }
    });

    return () => ctx.revert();
  }, [isLoading]);

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

  if (isLoading) {
    return (
      <section id="balance-sheet-view" className="min-h-screen pt-28 pb-8 px-[8vw]">
        <div className="flex items-center justify-center h-64">
          <p className="font-serif text-body text-text-secondary">
            Generating balance sheet...
          </p>
        </div>
      </section>
    );
  }

  const bs = balanceSheet || emptyBalanceSheet;

  return (
    <section id="balance-sheet-view" className="min-h-screen pt-28 pb-8 px-[8vw] bg-ivory">
      {/* Title */}
      <div ref={titleRef} className="text-center mb-8 relative">
        <div className="absolute right-0 top-0">
          <Button
            variant="outline"
            className="gap-2 font-serif"
            onClick={() => downloadAsImage('balance-sheet-view', 'balance-sheet')}
          >
            <Download className="w-4 h-4" />
            Download Image
          </Button>
        </div>
        <div className="flex items-center justify-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-ink" />
          <h1 className="font-display text-display text-ink tracking-tight">
            Balance Sheet
          </h1>
        </div>
        <p className="font-sans text-label uppercase tracking-wide text-text-secondary">
          Statement of Financial Position
        </p>
        <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-paper ${bs.isBalanced ? 'bg-green-50 border border-green-200' : 'bg-pale-red border border-accounting-red/30'
          }`}>
          {bs.isBalanced ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-sans text-label uppercase tracking-wide text-green-700">
                Assets = Liabilities + Equity
              </span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-accounting-red" />
              <span className="font-sans text-label uppercase tracking-wide text-accounting-red">
                Out of Balance
              </span>
            </>
          )}
        </div>
      </div>

      {/* Balance Sheet Grid */}
      <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets Column */}
        <div className="space-y-6">
          <div className="bg-surface border border-guide rounded-paper overflow-hidden">
            <div className="px-4 py-3 bg-ink text-ivory">
              <h2 className="font-serif text-heading">Assets</h2>
            </div>

            {/* Current Assets */}
            <div className="p-4 border-b border-guide">
              <h3 className="font-sans text-label uppercase tracking-wide text-text-secondary mb-3">
                Current Assets
              </h3>
              {bs.assets.currentAssets.length === 0 ? (
                <p className="font-serif text-body text-muted italic">No current assets</p>
              ) : (
                <div className="space-y-2">
                  {bs.assets.currentAssets.map((item) => (
                    <div key={item.accountCode} className="flex justify-between items-center">
                      <span className="font-serif text-body text-ink">{item.accountName}</span>
                      <span className="font-mono text-data text-ink tabular-nums">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-guide flex justify-between items-center">
                <span className="font-sans text-label uppercase tracking-wide text-text-secondary">
                  Total Current Assets
                </span>
                <span className="font-mono text-data text-ink tabular-nums font-medium">
                  {formatCurrency(bs.assets.totalCurrentAssets)}
                </span>
              </div>
            </div>

            {/* Non-Current Assets */}
            <div className="p-4 border-b border-guide">
              <h3 className="font-sans text-label uppercase tracking-wide text-text-secondary mb-3">
                Non-Current Assets
              </h3>
              {bs.assets.nonCurrentAssets.length === 0 ? (
                <p className="font-serif text-body text-muted italic">No non-current assets</p>
              ) : (
                <div className="space-y-2">
                  {bs.assets.nonCurrentAssets.map((item) => (
                    <div key={item.accountCode} className="flex justify-between items-center">
                      <span className={`font-serif text-body ${item.isContra ? 'text-text-secondary' : 'text-ink'}`}>
                        {item.accountName}
                      </span>
                      <span className={`font-mono text-data tabular-nums ${item.isContra ? 'text-accounting-red' : 'text-ink'}`}>
                        {item.isContra ? '(' : ''}{formatCurrency(item.amount)}{item.isContra ? ')' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-guide flex justify-between items-center">
                <span className="font-sans text-label uppercase tracking-wide text-text-secondary">
                  Total Non-Current Assets
                </span>
                <span className="font-mono text-data text-ink tabular-nums font-medium">
                  {formatCurrency(bs.assets.totalNonCurrentAssets)}
                </span>
              </div>
            </div>

            {/* Total Assets */}
            <div className="px-4 py-4 bg-ivory border-t-2 border-ink">
              <div className="flex justify-between items-center">
                <span className="font-serif text-heading text-ink">Total Assets</span>
                <span className="font-mono text-heading text-ink tabular-nums">
                  {formatCurrency(bs.assets.totalAssets)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Liabilities & Equity Column */}
        <div className="space-y-6">
          {/* Liabilities */}
          <div className="bg-surface border border-guide rounded-paper overflow-hidden">
            <div className="px-4 py-3 bg-ink text-ivory">
              <h2 className="font-serif text-heading">Liabilities</h2>
            </div>

            {/* Current Liabilities */}
            <div className="p-4 border-b border-guide">
              <h3 className="font-sans text-label uppercase tracking-wide text-text-secondary mb-3">
                Current Liabilities
              </h3>
              {bs.liabilities.currentLiabilities.length === 0 ? (
                <p className="font-serif text-body text-muted italic">No current liabilities</p>
              ) : (
                <div className="space-y-2">
                  {bs.liabilities.currentLiabilities.map((item) => (
                    <div key={item.accountCode} className="flex justify-between items-center">
                      <span className="font-serif text-body text-ink">{item.accountName}</span>
                      <span className="font-mono text-data text-ink tabular-nums">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-guide flex justify-between items-center">
                <span className="font-sans text-label uppercase tracking-wide text-text-secondary">
                  Total Current Liabilities
                </span>
                <span className="font-mono text-data text-ink tabular-nums font-medium">
                  {formatCurrency(bs.liabilities.totalCurrentLiabilities)}
                </span>
              </div>
            </div>

            {/* Non-Current Liabilities */}
            <div className="p-4 border-b border-guide">
              <h3 className="font-sans text-label uppercase tracking-wide text-text-secondary mb-3">
                Non-Current Liabilities
              </h3>
              {bs.liabilities.nonCurrentLiabilities.length === 0 ? (
                <p className="font-serif text-body text-muted italic">No non-current liabilities</p>
              ) : (
                <div className="space-y-2">
                  {bs.liabilities.nonCurrentLiabilities.map((item) => (
                    <div key={item.accountCode} className="flex justify-between items-center">
                      <span className="font-serif text-body text-ink">{item.accountName}</span>
                      <span className="font-mono text-data text-ink tabular-nums">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-guide flex justify-between items-center">
                <span className="font-sans text-label uppercase tracking-wide text-text-secondary">
                  Total Non-Current Liabilities
                </span>
                <span className="font-mono text-data text-ink tabular-nums font-medium">
                  {formatCurrency(bs.liabilities.totalNonCurrentLiabilities)}
                </span>
              </div>
            </div>

            {/* Total Liabilities */}
            <div className="px-4 py-3 bg-ivory border-t border-ink">
              <div className="flex justify-between items-center">
                <span className="font-serif text-heading text-ink">Total Liabilities</span>
                <span className="font-mono text-heading text-ink tabular-nums">
                  {formatCurrency(bs.liabilities.totalLiabilities)}
                </span>
              </div>
            </div>
          </div>

          {/* Equity */}
          <div className="bg-surface border border-guide rounded-paper overflow-hidden">
            <div className="px-4 py-3 bg-ink text-ivory">
              <h2 className="font-serif text-heading">Equity</h2>
            </div>

            <div className="p-4">
              {bs.equity.items.length === 0 ? (
                <p className="font-serif text-body text-muted italic">No equity accounts</p>
              ) : (
                <div className="space-y-2">
                  {bs.equity.items.map((item) => (
                    <div key={item.accountCode} className="flex justify-between items-center">
                      <span className={`font-serif text-body ${item.isContra ? 'text-text-secondary' : 'text-ink'}`}>
                        {item.accountName}
                      </span>
                      <span className={`font-mono text-data tabular-nums ${item.isContra ? 'text-accounting-red' : 'text-ink'}`}>
                        {item.isContra ? '(' : ''}{formatCurrency(item.amount)}{item.isContra ? ')' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Equity */}
            <div className="px-4 py-3 bg-ivory border-t border-ink">
              <div className="flex justify-between items-center">
                <span className="font-serif text-heading text-ink">Total Equity</span>
                <span className="font-mono text-heading text-ink tabular-nums">
                  {formatCurrency(bs.equity.totalEquity)}
                </span>
              </div>
            </div>
          </div>

          {/* Total Liabilities & Equity */}
          <div className="bg-surface border-2 border-ink rounded-paper overflow-hidden">
            <div className="px-4 py-4">
              <div className="flex justify-between items-center">
                <span className="font-serif text-heading text-ink">Total Liabilities & Equity</span>
                <span className="font-mono text-heading text-ink tabular-nums">
                  {formatCurrency(bs.totalLiabilitiesAndEquity)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accounting Equation */}
      <div className="mt-8 p-6 border border-guide rounded-paper bg-ivory/50 text-center">
        <h3 className="font-sans text-label uppercase tracking-wide text-text-secondary mb-4">
          The Accounting Equation
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-data text-ink">
          <span className="px-4 py-2 bg-surface border border-guide rounded-paper">
            Assets: {formatCurrency(bs.assets.totalAssets)}
          </span>
          <span className="text-text-secondary">=</span>
          <span className="px-4 py-2 bg-surface border border-guide rounded-paper">
            Liabilities: {formatCurrency(bs.liabilities.totalLiabilities)}
          </span>
          <span className="text-text-secondary">+</span>
          <span className="px-4 py-2 bg-surface border border-guide rounded-paper">
            Equity: {formatCurrency(bs.equity.totalEquity)}
          </span>
        </div>
      </div>
    </section>
  );
};
