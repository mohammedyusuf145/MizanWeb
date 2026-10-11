import { NavLink } from 'react-router';
import { NAV_ITEMS } from '../nav';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/cn';
import { FocusIndicator } from '@/features/timer/FocusIndicator';

/** Phone navigation: five thumb-reachable tabs, 64px tall plus the home-indicator inset. */
export function BottomTabs() {
  const t = useT();
  return (
    <nav
      aria-label={t('nav.main')}
      className="safe-bottom fixed inset-x-0 bottom-0 z-[var(--z-nav)] border-t border-border bg-[color-mix(in_oklab,var(--surface-1),transparent_8%)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex h-[var(--bottombar-h)] max-w-[560px] items-stretch">
        {NAV_ITEMS.map(({ to, labelKey, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                  isActive ? 'text-text' : 'text-text-3 active:text-text-2',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={cn('relative flex h-7 w-12 items-center justify-center rounded-full transition-colors', isActive && 'bg-accent-soft')}>
                    {to === '/focus' && <FocusIndicator compact />}
                    <Icon size={20} strokeWidth={isActive ? 2 : 1.75} className={isActive ? 'text-accent' : undefined} />
                  </span>
                  <span>{t(labelKey)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
