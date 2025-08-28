import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

import 'dayjs/locale/vi';

import './i18n';

import '@ant-design/v5-patch-for-react-19';

import '@fontsource/inter/400.css';

import './assets/styles/index.scss';

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.locale('vi');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
