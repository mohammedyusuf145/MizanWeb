import { CalendarClock, Flag, Timer } from 'lucide-react';
import type { Card, Subject } from '@/types/database';
import { subjectColor } from '@/design/tokens';
import { useI18n, useT } from '@/lib/i18n';
import { formatTime, relativeDay } from '@/lib/dates';
import { cn } from '@/lib/cn';
import { SubjectDot } from '@/features/subjects/SubjectChip';
import { dueState } from './due';

const dueTone = {
  none: 'text-text-3',
  done: 'text-text-3',
  later: 'text-text-3',
  soon: 'text-text-2',
  today: 'text-warning',
  overdue: 'text-danger',
};

/**
 * Board card. Subject colour is a bar on the inline-start edge; exams get a thicker bar and a flag.
 * Done cards recede (muted title) instead of being struck through.
 */
export function CardTile({ card, subject, done }: { card: Card; subject?: Subject; done: boolean }) {
  const t = useT();
  const lang = useI18n((s) => s.lang);
  const state = dueState(card.due_at, done);
  const due = card.due_at ? new Date(card.due_at) : null;
  const color = subject ? subjectColor(subject.color) : 'var(--border-strong)';

  return (
    <article
      className={cn(
        'group relative rounded-card border bg-surface-2 py-3 ps-4 pe-3 raised transition-[border-color,background-color] duration-[var(--dur-fast)]',
        card.is_exam ? 'border-border-strong' : 'border-border',
        'hover:border-border-strong',
      )}
    >
      <span aria-hidden className="absolute inset-y-2.5 start-0 rounded-full" style={{ background: color, width: card.is_exam ? 4 : 3 }} />
      <h3 className={cn('text-base leading-snug', done ? 'text-text-3' : 'text-text')}>{card.title}</h3>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {card.is_exam && (
          <span className="inline-flex items-center gap-1 font-medium" style={{ color }}>
            <Flag size={12} aria-hidden />
            {t('board.exam')}
          </span>
        )}
        {subject && (
          <span className="inline-flex min-w-0 items-center gap-1.5 text-text-3">
            <SubjectDot color={subject.color} size={6} />
            <span className="truncate">{subject.name}</span>
          </span>
        )}
        {due && (
          <span className={cn('inline-flex items-center gap-1 tabular', dueTone[state])}>
            <CalendarClock size={12} aria-hidden />
            <time dateTime={card.due_at!}>
              {relativeDay(due, lang)}
              {card.due_has_time && ` · ${formatTime(due, lang)}`}
            </time>
          </span>
        )}
        {card.estimate_min ? (
          <span className="inline-flex items-center gap-1 text-text-3 tabular">
            <Timer size={12} aria-hidden />
            {t('board.minutes', { n: card.estimate_min })}
          </span>
        ) : null}
        {card.priority === 'high' && !done && (
          <span className="ms-auto inline-flex size-1.5 rounded-full bg-danger" role="img" aria-label={t('pri.high')} />
        )}
      </div>
    </article>
  );
}
