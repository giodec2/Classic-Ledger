import { PAGES } from '@/router/pages';
import { useNavigation } from '@/hooks/NavigationContext';
import { Footer } from '@/sections/Footer';

export const AppRouter = () => {
  const { route } = useNavigation();
  const page = PAGES[route.view];
  const Page = page.component;

  return (
    <>
      <Page
        key={`${route.view}|${route.workbookId ?? ''}|${route.academyModule ?? ''}`}
      />
      {page.showFooter && <Footer />}
    </>
  );
};
