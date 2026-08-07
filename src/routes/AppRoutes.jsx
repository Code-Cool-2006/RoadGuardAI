import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import ReportHazard from '@/pages/ReportHazard';
import Incidents from '@/pages/Incidents';
import SafetyAssistant from '@/pages/SafetyAssistant';
import Landing from '@/pages/Landing';
import LawAxis from '@/pages/LawAxis';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/lawaxis',
    element: <LawAxis />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/overview" replace />,
      },
      {
        path: 'overview',
        element: <Home />,
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
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
