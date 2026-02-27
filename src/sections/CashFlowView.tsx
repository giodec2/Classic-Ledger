import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useLedgerContext } from '@/hooks/LedgerContext';
import { formatCurrency, type CashFlowStatement } from '@/types/accounting';
import { Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadAsImage } from '@/lib/downloadImage';

interface CashFlowSectionProps {
  title: string;
  items: { description: string; amount: number; isInflow: boolean }[];
  total: number;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

const CashFlowSection = ({ title, items, total, bgColor, borderColor, icon }: CashFlowSectionProps) => {
  return (
    <div className="bg-surface border border-guide rounded-paper overflow-hidden">
      <div className={`px-4 py-3 ${bgColor} border-b ${borderColor}`}>
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-serif text-heading">{title}</h2>
        </div>
      </div>

      <div className="p-4">
        {items.length === 0 ? (
          <p className="font-serif text-body text-muted italic">No activities recorded</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {item.isInflow ? (
                    <ArrowDownLeft className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-accounting-red" />
                  )}
                  <span className="font-serif text-body text-ink">{item.description}</span>
                </div>
                <span className={`font-mono text-data tabular-nums ${item.isInflow ? 'text-green-600' : 'text-accounting-red'}`}>
                  {item.isInflow ? '+' : '-'}{formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-ivory border-t border-guide">
        <div className="flex justify-between items-center">
          <span className="font-sans text-label uppercase tracking-wide text-text-secondary">
            Net {title}
          </span>
          <span className={`font-mono text-data tabular-nums font-medium ${total >= 0 ? 'text-green-600' : 'text-accounting-red'
            }`}>
            {total >= 0 ? '+' : ''}{formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
};

export const CashFlowView = () => {
  const { currentWorkbook, currentWorkbookId, generateCashFlowStatement } = useLedgerContext();
  const [cashFlow, setCashFlow] = useState<CashFlowStatement | null>(null);

  const titleRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Generate cash flow statement when component mounts
  useEffect(() => {
    if (currentWorkbookId) {
      const cf = generateCashFlowStatement(currentWorkbookId);
      setCashFlow(cf);
    }
  }, [currentWorkbookId, currentWorkbook, generateCashFlowStatement]);

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo(titleRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
        .fromTo(sectionsRef.current?.children || [],
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
          '-=0.3'
        )
        .fromTo(summaryRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5 },
          '-=0.2'
        );
    });

    return () => ctx.revert();
  }, [cashFlow]);

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

  if (!cashFlow) {
    return (
      <section id="cash-flow-view" className="min-h-screen pt-28 pb-8 px-[8vw]">
        <div className="flex items-center justify-center h-64">
          <p className="font-serif text-body text-text-secondary">
            Generating cash flow statement...
          </p>
        </div>
      </section>
    );
  }

  const netChangePositive = cashFlow.netChangeInCash >= 0;

  return (
    <section id="cash-flow-view" className="min-h-screen pt-28 pb-8 px-[8vw] bg-ivory">
      {/* Title */}
      <div ref={titleRef} className="text-center mb-8 relative">
        <div className="absolute right-0 top-0">
          <Button
            variant="outline"
            className="gap-2 font-serif"
            onClick={() => downloadAsImage('cash-flow-view', 'cash-flow')}
          >
            <Download className="w-4 h-4" />
            Download Image
          </Button>
        </div>
        <div className="flex items-center justify-center gap-3 mb-2">
          <Wallet className="w-8 h-8 text-ink" />
          <h1 className="font-display text-display text-ink tracking-tight">
            Cash Flow Statement
          </h1>
        </div>
        <p className="font-sans text-label uppercase tracking-wide text-text-secondary">
          Statement of Cash Flows
        </p>
      </div>

      {/* Cash Flow Sections */}
      <div ref={sectionsRef} className="max-w-4xl mx-auto space-y-6">
        {/* Operating Activities */}
        <CashFlowSection
          title="Operating Activities"
          items={cashFlow.operatingActivities}
          total={cashFlow.netOperatingCashFlow}
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
        />

        {/* Investing Activities */}
        <CashFlowSection
          title="Investing Activities"
          items={cashFlow.investingActivities}
          total={cashFlow.netInvestingCashFlow}
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
          icon={<TrendingDown className="w-5 h-5 text-purple-600" />}
        />

        {/* Financing Activities */}
        <CashFlowSection
          title="Financing Activities"
          items={cashFlow.financingActivities}
          total={cashFlow.netFinancingCashFlow}
          bgColor="bg-orange-50"
          borderColor="border-orange-200"
          icon={<Wallet className="w-5 h-5 text-orange-600" />}
        />

        {/* Summary */}
        <div ref={summaryRef} className="bg-surface border-2 border-ink rounded-paper overflow-hidden">
          <div className="px-4 py-3 bg-ink text-ivory">
            <h2 className="font-serif text-heading">Cash Flow Summary</h2>
          </div>

          <div className="p-4 space-y-3">
            {/* Beginning Cash */}
            <div className="flex justify-between items-center py-2 border-b border-guide">
              <span className="font-serif text-body text-ink">Beginning Cash Balance</span>
              <span className="font-mono text-data text-ink tabular-nums">
                {formatCurrency(cashFlow.beginningCash)}
              </span>
            </div>

            {/* Net Change */}
            <div className="flex justify-between items-center py-2 border-b border-guide">
              <div className="flex items-center gap-2">
                {netChangePositive ? (
                  <ArrowDownLeft className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-accounting-red" />
                )}
                <span className="font-serif text-body text-ink">Net Change in Cash</span>
              </div>
              <span className={`font-mono text-data tabular-nums font-medium ${netChangePositive ? 'text-green-600' : 'text-accounting-red'
                }`}>
                {netChangePositive ? '+' : ''}{formatCurrency(cashFlow.netChangeInCash)}
              </span>
            </div>

            {/* Ending Cash */}
            <div className="flex justify-between items-center py-3 bg-ivory -mx-4 px-4">
              <div className="flex items-center gap-2">
                <Wallet className={`w-5 h-5 ${cashFlow.endingCash >= 0 ? 'text-green-600' : 'text-accounting-red'}`} />
                <span className="font-serif text-heading text-ink">Ending Cash Balance</span>
              </div>
              <span className={`font-mono text-heading tabular-nums ${cashFlow.endingCash >= 0 ? 'text-green-600' : 'text-accounting-red'
                }`}>
                {formatCurrency(cashFlow.endingCash)}
              </span>
            </div>
          </div>
        </div>

        {/* Cash Position Indicator */}
        <div className={`p-6 rounded-paper text-center ${cashFlow.endingCash > 0 ? 'bg-green-50 border border-green-200' :
            cashFlow.endingCash === 0 ? 'bg-guide/30 border border-guide' :
              'bg-pale-red border border-accounting-red/30'
          }`}>
          <div className="flex items-center justify-center gap-3 mb-2">
            {cashFlow.endingCash > 0 ? (
              <TrendingUp className="w-8 h-8 text-green-600" />
            ) : cashFlow.endingCash === 0 ? (
              <Minus className="w-8 h-8 text-text-secondary" />
            ) : (
              <TrendingDown className="w-8 h-8 text-accounting-red" />
            )}
            <span className={`font-display text-heading ${cashFlow.endingCash > 0 ? 'text-green-700' :
                cashFlow.endingCash === 0 ? 'text-text-secondary' :
                  'text-accounting-red'
              }`}>
              {cashFlow.endingCash > 0 ? 'Positive Cash Position' :
                cashFlow.endingCash === 0 ? 'Break-Even Cash Position' :
                  'Negative Cash Position'}
            </span>
          </div>
          <p className={`font-serif text-body ${cashFlow.endingCash > 0 ? 'text-green-600' :
              cashFlow.endingCash === 0 ? 'text-text-secondary' :
                'text-accounting-red'
            }`}>
            {cashFlow.endingCash > 0
              ? `Your business has a positive cash balance of ${formatCurrency(cashFlow.endingCash)}`
              : cashFlow.endingCash === 0
                ? 'Your business has no cash balance'
                : `Your business has a negative cash balance of ${formatCurrency(Math.abs(cashFlow.endingCash))}`
            }
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-8 max-w-4xl mx-auto p-4 border border-guide rounded-paper bg-ivory/50">
        <h3 className="font-sans text-label uppercase tracking-wide text-text-secondary mb-3">
          About the Cash Flow Statement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-serif text-body text-text-secondary">
          <div>
            <strong className="text-ink">Operating Activities</strong>
            <p className="mt-1">
              Cash flows from core business operations: sales, purchases, and expenses.
            </p>
          </div>
          <div>
            <strong className="text-ink">Investing Activities</strong>
            <p className="mt-1">
              Cash flows from buying/selling long-term assets: equipment, property, investments.
            </p>
          </div>
          <div>
            <strong className="text-ink">Financing Activities</strong>
            <p className="mt-1">
              Cash flows from funding: loans, equity, dividends, owner contributions.
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-guide">
          <strong className="text-ink">Formula:</strong>
          <p className="font-mono text-data mt-1">
            Operating + Investing + Financing = Net Change in Cash
          </p>
        </div>
      </div>
    </section>
  );
};
