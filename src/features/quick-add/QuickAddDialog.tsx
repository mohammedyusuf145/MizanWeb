import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog as D } from 'radix-ui';
import { Check, CornerDownLeft, Plus } from 'lucide-react';
import { useBoards, useColumns, useSubjects } from '@/lib/db/hooks';
import { useT } from '@/lib/i18n';
import { useSettings } from '@/features/settings/settings';
import { createCard } from '@/features/boards/ops';
import { Kbd, Select } from '@/components/ui';
import { parseQuickAdd } from './parse';
import { TokenPreview } from './TokenPreview';
import { useCurrentBoard, useQuickAdd } from './store';

/**
 * Fast capture: type naturally, see what was understood, press Enter.
 * Stays open after adding so several cards can be captured in a row.
 */
export function QuickAddDialog() {
  const t = useT();
  const { open, hide, boardId: requestedBoard, columnId: requestedColumn, dueAt } = useQuickAdd();
  const currentBoard = useCurrentBoard((s) => s.boardId);
  const boards = useBoards();
  const boardId = requestedBoard ?? currentBoard ?? boards?.[0]?.id;
  const columns = useColumns(boardId);
  const subjects = useSubjects();
  const settings = useSettings();
  const [text, setText] = useState('');
  const [columnId, setColumnId] = useState<string>('');
  const [now, setNow] = useState(() => new Date());
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLastAdded(null);
    setText('');
    setNow(new Date());
  }, [open]);

  useEffect(() => {
    if (!columns?.length) return;
    const fallback = columns.find((c) => c.kind !== 'done') ?? columns[0]!;
    setColumnId((prev) => (requestedColumn && columns.some((c) => c.id === requestedColumn) ? requestedColumn : columns.some((c) => c.id === prev) ? prev : fallback.id));
  }, [columns, requestedColumn, open]);

  const parsed = useMemo(
    () => parseQuickAdd(text, { now, subjects: subjects ?? [], weekStart: settings.week_start }),
    [text, now, subjects, settings.week_start],
  );
  const subject = subjects?.find((s) => s.id === parsed.subjectId);

  async function submit() {
    const title = parsed.title.trim() || text.trim();
    if (!title || !boardId || !columnId) return;
    const due = parsed.dueAt ?? (dueAt ? new Date(dueAt) : null);
    await createCard({
      board_id: boardId,
      column_id: columnId,
      title: title.slice(0, 300),
      subject_id: parsed.subjectId,
      due_at: due?.toISOString() ?? null,
      due_has_time: parsed.dueAt ? parsed.hasTime : Boolean(dueAt),
      priority: parsed.priority ?? 'med',
      is_exam: parsed.isExam,
      labels: parsed.labels,
      estimate_min: parsed.estimateMin,
    });
    setLastAdded(title);
    setText('');
    setNow(new Date());
    inputRef.current?.focus();
  }

  return (
    <D.Root open={open} onOpenChange={(v) => !v && hide()}>
      <D.Portal>
        <D.Overlay className="anim-overlay fixed inset-0 z-[var(--z-palette)] bg-[var(--surface-overlay)]" />
        <D.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          className="anim-dialog fixed inset-x-0 top-[14dvh] z-[var(--z-palette)] mx-auto w-[calc(100vw-32px)] max-w-[600px] rounded-pop border border-border bg-surface-2 shadow-sheet focus:outline-none"
        >
          <D.Title className="sr-only">{t('qa.title')}</D.Title>
          <D.Description className="sr-only">{t('qa.hint')}</D.Description>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <div className="flex items-center gap-3 px-4">
              <Plus size={18} className="shrink-0 text-accent" aria-hidden />
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('qa.placeholder')}
                aria-label={t('qa.title')}
                dir="auto"
                maxLength={400}
                className="h-14 w-full bg-transparent text-md text-text placeholder:text-text-3 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                aria-label={t('qa.add')}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-control bg-accent text-accent-ink transition-opacity disabled:opacity-30"
              >
                <CornerDownLeft size={16} className="flip-rtl" />
              </button>
            </div>
            <div className="min-h-[44px] border-t border-border px-4 py-3">
              {text.trim() && parsed.title !== text.trim() ? (
                <div className="flex flex-col gap-2">
                  <p className="truncate text-base text-text" dir="auto">
                    {parsed.title || '…'}
                  </p>
                  <TokenPreview parsed={parsed} subject={subject} />
                </div>
              ) : lastAdded ? (
                <p role="status" className="flex items-center gap-2 text-sm text-text-2">
                  <Check size={14} className="shrink-0 text-accent" aria-hidden />
                  <span className="shrink-0">{t('qa.created')}</span>
                  <span className="truncate text-text-3" dir="auto">
                    {lastAdded}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-text-3">{t('qa.hint')}</p>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5">
              <label className="flex min-w-0 items-center gap-2 text-sm text-text-3">
                <span className="shrink-0">{t('qa.into')}</span>
                <span className="w-44 min-w-0">
                  <Select value={columnId} onChange={(e) => setColumnId(e.target.value)} className="!h-8 !text-sm">
                    {columns?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </span>
              </label>
              <span className="hidden items-center gap-1.5 text-xs text-text-3 sm:flex">
                <Kbd>Enter</Kbd>
                <Kbd>Esc</Kbd>
              </span>
            </div>
          </form>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
