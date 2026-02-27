import { createContext, useContext, type ReactNode } from 'react';
import { useLedger, type LedgerContextType } from './useLedger';

const LedgerContext = createContext<LedgerContextType | null>(null);

export const LedgerProvider = ({ children, userId }: { children: ReactNode; userId: string }) => {
  const ledger = useLedger(userId);

  return (
    <LedgerContext.Provider value={ledger}>
      {children}
    </LedgerContext.Provider>
  );
};

export const useLedgerContext = (): LedgerContextType => {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error('useLedgerContext must be used within a LedgerProvider');
  }
  return context;
};
