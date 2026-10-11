import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { LayoutGrid, Trash2 } from 'lucide-react';
import { useBoards, useCards, useColumns, useSubjects } from '@/lib/db/hooks';
import { softDelete, upsertMany } from '@/lib/db/repo';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/cn';
import type { Card, Column, Subject } from '@/types/database';
import { Button, EmptyState, Skeleton, toast } from '@/components/ui';
import { PageHeader } from '@/app/shell/PageHeader';
import { CardTile } from '@/features/cards/CardTile';

/**
 * Phase 1 board: reads live from the local database and shows columns and cards.
 * Phase 2 adds drag and drop, quick-add, card details, filters and board management.
 */
export function BoardPage() {
  const t = useT();
  const navigate = useNavigate();
  const { boardId } = useParams();
  const boards = useBoards();
  const board = boards?.find((b) => b.id === boardId) ?? boards?.[0];
  const columns = useColumns(board?.id);
  const cards = useCards(board?.id);
  const subjects = useSubjects();

  const subjectById = useMemo(() => new Map((subjects ?? []).map((s) => [s.id, s])), [subjects]);
  const samples = cards?.filter((c) => c.is_sample) ?? [];
  const loading = boards === undefined || columns === undefined || cards === undefined;

  async function clearSamples() {
    const ids = samples.map((c) => c.id);
    await softDelete('cards', ids);
    toast(t('board.samplesRemoved'), {
      tone: 'success',
      action: { label: t('c.undo'), onClick: () => void upsertMany('cards', ids.map((id) => ({ id, deleted_at: null }))) },
    });
  }

  return (
    <>
      <PageHeader
        title={board?.name ?? t('nav.board')}
        meta={cards && t('board.cards', { n: cards.length })}
        actions={
          samples.length > 0 && (
            <Button variant="ghost" size="sm" iconStart={<Trash2 size={14} />} onClick={clearSamples} aria-label={t('board.clearSamples')}>
              <span className="hidden sm:inline">{t('board.clearSamples')}</span>
            </Button>
          )
        }
      />
      {boards && boards.length > 1 && (
        <nav aria-label={t('nav.board')} className="flex gap-1 overflow-x-auto border-b border-border px-4 md:px-8">
          {boards.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => navigate(`/board/${b.id}`)}
              aria-current={b.id === board?.id ? 'page' : undefined}
              className={cn('h-10 px-3 text-base whitespace-nowrap', b.id === board?.id ? 'text-text' : 'text-text-3 hover:text-text-2')}
            >
              {b.name}
            </button>
          ))}
        </nav>
      )}

      {loading ? (
        <BoardSkeleton />
      ) : !board || cards!.length === 0 ? (
        <div className="mx-auto max-w-[var(--content-max)] px-4 py-10 md:px-8">
          <EmptyState icon={<LayoutGrid size={20} />} title={t('board.empty.title')} body={t('board.empty.body')} />
        </div>
      ) : (
        <Columns columns={columns!} cards={cards!} subjectById={subjectById} />
      )}
    </>
  );
}

function Columns({ columns, cards, subjectById }: { columns: Column[]; cards: Card[]; subjectById: Map<string, Subject> }) {
  const t = useT();
  return (
    <div className="overflow-x-auto overscroll-x-contain">
      <div
        className={cn(
          'flex snap-x snap-mandatory gap-4 px-4 py-6 md:snap-none md:px-8',
          'max-md:scroll-px-4 md:mx-auto md:max-w-[var(--content-max)]',
        )}
      >
        {columns.map((col) => {
          const list = cards.filter((c) => c.column_id === col.id);
          return (
            <section
              key={col.id}
              aria-labelledby={`col-${col.id}`}
              className="flex w-[85vw] max-w-[340px] shrink-0 snap-start flex-col md:w-[300px] xl:w-[320px]"
            >
              <header className="mb-3 flex h-8 items-center gap-2 px-1">
                {col.color && <span className="size-2 rounded-full" style={{ background: col.color }} aria-hidden />}
                <h2 id={`col-${col.id}`} className="text-sm font-medium text-text-2">
                  {col.name}
                </h2>
                <span className="text-xs text-text-3 tabular">{list.length}</span>
              </header>
              <div className="flex flex-col gap-2">
                {list.length === 0 ? (
                  <p className="rounded-card border border-dashed border-border px-4 py-6 text-sm text-text-3">{t('board.emptyColumn')}</p>
                ) : (
                  list.map((card) => (
                    <CardTile key={card.id} card={card} subject={card.subject_id ? subjectById.get(card.subject_id) : undefined} done={col.kind === 'done'} />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden px-4 py-6 md:px-8" aria-busy="true">
      {[3, 2, 1].map((n, i) => (
        <div key={i} className="flex w-[85vw] max-w-[340px] shrink-0 flex-col gap-2 md:w-[300px]">
          <Skeleton className="mb-3 h-4 w-24" />
          {Array.from({ length: n }, (_, j) => (
            <Skeleton key={j} className="h-[72px]" />
          ))}
        </div>
      ))}
    </div>
  );
}
