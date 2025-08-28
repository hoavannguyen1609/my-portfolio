import type { FC } from 'react';

import type { AppLayoutProps } from '@/types/components';
import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  return (
    <>
      <AppHeader />
      {children}
      <AppFooter />
    </>
  );
};

export default AppLayout;
