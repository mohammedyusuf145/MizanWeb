import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Search, X } from 'lucide-react';
import { useT } from '@/lib/i18n';

import { playUi } from '@/lib/uiSound';
import { Button, Dialog, Field, IconButton, Input, Select, Spinner, toast } from '@/components/ui';
import type { Book, BookStatus } from '@/types/database';
import { BookCover } from './BookCover';
import { coverFromFile, createBook, searchOpenLibrary } from './data';
import { isArabic, statusPatch, type FoundBook } from './logic';

const EMPTY = { title: '', author: '', pages: '', isbn: '', cover_url: null as string | null };

/** Find a book on Open Library (one tap fills everything) or type it in by hand. */
export function AddBookDialog({ open, onOpenChange, onAdded }: { open: boolean; onOpenChange: (v: boolean) => void; onAdded: (b: Book) => void }) {
  const t = useT();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<FoundBook[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<'offline' | 'error' | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<BookStatus>('reading');
  const [busy, setBusy] = useState(false);
  const picker = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ('');
    setResults(null);
    setSearchError(null);
    setForm(EMPTY);
    setStatus('reading');
  }, [open]);

  // Debounced search: 350ms after typing stops, cancelling the previous request.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 3) {
      setResults(null);
      return;
    }
    if (!navigator.onLine) {
      setSearchError('offline');
      return;
    }
    const ctrl = new AbortController();
    const id = window.setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        setResults(await searchOpenLibrary(term, ctrl.signal));
      } catch {
        if (!ctrl.signal.aborted) setSearchError('error');
      } finally {
        if (!ctrl.signal.aborted) setSearching(false);
      }
    }, 350);
    return () => {
      window.clearTimeout(id);
      ctrl.abort();
    };
  }, [q]);

  const pick = (b: FoundBook) => {
    setForm({ title: b.title, author: b.author, pages: b.pages ? String(b.pages) : '', isbn: b.isbn ?? '', cover_url: b.cover_url });
    setResults(null);
  };

  const save = async () => {
    const title = form.title.trim();
    if (!title) return;
    setBusy(true);
    const pages = Number.parseInt(form.pages, 10);
    const base = { status: 'want' as BookStatus, started_on: null, finished_on: null, pages: Number.isFinite(pages) && pages > 0 ? Math.min(pages, 20000) : null, current_page: 0 };
    const book = await createBook({
      title: title.slice(0, 300),
      author: form.author.trim().slice(0, 200),
      isbn: /^[0-9Xx-]{10,17}$/.test(form.isbn.trim()) ? form.isbn.trim() : null,
      cover_url: form.cover_url,
      language: isArabic(title) ? 'ar' : 'en',
      ...base,
      ...statusPatch(base, status),
    });
    playUi('create');
    toast(t('books.added'), { tone: 'success' });
    setBusy(false);
    onOpenChange(false);
    onAdded(book);
  };

  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('books.add')}
      className="max-w-[560px]"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('c.cancel')}
          </Button>
          <Button variant="primary" loading={busy} disabled={!form.title.trim()} onClick={save}>
            {t('books.save')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Field label={t('books.search.label')} hint={t('books.search.hint')}>
          {({ id, describedBy }) => (
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-text-3" />
              <Input id={id} aria-describedby={describedBy} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('books.search')} dir="auto" className="!ps-9" autoComplete="off" />
              {searching && (
                <span className="absolute end-3 top-1/2 -translate-y-1/2">
                  <Spinner size={14} />
                </span>
              )}
            </div>
          )}
        </Field>
        {searchError && <p className="-mt-3 text-sm text-text-3">{t(searchError === 'offline' ? 'books.search.offline' : 'books.search.error')}</p>}
        {results && (
          <ul aria-label={t('books.search.label')} className="-mt-2 flex max-h-[260px] flex-col gap-1 overflow-y-auto rounded-[10px] border border-border p-1">
            {results.length === 0 && <li className="px-3 py-2 text-sm text-text-3">{t('books.search.none')}</li>}
            {results.map((r, i) => (
              <li key={i}>
                <button type="button" onClick={() => pick(r)} className="flex w-full items-center gap-3 rounded-[8px] px-2 py-2 text-start hover:bg-surface-3">
                  <span className="w-9 shrink-0">
                    <BookCover title={r.title} author={r.author} url={r.cover_url} size="sm" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-base text-text" dir="auto">
                      {r.title}
                    </span>
                    <span className="block truncate text-sm text-text-3" dir="auto">
                      {[r.author, r.year].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid grid-cols-[88px_1fr] gap-4 border-t border-border pt-5 sm:grid-cols-[104px_1fr]">
          <div className="flex flex-col gap-2">
            <BookCover title={form.title || t('books.title')} author={form.author} url={form.cover_url} size="sm" />
            {form.cover_url ? (
              <Button size="sm" variant="ghost" iconStart={<X size={13} />} onClick={() => setForm((f) => ({ ...f, cover_url: null }))}>
                <span className="sr-only">{t('books.cover.remove')}</span>
              </Button>
            ) : (
              <IconButton size="sm" label={t('books.cover.upload')} icon={<ImagePlus size={15} />} onClick={() => picker.current?.click()} className="self-center" />
            )}
            <input
              ref={picker}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (!f) return;
                try {
                  const url = await coverFromFile(f);
                  setForm((x) => ({ ...x, cover_url: url }));
                } catch {
                  toast(t('tutor.err.unsupported'), { tone: 'danger' });
                }
              }}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <Field label={t('books.title')}>{({ id }) => <Input id={id} value={form.title} onChange={set('title')} dir="auto" required />}</Field>
            <Field label={t('books.author')}>{({ id }) => <Input id={id} value={form.author} onChange={set('author')} dir="auto" />}</Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('books.pages')}>{({ id }) => <Input id={id} value={form.pages} onChange={set('pages')} inputMode="numeric" dir="ltr" />}</Field>
              <Field label={t('books.filter')}>
                {({ id }) => (
                  <Select id={id} value={status} onChange={(e) => setStatus(e.target.value as BookStatus)}>
                    {(['reading', 'want', 'finished'] as const).map((s) => (
                      <option key={s} value={s}>
                        {t(`books.status.${s}`)}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
