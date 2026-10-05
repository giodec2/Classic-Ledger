import { createContext, useContext, type ReactNode } from 'react';
import { useLedger, type LedgerContextType } from './useLedger';
import { useNavigation } from './NavigationContext';

const LedgerContext = createContext<LedgerContextType | null>(null);

export const LedgerProvider = ({ children, userId }: { children: ReactNode; userId: string }) => {
  const { route } = useNavigation();
  const ledger = useLedger(userId, route.mode === 'financial' ? route.workbookId : null);

  return (
    <LedgerContext.Provider value={ledger}>
      {children}
    </LedgerContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLedgerContext = (): LedgerContextType => {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error('useLedgerContext must be used within a LedgerProvider');
  }
  return context;
};
