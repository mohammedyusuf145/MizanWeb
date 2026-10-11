import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from './shell/AppShell';
import { RequireUnonboarded, RequireWorkspace, RedirectIfSignedIn } from './Gate';
import { RouteError } from '@/routes/RouteError';

/** Each page is a separate chunk, loaded on first visit. */
export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      {
        path: '/welcome',
        lazy: async () => {
          const { AuthPage } = await import('@/routes/AuthPage');
          return { element: <RedirectIfSignedIn><AuthPage /></RedirectIfSignedIn> };
        },
      },
      {
        path: '/onboarding',
        lazy: async () => {
          const { OnboardingPage } = await import('@/routes/OnboardingPage');
          return { element: <RequireUnonboarded><OnboardingPage /></RequireUnonboarded> };
        },
      },
      {
        element: (
          <RequireWorkspace>
            <AppShell />
          </RequireWorkspace>
        ),
        children: [
          { index: true, element: <Navigate to="/board" replace /> },
          { path: '/board/:boardId?', lazy: async () => ({ Component: (await import('@/routes/BoardPage')).BoardPage }) },
          { path: '/calendar', lazy: async () => ({ Component: (await import('@/routes/SoonPages')).CalendarSoon }) },
          { path: '/focus', lazy: async () => ({ Component: (await import('@/routes/SoonPages')).FocusSoon }) },
          { path: '/tutor', lazy: async () => ({ Component: (await import('@/routes/SoonPages')).TutorSoon }) },
          { path: '/stats', lazy: async () => ({ Component: (await import('@/routes/SoonPages')).StatsSoon }) },
          { path: '/settings', lazy: async () => ({ Component: (await import('@/routes/SettingsPage')).SettingsPage }) },
          { path: '/design', lazy: async () => ({ Component: (await import('@/routes/DesignPage')).DesignPage }) },
          { path: '*', lazy: async () => ({ Component: (await import('@/routes/RouteError')).NotFound }) },
        ],
      },
    ],
  },
]);
