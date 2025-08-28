import { createBrowserRouter } from 'react-router';

import { HomePage } from '@/pages/Home';

export const publicRouters = createBrowserRouter([
  {
    path: '*',
    element: <HomePage />,
  },
]);

export const privateRouters = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
]);
