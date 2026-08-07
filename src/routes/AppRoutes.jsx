import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import ReportHazard from '@/pages/ReportHazard';
import Incidents from '@/pages/Incidents';
import SafetyAssistant from '@/pages/SafetyAssistant';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'report',
        element: <ReportHazard />,
      },
      {
        path: 'incidents',
        element: <Incidents />,
      },
      {
        path: 'assistant',
        element: <SafetyAssistant />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
