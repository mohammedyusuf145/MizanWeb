import { Outlet } from 'react-router';
import { Suspense } from 'react';
import { useT } from '@/lib/i18n';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { Sidebar } from './Sidebar';
import { BottomTabs } from './BottomTabs';
import { CommandPalette } from './CommandPalette';
import { RouteFallback } from '../RouteFallback';
import { ShortcutsDialog, useShortcutsDialog } from './ShortcutsDialog';
import { QuickAddDialog } from '@/features/quick-add/QuickAddDialog';
import { useQuickAdd } from '@/features/quick-add/store';
import { useHotkeys } from '@/lib/hotkeys';
import { ReminderScheduler } from '@/features/reminders/ReminderScheduler';
import { TimerRunner } from '@/features/timer/TimerRunner';

/**
 * Phone (<768): content + bottom tabs.
 * Tablet (768–1023): 64px icon rail.
 * Desktop (≥1024): full sidebar, user-collapsible.
 */
export function AppShell() {
  const t = useT();
  const desktop = useMediaQuery('(min-width: 1024px)');
  useHotkeys({
    n: () => useQuickAdd.getState().show(),
    '?': () => useShortcutsDialog.getState().setOpen(true),
  });
  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-control focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink"
      >
        {t('app.skip')}
      </a>
      <Sidebar forceCollapsed={!desktop} />
      <main id="main" tabIndex={-1} className="min-w-0 flex-1 pb-[calc(var(--bottombar-h)+env(safe-area-inset-bottom))] focus:outline-none md:pb-0">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <BottomTabs />
      <CommandPalette />
      <QuickAddDialog />
      <ShortcutsDialog />
      <ReminderScheduler />
      <TimerRunner />
    </div>
  );
}
