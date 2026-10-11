import { useLiveQuery } from 'dexie-react-hooks';
import type { Board, Card, Column, Profile, Settings, Subject } from '@/types/database';
import { useDbStore } from './index';

const byPosition = <T extends { position: string }>(a: T, b: T) => (a.position < b.position ? -1 : a.position > b.position ? 1 : 0);

export const DEFAULT_SETTINGS: Omit<Settings, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'> = {
  language: 'ar',
  theme: 'dark',
  week_start: 0,
  calendar_primary: 'gregorian',
  calendar_show_secondary: true,
  notifications: { push: false, in_app: true, offsets_min: [1440, 60] },
  timer_defaults: {},
};

/** `undefined` while loading, then the stored row (or null). */
export function useProfile(): Profile | null | undefined {
  const { db, userId } = useDbStore();
  return useLiveQuery(async () => (db && userId ? ((await db.profiles.get(userId)) ?? null) : null), [db, userId]);
}

export function useSettingsRow(): Settings | null | undefined {
  const { db, userId } = useDbStore();
  return useLiveQuery(async () => (db && userId ? ((await db.settings.get(userId)) ?? null) : null), [db, userId]);
}

export function useSubjects(): Subject[] | undefined {
  const db = useDbStore((s) => s.db);
  return useLiveQuery(
    async () => (db ? (await db.subjects.toArray()).filter((s) => !s.deleted_at && !s.archived_at).sort(byPosition) : []),
    [db],
  );
}

export function useBoards(): Board[] | undefined {
  const db = useDbStore((s) => s.db);
  return useLiveQuery(
    async () => (db ? (await db.boards.toArray()).filter((b) => !b.deleted_at && !b.archived_at).sort(byPosition) : []),
    [db],
  );
}

export function useColumns(boardId: string | undefined): Column[] | undefined {
  const db = useDbStore((s) => s.db);
  return useLiveQuery(
    async () =>
      db && boardId
        ? (await db.columns.where('board_id').equals(boardId).toArray()).filter((c) => !c.deleted_at).sort(byPosition)
        : [],
    [db, boardId],
  );
}

export function useCards(boardId: string | undefined): Card[] | undefined {
  const db = useDbStore((s) => s.db);
  return useLiveQuery(
    async () =>
      db && boardId ? (await db.cards.where('board_id').equals(boardId).toArray()).filter((c) => !c.deleted_at).sort(byPosition) : [],
    [db, boardId],
  );
}

export function usePendingCount(): number {
  const db = useDbStore((s) => s.db);
  return useLiveQuery(async () => (db ? db.outbox.count() : 0), [db]) ?? 0;
}
