import { ConfigProvider } from 'antd';
import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RouterProvider } from 'react-router';

import viLocale from 'antd/locale/vi_VN';

import { AppLayout } from './components/AppLayout';
import { firebaseConfig } from './config/firebase';
import { ACCESS_TOKEN_KEY, COLOR_PRIMARY, LANGUAGE_KEY, LANGUAGE_VI } from './constants';
import { privateRouters, publicRouters } from './routers';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    getAnalytics(initializeApp(firebaseConfig));

    const localLanguage = window.localStorage.getItem(LANGUAGE_KEY);

    if (!localLanguage) {
      window.localStorage.setItem(LANGUAGE_KEY, LANGUAGE_VI);
    } else {
      i18n.changeLanguage(localLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ConfigProvider
      locale={viLocale}
      theme={{
        token: {
          colorPrimary: COLOR_PRIMARY,
        },
      }}
    >
      <AppLayout>
        <RouterProvider router={Cookies.get(ACCESS_TOKEN_KEY) ? privateRouters : publicRouters} />
      </AppLayout>
    </ConfigProvider>
  );
}

export default App;
