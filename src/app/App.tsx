import { RouterProvider } from 'react-router';
import { router } from './router';
import { TooltipProvider, Toaster } from '@/components/ui';
import { SettingsEffects } from '@/features/settings/settings';
import { useAuth } from '@/lib/auth';

export function App() {
  const ready = useAuth((s) => s.status === 'ready');
  return (
    <TooltipProvider>
      {ready && <SettingsEffects />}
      <RouterProvider router={router} />
      <Toaster />
    </TooltipProvider>
  );
}
