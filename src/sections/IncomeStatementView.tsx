import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useLedgerContext } from '@/hooks/LedgerContext';
import { formatCurrency, type IncomeStatement } from '@/types/accounting';
import { TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadAsImage } from '@/lib/downloadImage';

// Default empty income statement
const emptyIncomeStatement: IncomeStatement = {
  revenues: [],
  totalRevenue: 0,
  expenses: [],
  totalExpenses: 0,
  grossProfit: 0,
  operatingIncome: 0,
  netIncome: 0,
};

export const IncomeStatementView = () => {
  const { currentWorkbook, currentWorkbookId, generateIncomeStatement } = useLedgerContext();
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement>(emptyIncomeStatement);
  const [isLoading, setIsLoading] = useState(true);

  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Generate income statement when component mounts
  useEffect(() => {
    if (currentWorkbookId) {
      try {
        const is = generateIncomeStatement(currentWorkbookId);
        setIncomeStatement(is || emptyIncomeStatement);
      } catch (error) {
        console.error('Error generating income statement:', error);
        setIncomeStatement(emptyIncomeStatement);
      }
    }
    setIsLoading(false);
  }, [currentWorkbookId, currentWorkbook, generateIncomeStatement]);

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
      <section id="income-statement-view" className="min-h-screen pt-28 pb-8 px-[8vw]">
        <div className="flex items-center justify-center h-64">
          <p className="font-serif text-body text-text-secondary">
            Generating income statement...
          </p>
        </div>
      </section>
    );
  }

  const is = incomeStatement || emptyIncomeStatement;
  const isProfitable = is.netIncome >= 0;

  return (
    <section id="income-statement-view" className="min-h-screen pt-28 pb-8 px-[8vw] bg-ivory">
      {/* Title */}
      <div ref={titleRef} className="text-center mb-8 relative">
        <div className="absolute right-0 top-0">
          <Button
            variant="outline"
            className="gap-2 font-serif"
            onClick={() => downloadAsImage('income-statement-view', 'income-statement')}
          >
            <Download className="w-4 h-4" />
            Download Image
          </Button>
        </div>
        <div className="flex items-center justify-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8 text-ink" />
          <h1 className="font-display text-display text-ink tracking-tight">
            Income Statement
          </h1>
        </div>
        <p className="font-sans text-label uppercase tracking-wide text-text-secondary">
          Statement of Financial Performance
        </p>
      </div>

      {/* Income Statement */}
      <div ref={contentRef} className="max-w-3xl mx-auto space-y-6">
        {/* Revenues Section */}
        <div className="bg-surface border border-guide rounded-paper overflow-hidden">
          <div className="px-4 py-3 bg-green-50 border-b border-green-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="font-serif text-heading text-green-800">Revenues</h2>
            </div>
          </div>

          <div className="p-4">
            {is.revenues.length === 0 ? (
              <p className="font-serif text-body text-muted italic">No revenue accounts</p>
            ) : (
              <div className="space-y-2">
                {is.revenues.map((item) => (
                  <div key={item.accountCode} className="flex justify-between items-center">
                    <span className="font-serif text-body text-ink">{item.accountName}</span>
                    <span className="font-mono text-data text-ink tabular-nums">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-3 bg-ivory border-t border-guide">
            <div className="flex justify-between items-center">
              <span className="font-sans text-label uppercase tracking-wide text-text-secondary">
                Total Revenue
              </span>
              <span className="font-mono text-data text-green-600 tabular-nums font-medium">
                {formatCurrency(is.totalRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="bg-surface border border-guide rounded-paper overflow-hidden">
          <div className="px-4 py-3 bg-accounting-red/10 border-b border-accounting-red/20">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-accounting-red" />
              <h2 className="font-serif text-heading text-accounting-red">Expenses</h2>
            </div>
          </div>

          <div className="p-4">
            {is.expenses.length === 0 ? (
              <p className="font-serif text-body text-muted italic">No expense accounts</p>
            ) : (
              <div className="space-y-2">
                {is.expenses.map((item) => (
                  <div key={item.accountCode} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-body text-ink">{item.accountName}</span>
                      {!item.isOperating && (
                        <span className="font-sans text-[10px] uppercase tracking-wide text-text-secondary bg-guide/50 px-2 py-0.5 rounded">
                          Non-Operating
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-data text-ink tabular-nums">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-3 bg-ivory border-t border-guide">
            <div className="flex justify-between items-center">
              <span className="font-sans text-label uppercase tracking-wide text-text-secondary">
                Total Expenses
              </span>
              <span className="font-mono text-data text-accounting-red tabular-nums font-medium">
                {formatCurrency(is.totalExpenses)}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-surface border-2 border-ink rounded-paper overflow-hidden">
          <div className="px-4 py-3 bg-ink text-ivory">
            <h2 className="font-serif text-heading">Summary</h2>
          </div>

          <div className="p-4 space-y-3">
            {/* Gross Profit */}
            <div className="flex justify-between items-center py-2 border-b border-guide">
              <span className="font-serif text-body text-ink">Gross Profit</span>
              <span className="font-mono text-data text-ink tabular-nums">
                {formatCurrency(is.grossProfit)}
              </span>
            </div>

            {/* Operating Income */}
            <div className="flex justify-between items-center py-2 border-b border-guide">
              <span className="font-serif text-body text-ink">Operating Income</span>
              <span className="font-mono text-data text-ink tabular-nums">
                {formatCurrency(is.operatingIncome)}
              </span>
            </div>

            {/* Net Income */}
            <div className="flex justify-between items-center py-3 bg-ivory -mx-4 px-4">
              <div className="flex items-center gap-2">
                <DollarSign className={`w-5 h-5 ${isProfitable ? 'text-green-600' : 'text-accounting-red'}`} />
                <span className="font-serif text-heading text-ink">
                  Net Income {isProfitable ? '(Profit)' : '(Loss)'}
                </span>
              </div>
              <span className={`font-mono text-heading tabular-nums ${isProfitable ? 'text-green-600' : 'text-accounting-red'}`}>
                {isProfitable ? '' : '('}{formatCurrency(Math.abs(is.netIncome))}{isProfitable ? '' : ')'}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className={`p-6 rounded-paper text-center ${isProfitable ? 'bg-green-50 border border-green-200' : 'bg-pale-red border border-accounting-red/30'
          }`}>
          <div className="flex items-center justify-center gap-3 mb-2">
            {isProfitable ? (
              <TrendingUp className="w-8 h-8 text-green-600" />
            ) : (
              <TrendingDown className="w-8 h-8 text-accounting-red" />
            )}
            <span className={`font-display text-heading ${isProfitable ? 'text-green-700' : 'text-accounting-red'}`}>
              {isProfitable ? 'Profitable' : 'Loss'}
            </span>
          </div>
          <p className={`font-serif text-body ${isProfitable ? 'text-green-600' : 'text-accounting-red'}`}>
            {isProfitable
              ? `Your business generated a profit of ${formatCurrency(is.netIncome)}`
              : `Your business incurred a loss of ${formatCurrency(Math.abs(is.netIncome))}`
            }
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-8 max-w-3xl mx-auto p-4 border border-guide rounded-paper bg-ivory/50">
        <h3 className="font-sans text-label uppercase tracking-wide text-text-secondary mb-3">
          About the Income Statement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-serif text-body text-text-secondary">
          <div>
            <strong className="text-ink">Key Components:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><strong>Revenue:</strong> Income from operations</li>
              <li><strong>Expenses:</strong> Costs incurred</li>
              <li><strong>Gross Profit:</strong> Revenue minus COGS</li>
              <li><strong>Net Income:</strong> Final profit/loss</li>
            </ul>
          </div>
          <div>
            <strong className="text-ink">Formula:</strong>
            <p className="mt-1 font-mono text-data">
              Revenue - Expenses = Net Income
            </p>
            <p className="mt-2">
              A positive result indicates profit, while negative indicates a loss.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
