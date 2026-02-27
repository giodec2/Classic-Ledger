import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useLedgerContext } from '@/hooks/LedgerContext';
import { formatCurrency, formatDate, type RunningBalanceItem } from '@/types/accounting';
import { Plus, Trash2, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RunningBalanceCardProps {
  item: RunningBalanceItem;
  onExpire: (entryId: string) => void;
  onDelete: () => void;
}

const RunningBalanceCard = ({ item, onExpire, onDelete }: RunningBalanceCardProps) => {
  const expiredCount = item.entries.filter(e => e.isExpired).length;
  const progress = (expiredCount / item.totalPeriods) * 100;

  return (
    <div className="bg-surface border border-guide rounded-paper overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-ink bg-ivory">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-serif text-heading text-ink">
              {item.name}
            </h3>
            <p className="font-mono text-micro text-text-secondary mt-1">
              {item.description}
            </p>
          </div>
          <button
            onClick={onDelete}
            className="p-1.5 text-muted hover:text-accounting-red transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="px-4 py-3 border-b border-guide">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-1">
              Original
            </span>
            <span className="font-mono text-data text-ink tabular-nums">
              {formatCurrency(item.originalAmount)}
            </span>
          </div>
          <div>
            <span className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-1">
              Expired
            </span>
            <span className="font-mono text-data text-accounting-red tabular-nums">
              {formatCurrency(item.expiredAmount)}
            </span>
          </div>
          <div>
            <span className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-1">
              Remaining
            </span>
            <span className="font-mono text-data text-green-600 tabular-nums">
              {formatCurrency(item.remainingBalance)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="h-2 bg-guide rounded-full overflow-hidden">
            <div 
              className="h-full bg-accounting-red transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-micro text-text-secondary">
              {expiredCount} of {item.totalPeriods} periods expired
            </span>
            <span className="font-mono text-micro text-text-secondary">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Periods */}
      <div className="px-4 py-3 max-h-48 overflow-y-auto">
        <div className="font-sans text-label uppercase tracking-wide text-text-secondary mb-2">
          Period Schedule
        </div>
        <div className="space-y-1">
          {item.entries.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between py-2 px-3 rounded ${
                entry.isExpired ? 'bg-guide/30' : 'bg-ivory'
              }`}
            >
              <div className="flex items-center gap-3">
                {entry.isExpired ? (
                  <CheckCircle2 className="w-4 h-4 text-accounting-red" />
                ) : (
                  <Clock className="w-4 h-4 text-text-secondary" />
                )}
                <div>
                  <span className="font-mono text-data text-ink">
                    Period {entry.periodNumber}
                  </span>
                  <span className="font-mono text-micro text-text-secondary block">
                    {formatDate(entry.periodStartDate)} - {formatDate(entry.periodEndDate)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-data text-ink tabular-nums">
                  {formatCurrency(entry.amount)}
                </span>
                {!entry.isExpired && !item.isFullyExpired && (
                  <button
                    onClick={() => onExpire(entry.id)}
                    className="px-3 py-1 bg-ink text-ivory font-sans text-[10px] uppercase tracking-wide rounded-paper hover:bg-ink/90 transition-colors"
                  >
                    Expire
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      {item.isFullyExpired && (
        <div className="px-4 py-2 bg-accounting-red/10 border-t border-accounting-red/20">
          <span className="font-sans text-label uppercase tracking-wide text-accounting-red">
            Fully Expired
          </span>
        </div>
      )}
    </div>
  );
};

export const RunningBalance = () => {
  const { currentWorkbook, currentWorkbookId, createRunningBalance, expireRunningBalancePeriod, deleteRunningBalance } = useLedgerContext();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    originalAmount: '',
    startDate: '',
    endDate: '',
    periodType: 'month' as 'month' | 'quarter' | 'year',
  });

  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo(headerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
      .fromTo(gridRef.current?.children || [],
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
        '-=0.3'
      );
    });

    return () => ctx.revert();
  }, [currentWorkbook?.runningBalances.length]);

  const handleCreate = () => {
    if (currentWorkbookId && newItem.name && newItem.originalAmount && newItem.startDate && newItem.endDate) {
      createRunningBalance(
        currentWorkbookId,
        newItem.name,
        newItem.description,
        parseFloat(newItem.originalAmount),
        newItem.startDate,
        newItem.endDate,
        newItem.periodType
      );
      setNewItem({
        name: '',
        description: '',
        originalAmount: '',
        startDate: '',
        endDate: '',
        periodType: 'month',
      });
      setIsCreateDialogOpen(false);
    }
  };

  const handleExpire = (runningBalanceId: string, entryId: string) => {
    if (currentWorkbookId) {
      expireRunningBalancePeriod(currentWorkbookId, runningBalanceId, entryId);
    }
  };

  const handleDelete = (runningBalanceId: string) => {
    if (currentWorkbookId) {
      deleteRunningBalance(currentWorkbookId, runningBalanceId);
    }
  };

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
      <div ref={headerRef} className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-display text-ink tracking-tight">
            Running Balance
          </h1>
          <p className="font-serif text-body text-text-secondary mt-2">
            Track prepaid expenses, warranties, and amortizing assets over time.
          </p>
        </div>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-ink text-ivory font-sans text-label uppercase tracking-wide rounded-paper hover:bg-ink/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Item
        </button>
      </div>

      {/* Running Balance Grid */}
      {currentWorkbook.runningBalances.length === 0 ? (
        <div className="flex items-center justify-center h-64 border border-dashed border-guide rounded-paper">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="font-serif text-body text-text-secondary mb-2">
              No running balances yet.
            </p>
            <p className="font-serif text-body text-muted">
              Create one to track prepaid expenses, warranties, or amortizing assets.
            </p>
          </div>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentWorkbook.runningBalances.map((item) => (
            <RunningBalanceCard
              key={item.id}
              item={item}
              onExpire={(entryId) => handleExpire(item.id, entryId)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-surface border-ink/20 rounded-paper max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-heading text-ink">
              New Running Balance
            </DialogTitle>
            <DialogDescription className="font-serif text-body text-text-secondary">
              Track prepaid expenses, warranties, or any asset that expires over time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-2">
                Name
              </label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g., Annual Insurance Premium"
                className="font-serif text-body border-guide focus:border-ink rounded-paper"
              />
            </div>
            <div>
              <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-2">
                Description
              </label>
              <Input
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Optional description"
                className="font-serif text-body border-guide focus:border-ink rounded-paper"
              />
            </div>
            <div>
              <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-2">
                Original Amount
              </label>
              <Input
                type="number"
                value={newItem.originalAmount}
                onChange={(e) => setNewItem({ ...newItem, originalAmount: e.target.value })}
                placeholder="0.00"
                className="font-mono text-body border-guide focus:border-ink rounded-paper"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={newItem.startDate}
                  onChange={(e) => setNewItem({ ...newItem, startDate: e.target.value })}
                  className="font-mono text-body border-guide focus:border-ink rounded-paper"
                />
              </div>
              <div>
                <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={newItem.endDate}
                  onChange={(e) => setNewItem({ ...newItem, endDate: e.target.value })}
                  className="font-mono text-body border-guide focus:border-ink rounded-paper"
                />
              </div>
            </div>
            <div>
              <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-2">
                Period Type
              </label>
              <Select
                value={newItem.periodType}
                onValueChange={(value: 'month' | 'quarter' | 'year') => 
                  setNewItem({ ...newItem, periodType: value })
                }
              >
                <SelectTrigger className="border-guide focus:border-ink rounded-paper">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="quarter">Quarterly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="flex-1 font-sans text-label uppercase tracking-wide border-guide hover:bg-guide/30"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!newItem.name || !newItem.originalAmount || !newItem.startDate || !newItem.endDate}
                className="flex-1 font-sans text-label uppercase tracking-wide bg-ink text-ivory hover:bg-ink/90"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Explanation */}
      <div className="mt-8 p-4 border border-guide rounded-paper bg-ivory/50">
        <h3 className="font-sans text-label uppercase tracking-wide text-text-secondary mb-3">
          About Running Balance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-serif text-body text-text-secondary">
          <div>
            <strong className="text-ink">Common Uses:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Prepaid insurance premiums</li>
              <li>Warranty liabilities</li>
              <li>Subscription services</li>
              <li>Lease payments</li>
            </ul>
          </div>
          <div>
            <strong className="text-ink">How it Works:</strong>
            <p className="mt-1">
              The original amount is divided equally across the specified periods. 
              As each period expires, you mark it as expired to track the remaining balance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
