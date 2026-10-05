import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { buildHash, modeForView, parseHash, type AcademyModuleId, type AppRoute } from '@/lib/routes';
import type { CourseMode } from '@/types/managerial';
import type { ViewMode } from '@/types/accounting';

export interface NavigateOptions {
  workbookId?: string | null;
  academyModule?: AcademyModuleId | null;
  replace?: boolean;
}

export interface NavigationContextType {
  route: AppRoute;
  view: ViewMode;
  mode: CourseMode;
  switchMode: (mode: CourseMode) => void;
  navigate: (view: ViewMode, opts?: NavigateOptions) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [route, setRoute] = useState<AppRoute>(() => parseHash(window.location.hash));

  useEffect(() => {
    const sync = () => {
      const next = parseHash(window.location.hash);
      setRoute(next);
      const canonical = buildHash(next);
      if (canonical !== window.location.hash) {
        window.history.replaceState(null, '', canonical);
      }
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const navigate = useCallback((view: ViewMode, opts: NavigateOptions = {}) => {
    const hash = buildHash({
      view,
      mode: modeForView(view),
      workbookId: opts.workbookId ?? null,
      academyModule: opts.academyModule ?? null,
    });
    if (hash === window.location.hash) return;
    if (opts.replace) {
      window.history.replaceState(null, '', hash);
      setRoute(parseHash(hash));
    } else {
      window.location.hash = hash;
    }
  }, []);

  const switchMode = useCallback((mode: CourseMode) => {
    navigate(mode === 'managerial' ? 'managerial-dashboard' : 'dashboard');
  }, [navigate]);

  return (
    <NavigationContext.Provider value={{ route, view: route.view, mode: route.mode, switchMode, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
