import { NavLink, useMatch } from 'react-router';
import { PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { NAV_ITEMS, SETTINGS_ITEM, type NavItem } from '../nav';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/cn';
import { Kbd, Tooltip } from '@/components/ui';
import { LogoMark } from './Logo';
import { SyncIndicator } from './SyncIndicator';
import { usePalette } from './CommandPalette';
import { useShell } from './useShell';
import { FocusIndicator } from '@/features/timer/FocusIndicator';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export function Sidebar({ forceCollapsed }: { forceCollapsed: boolean }) {
  const t = useT();
  const userCollapsed = useShell((s) => s.collapsed);
  const toggle = useShell((s) => s.toggle);
  const collapsed = forceCollapsed || userCollapsed;
  const openPalette = usePalette((s) => s.setOpen);

  return (
    <aside
      aria-label={t('nav.main')}
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col border-e border-border bg-surface-1 md:flex',
        'transition-[width] duration-[var(--dur-slow)] ease-standard',
      )}
      style={{ width: collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)' }}
    >
      <div className={cn('flex h-14 items-center gap-2.5', collapsed ? 'justify-center' : 'px-4')}>
        <LogoMark />
        {!collapsed && <span className="text-md font-semibold tracking-tight text-text">{t('app.name')}</span>}
      </div>

      <div className={cn('pb-2', collapsed ? 'px-3' : 'px-3')}>
        <SearchButton collapsed={collapsed} onClick={() => openPalette(true)} label={t('nav.search')} />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-2">
        {NAV_ITEMS.map((item) => (
          <SideLink key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="flex flex-col gap-0.5 border-t border-border px-3 py-3">
        <SideLink item={SETTINGS_ITEM} collapsed={collapsed} />
        <div className={cn('flex h-10 items-center', collapsed ? 'justify-center' : 'justify-between ps-3')}>
          {!collapsed && <SyncIndicator />}
          {forceCollapsed ? (
            collapsed && <SyncIndicator compact />
          ) : (
            <Tooltip content={collapsed ? t('nav.expand') : t('nav.collapse')} side="right">
              <button
                type="button"
                onClick={toggle}
                aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
                className="inline-flex size-8 items-center justify-center rounded-control text-text-3 hover:bg-surface-3 hover:text-text"
              >
                {collapsed ? <PanelLeftOpen size={16} className="flip-rtl" /> : <PanelLeftClose size={16} className="flip-rtl" />}
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </aside>
  );
}

function SearchButton({ collapsed, onClick, label }: { collapsed: boolean; onClick: () => void; label: string }) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'}
      className={cn(
        'flex h-9 w-full items-center gap-2 rounded-control border border-border bg-surface-2 text-sm text-text-3',
        'transition-colors hover:border-border-strong hover:text-text-2',
        collapsed ? 'justify-center' : 'px-2.5',
      )}
    >
      <Search size={15} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-start">{label}</span>
          <span className="flex gap-0.5" dir="ltr">
            <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
            <Kbd>K</Kbd>
          </span>
        </>
      )}
    </button>
  );
  return collapsed ? (
    <Tooltip content={label} side="right">
      {button}
    </Tooltip>
  ) : (
    button
  );
}

function SideLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const t = useT();
  const label = t(item.labelKey);
  const Icon = item.icon;
  // Plain string className (not NavLink's function form) so the Tooltip's Slot can merge props safely.
  const isActive = useMatch({ path: item.to, end: false }) !== null;
  const link = (
    <NavLink
      to={item.to}
      aria-label={collapsed ? label : undefined}
      className={cn(
        'relative flex h-10 items-center gap-3 rounded-control text-base transition-colors duration-[var(--dur-fast)]',
        collapsed ? 'justify-center' : 'px-3',
        isActive ? 'bg-surface-3 text-text raised' : 'text-text-2 hover:bg-surface-2 hover:text-text',
      )}
    >
      {isActive && <span aria-hidden className="absolute inset-y-2.5 start-0 w-0.5 rounded-full bg-accent" />}
      <Icon size={18} strokeWidth={isActive ? 2 : 1.75} className={isActive ? 'text-accent' : undefined} />
      {!collapsed && <span className="truncate">{label}</span>}
      {item.to === '/focus' && <FocusIndicator compact={collapsed} />}
    </NavLink>
  );
  return collapsed ? (
    <Tooltip content={label} side="right">
      {link}
    </Tooltip>
  ) : (
    link
  );
}
