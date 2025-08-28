import { ConfigProvider } from 'antd';
import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router';

import viLocale from 'antd/locale/vi_VN';

import { AppLayout } from './components/AppLayout';
import { firebaseConfig } from './config/firebase';
import { ACCESS_TOKEN_KEY, COLOR_PRIMARY, LANGUAGE_KEY, LANGUAGE_VI } from './constants';
import { privateRouters, publicRouters } from './routers';

function App() {
  useEffect(() => {
    getAnalytics(initializeApp(firebaseConfig));

    if (!window.localStorage.getItem(LANGUAGE_KEY)) {
      window.localStorage.setItem(LANGUAGE_KEY, LANGUAGE_VI);
    }
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
