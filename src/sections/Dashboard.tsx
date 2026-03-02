import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useLedgerContext } from '@/hooks/LedgerContext';
import { Plus, BookOpen, Trash2, Clock, CheckCircle2, AlertCircle, FileText, Settings2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatShortDate } from '@/types/accounting';

export const Dashboard = () => {
  const { workbooks, createWorkbook, deleteWorkbook, selectWorkbook, setCurrentView } = useLedgerContext();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkbookName, setNewWorkbookName] = useState('');
  const [newWorkbookDesc, setNewWorkbookDesc] = useState('');
  const [workbookToDelete, setWorkbookToDelete] = useState<string | null>(null);

  const greetingRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const newCardRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo(greetingRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.45 }
      )
        .fromTo(subheadRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.45 },
          '-=0.30'
        )
        .fromTo(dateRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.45 },
          '-=0.35'
        )
        .fromTo(newCardRef.current,
          { opacity: 0, y: 24, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.55 },
          '-=0.40'
        )
        .fromTo(listRef.current?.children || [],
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
          '-=0.35'
        );
    });

    return () => ctx.revert();
  }, []);

  const handleCreateWorkbook = () => {
    if (newWorkbookName.trim()) {
      createWorkbook(newWorkbookName.trim(), newWorkbookDesc.trim() || undefined);
      setNewWorkbookName('');
      setNewWorkbookDesc('');
      setIsCreateDialogOpen(false);
    }
  };

  const currentDate = formatShortDate(new Date());

  return (
    <section className="min-h-screen pt-32 pb-16 px-[8vw]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="space-y-6">
            <h1
              ref={greetingRef}
              className="font-display text-display-lg text-ink tracking-tight"
            >
              Classic Ledger
            </h1>
            <p
              ref={subheadRef}
              className="font-serif text-body text-text-secondary max-w-md"
            >
              Your ledger desk. Open a workbook to begin recording transactions with precision.
            </p>

            {/* Learn Section Entry Point */}
            <div ref={dateRef} className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => setCurrentView('learning')}
                className="inline-flex items-center gap-3 px-5 py-3 bg-surface border border-guide rounded-paper hover:border-orange-400 text-text-secondary transition-all group shadow-sm hover:shadow-md w-full max-w-sm"
              >
                <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <span className="block font-sans text-label uppercase tracking-wide group-hover:text-orange-600 transition-colors text-ink">Learn Basics</span>
                  <span className="block font-serif text-[13px] text-text-secondary group-hover:text-orange-600/80 transition-colors">Accounting 101 guide</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('journal-learning')}
                className="inline-flex items-center gap-3 px-5 py-3 bg-surface border border-guide rounded-paper hover:border-blue-400 text-text-secondary transition-all group shadow-sm hover:shadow-md w-full max-w-sm"
              >
                <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <span className="block font-sans text-label uppercase tracking-wide group-hover:text-blue-600 transition-colors text-ink">Journal Entries</span>
                  <span className="block font-serif text-[13px] text-text-secondary group-hover:text-blue-600/80 transition-colors">Deep dive into Dr & Cr</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('adjusting-learning')}
                className="inline-flex items-center gap-3 px-5 py-3 bg-surface border border-guide rounded-paper hover:border-emerald-400 text-text-secondary transition-all group shadow-sm hover:shadow-md w-full max-w-sm"
              >
                <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                  <Settings2 className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <span className="block font-sans text-label uppercase tracking-wide group-hover:text-emerald-600 transition-colors text-ink">Adjusting Entries</span>
                  <span className="block font-serif text-[13px] text-text-secondary group-hover:text-emerald-600/80 transition-colors">Accruals & Deferrals</span>
                </div>
              </button>
            </div>

            <div className="font-mono text-data text-text-secondary pt-8 border-t border-guide w-1/2">
              {currentDate}
            </div>
          </div>

          {/* Right column - Workbooks */}
          <div className="space-y-6">
            {/* New Workbook Card */}
            <button
              ref={newCardRef}
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-full h-40 border border-dashed border-ink/30 rounded-paper flex flex-col items-center justify-center gap-4 hover:border-ink hover:bg-surface transition-all group"
            >
              <div className="w-12 h-12 rounded-full border border-ink/20 flex items-center justify-center group-hover:border-ink group-hover:bg-ink group-hover:text-ivory transition-all">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-sans text-label uppercase tracking-wide text-text-secondary group-hover:text-ink">
                New Workbook
              </span>
            </button>

            {/* Workbook List */}
            <div ref={listRef} className="space-y-3">
              {workbooks.length === 0 ? (
                <div className="text-center py-8 text-text-secondary font-serif text-body">
                  No workbooks yet. Create your first ledger to get started.
                </div>
              ) : (
                workbooks.map((workbook) => (
                  <div
                    key={workbook.id}
                    onClick={() => selectWorkbook(workbook.id)}
                    className="group p-5 border border-guide rounded-paper bg-ivory hover:bg-surface hover:border-ink cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-text-secondary" />
                          <h3 className="font-serif text-heading text-ink">
                            {workbook.name}
                          </h3>
                        </div>
                        {workbook.description && (
                          <p className="font-serif text-body text-text-secondary pl-7">
                            {workbook.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 pl-7">
                          <div className="flex items-center gap-1.5 font-mono text-micro text-muted">
                            <Clock className="w-3 h-3" />
                            {workbook.updatedAt.toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className={`flex items-center gap-1.5 font-mono text-micro ${workbook.isBalanced ? 'text-green-600' : 'text-accounting-red'
                            }`}>
                            {workbook.isBalanced ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Balanced
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3" />
                                Unbalanced
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setWorkbookToDelete(workbook.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-text-secondary hover:text-accounting-red transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Workbook Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-surface border-ink/20 rounded-paper">
          <DialogHeader>
            <DialogTitle className="font-display text-display text-ink">
              New Workbook
            </DialogTitle>
            <DialogDescription className="font-serif text-body text-text-secondary">
              Create a new ledger workbook for your accounting practice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-2">
                Name
              </label>
              <Input
                value={newWorkbookName}
                onChange={(e) => setNewWorkbookName(e.target.value)}
                placeholder="e.g., Accounting 101 - Homework 1"
                className="font-serif text-body border-guide focus:border-ink rounded-paper"
                autoFocus
              />
            </div>
            <div>
              <label className="font-sans text-label uppercase tracking-wide text-text-secondary block mb-2">
                Description (optional)
              </label>
              <Input
                value={newWorkbookDesc}
                onChange={(e) => setNewWorkbookDesc(e.target.value)}
                placeholder="Brief description of this workbook"
                className="font-serif text-body border-guide focus:border-ink rounded-paper"
              />
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
                onClick={handleCreateWorkbook}
                disabled={!newWorkbookName.trim()}
                className="flex-1 font-sans text-label uppercase tracking-wide bg-ink text-ivory hover:bg-ink/90"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!workbookToDelete} onOpenChange={() => setWorkbookToDelete(null)}>
        <DialogContent className="bg-surface border-ink/20 rounded-paper">
          <DialogHeader>
            <DialogTitle className="font-display text-display text-ink">
              Delete Workbook
            </DialogTitle>
            <DialogDescription className="font-serif text-body text-text-secondary">
              Are you sure you want to delete this workbook? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setWorkbookToDelete(null)}
              className="flex-1 font-sans text-label uppercase tracking-wide border-guide hover:bg-guide/30"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (workbookToDelete) {
                  deleteWorkbook(workbookToDelete);
                  setWorkbookToDelete(null);
                }
              }}
              className="flex-1 font-sans text-label uppercase tracking-wide bg-accounting-red text-white hover:bg-accounting-red/90"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
