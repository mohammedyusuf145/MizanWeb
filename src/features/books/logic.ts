/** Pure rules for the reading log: status transitions, progress, yearly stats, Open Library mapping. */
import type { Book, BookStatus } from '@/types/database';

const pad = (n: number) => String(n).padStart(2, '0');
export const today = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * What else changes when a book moves to `next`:
 * starting sets the start date; finishing sets the finish date and fills the progress;
 * moving back to "want to read" clears the dates.
 */
export function statusPatch(book: Pick<Book, 'status' | 'started_on' | 'finished_on' | 'pages' | 'current_page'>, next: BookStatus, on = today()): Partial<Book> {
  const patch: Partial<Book> = { status: next };
  if (next === 'reading') {
    patch.started_on = book.started_on ?? on;
    patch.finished_on = null;
  } else if (next === 'finished') {
    patch.started_on = book.started_on && book.started_on <= on ? book.started_on : on;
    patch.finished_on = on;
    if (book.pages) patch.current_page = book.pages;
  } else if (next === 'want') {
    patch.started_on = null;
    patch.finished_on = null;
    patch.current_page = 0;
  } else {
    patch.finished_on = null;
  }
  return patch;
}

export function progress(book: Pick<Book, 'pages' | 'current_page' | 'status'>): number | null {
  if (book.status === 'finished') return 1;
  if (!book.pages) return null;
  return Math.max(0, Math.min(1, book.current_page / book.pages));
}

export interface YearStats {
  finished: number;
  pages: number;
  averageRating: number | null;
  reading: number;
  /** Books finished in each month, January first. */
  byMonth: number[];
}

export function yearStats(books: Book[], year: number): YearStats {
  const done = books.filter((b) => !b.deleted_at && b.status === 'finished' && b.finished_on?.startsWith(`${year}-`));
  const rated = done.filter((b) => b.rating);
  const byMonth = Array.from({ length: 12 }, () => 0);
  for (const b of done) byMonth[Number(b.finished_on!.slice(5, 7)) - 1]!++;
  return {
    finished: done.length,
    pages: done.reduce((n, b) => n + (b.pages ?? 0), 0),
    averageRating: rated.length ? Math.round((rated.reduce((n, b) => n + b.rating!, 0) / rated.length) * 10) / 10 : null,
    reading: books.filter((b) => !b.deleted_at && b.status === 'reading').length,
    byMonth,
  };
}

export type BookSort = 'recent' | 'title' | 'rating' | 'finished';

export function sortBooks(books: Book[], by: BookSort, locale: string): Book[] {
  const list = [...books];
  switch (by) {
    case 'title':
      return list.sort((a, b) => a.title.localeCompare(b.title, locale));
    case 'rating':
      return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.updated_at.localeCompare(a.updated_at));
    case 'finished':
      return list.sort((a, b) => (b.finished_on ?? '').localeCompare(a.finished_on ?? '') || b.updated_at.localeCompare(a.updated_at));
    default:
      return list.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }
}

/** Open Library search result → the fields Mizan keeps. */
export interface FoundBook {
  title: string;
  author: string;
  pages: number | null;
  isbn: string | null;
  cover_url: string | null;
  year: number | null;
}

export function fromOpenLibrary(doc: Record<string, unknown>): FoundBook | null {
  const title = typeof doc.title === 'string' ? doc.title.trim().slice(0, 300) : '';
  if (!title) return null;
  const authors = Array.isArray(doc.author_name) ? (doc.author_name as unknown[]).filter((a): a is string => typeof a === 'string') : [];
  const isbns = Array.isArray(doc.isbn) ? (doc.isbn as unknown[]).filter((i): i is string => typeof i === 'string' && /^[0-9Xx-]{10,17}$/.test(i)) : [];
  const pages = Number(doc.number_of_pages_median);
  const cover = Number(doc.cover_i);
  const year = Number(doc.first_publish_year);
  return {
    title,
    author: authors.slice(0, 2).join('، ').slice(0, 200),
    pages: Number.isInteger(pages) && pages > 0 && pages <= 20000 ? pages : null,
    isbn: isbns.find((i) => i.replace(/-/g, '').length === 13) ?? isbns[0] ?? null,
    cover_url: Number.isInteger(cover) && cover > 0 ? `https://covers.openlibrary.org/b/id/${cover}-M.jpg` : null,
    year: Number.isInteger(year) ? year : null,
  };
}

/** Typographic cover colour for books without an image: stable per title, from a muted, AA-safe set. */
const COVER_TONES = ['#2c3e5c', '#4a3b2a', '#2f4a43', '#5a2f35', '#3c3a5a', '#4b4a2c', '#2b4656', '#553a4d'];
export function coverTone(title: string): string {
  let h = 0;
  for (const ch of title) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return COVER_TONES[h % COVER_TONES.length]!;
}

export const isArabic = (s: string) => /[؀-ۿ]/.test(s);
