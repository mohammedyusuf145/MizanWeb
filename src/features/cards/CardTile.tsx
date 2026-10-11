import { CalendarClock, CheckSquare, Flag, Paperclip, Repeat, Timer } from 'lucide-react';
import type { Card, Subject } from '@/types/database';
import type { CardMeta } from '@/lib/db/hooks';
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
 * Board card (presentational). Subject colour is a bar on the inline-start edge;
 * exams get a thicker bar and a flag. Done cards recede instead of being struck through.
 */
export function CardTile({
  card,
  subject,
  done,
  meta,
  lifted,
  className,
}: {
  card: Card;
  subject?: Subject;
  done: boolean;
  meta?: CardMeta;
  /** Rendered in the drag overlay. */
  lifted?: boolean;
  className?: string;
}) {
  const t = useT();
  const lang = useI18n((s) => s.lang);
  const state = dueState(card.due_at, done);
  const due = card.due_at ? new Date(card.due_at) : null;
  const color = subject ? subjectColor(subject.color) : 'var(--border-strong)';
  const checklistComplete = meta && meta.checklistTotal > 0 && meta.checklistDone === meta.checklistTotal;

  return (
    <div
      className={cn(
        'relative rounded-card border bg-surface-2 py-3 ps-4 pe-3 raised transition-[border-color,background-color,box-shadow] duration-[var(--dur-fast)]',
        card.is_exam && !done ? 'border-border-strong' : 'border-border',
        lifted ? 'scale-[1.02] border-border-strong bg-surface-3 shadow-pop' : 'group-hover/card:border-border-strong',
        className,
      )}
    >
      <span aria-hidden className="absolute inset-y-2.5 start-0 rounded-full" style={{ background: color, width: card.is_exam ? 4 : 3, opacity: done ? 0.5 : 1 }} />
      <h3 className={cn('text-base leading-snug break-words', done ? 'text-text-3' : 'text-text')} dir="auto">
        {card.title}
      </h3>

      {card.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {card.labels.slice(0, 3).map((l) => (
            <span key={l} className="inline-flex h-5 items-center rounded-chip bg-surface-3 px-1.5 text-[11px] text-text-2" dir="auto">
              {l}
            </span>
          ))}
          {card.labels.length > 3 && <span className="inline-flex h-5 items-center px-1 text-[11px] text-text-3">+{card.labels.length - 3}</span>}
        </div>
      )}

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
            {card.repeat_rule && <Repeat size={11} aria-label={t('card.repeat')} />}
          </span>
        )}
        {meta && meta.checklistTotal > 0 && (
          <span className={cn('inline-flex items-center gap-1 tabular', checklistComplete ? 'text-accent-text' : 'text-text-3')}>
            <CheckSquare size={12} aria-hidden />
            <span aria-label={t('card.checklistProgress', { done: meta.checklistDone, total: meta.checklistTotal })} dir="ltr">
              {meta.checklistDone}/{meta.checklistTotal}
            </span>
          </span>
        )}
        {meta && meta.attachments > 0 && (
          <span className="inline-flex items-center gap-1 text-text-3 tabular" aria-label={`${t('card.attachments')}: ${meta.attachments}`}>
            <Paperclip size={12} aria-hidden />
            {meta.attachments}
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
    </div>
  );
}
