import { DropdownMenu as M, Popover as P } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const panel = 'anim-pop z-[var(--z-sheet)] min-w-[200px] rounded-pop border border-border bg-surface-3 p-1 shadow-pop';

export const Menu = M.Root;
export const MenuTrigger = M.Trigger;

export function MenuContent({ children, align = 'end' }: { children: ReactNode; align?: 'start' | 'end' | 'center' }) {
  return (
    <M.Portal>
      <M.Content align={align} sideOffset={6} className={panel}>
        {children}
      </M.Content>
    </M.Portal>
  );
}

export function MenuItem({
  children,
  icon,
  onSelect,
  danger,
  shortcut,
}: {
  children: ReactNode;
  icon?: ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  shortcut?: ReactNode;
}) {
  return (
    <M.Item
      onSelect={onSelect}
      className={cn(
        'flex h-9 cursor-default items-center gap-2.5 rounded-[6px] px-2.5 text-base outline-none select-none',
        'data-[highlighted]:bg-[color-mix(in_oklab,var(--surface-3),var(--text)_6%)]',
        danger ? 'text-danger' : 'text-text',
      )}
    >
      {icon && <span className="text-text-3">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && <span className="text-xs text-text-3">{shortcut}</span>}
    </M.Item>
  );
}

export function MenuSeparator() {
  return <M.Separator className="my-1 h-px bg-border" />;
}

export const Popover = P.Root;
export const PopoverTrigger = P.Trigger;

export function PopoverContent({ children, className, align = 'start' }: { children: ReactNode; className?: string; align?: 'start' | 'end' | 'center' }) {
  return (
    <P.Portal>
      <P.Content align={align} sideOffset={6} className={cn(panel, 'p-3', className)}>
        {children}
      </P.Content>
    </P.Portal>
  );
}
