import type { EffectCallback, FC, MouseEvent } from 'react';

import type { AppLayoutProps } from '@/types/components';

import { clsx } from 'clsx';
import { useEffect, useRef } from 'react';

import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';

import cssModuleClasses from './AppLayout.module.scss';

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const btnBackToTopRef = useRef<HTMLButtonElement>(null);

  const handleEventWindowScroll = (): void => {
    if (btnBackToTopRef.current) {
      if (window.scrollY > 300) {
        btnBackToTopRef.current.classList.add(cssModuleClasses['show']);
      } else {
        btnBackToTopRef.current.classList.remove(cssModuleClasses['show']);
      }
    }
  };

  const handleBackTopTop = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    e.stopPropagation();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect((): ReturnType<EffectCallback> => {
    window.addEventListener('scroll', handleEventWindowScroll);

    return () => {
      window.removeEventListener('scroll', handleEventWindowScroll);
    };
  }, []);

  return (
    <>
      <AppHeader />
      {children}
      <AppFooter />

      <button
        onClick={handleBackTopTop}
        ref={btnBackToTopRef}
        className={clsx(
          'fixed text-white flex justify-between items-center cursor-pointer bottom-6 right-6 md:bottom-8 md:right-8 text-xl opacity-0',
          cssModuleClasses['btn_back-to-top'],
        )}
      >
        <FontAwesomeIcon icon={faArrowUp} />
      </button>
    </>
  );
};

export default AppLayout;
