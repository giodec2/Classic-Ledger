import { createContext, useContext, type ReactNode } from 'react';
import { useNavigation } from '@/hooks/NavigationContext';
import { useManagerial, type ManagerialContextType } from '@/hooks/useManagerial';

const ManagerialContext = createContext<ManagerialContextType | null>(null);

export function ManagerialProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const { route } = useNavigation();
  const managerial = useManagerial(userId, route.mode === 'managerial', route.mode === 'managerial' ? route.workbookId : null);
  return <ManagerialContext.Provider value={managerial}>{children}</ManagerialContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useManagerialContext(): ManagerialContextType {
  const context = useContext(ManagerialContext);
  if (!context) throw new Error('useManagerialContext must be used within a ManagerialProvider');
  return context;
}
