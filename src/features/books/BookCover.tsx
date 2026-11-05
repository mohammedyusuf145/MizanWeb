import { useState } from 'react';
import { cn } from '@/lib/cn';
import { coverTone, isArabic } from './logic';

/**
 * A book's cover: the real image when there is one, otherwise a typeset cover in the
 * style of a cloth-bound edition (title in the reading face, a rule, the author).
 */
export function BookCover({ title, author, url, className, size = 'md' }: { title: string; author: string; url: string | null; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const [failed, setFailed] = useState(false);
  const ar = isArabic(title);
  if (url && !failed)
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn('aspect-[2/3] w-full rounded-[4px] border border-border object-cover shadow-card', className)}
      />
    );
  return (
    <div
      aria-hidden
      dir={ar ? 'rtl' : 'ltr'}
      lang={ar ? 'ar' : 'en'}
      className={cn('relative flex aspect-[2/3] w-full flex-col overflow-hidden rounded-[4px] border border-black/20 text-start text-white shadow-card', className)}
      style={{ background: coverTone(title) }}
    >
      <span className="absolute inset-y-0 start-0 w-[6%] bg-black/20" />
      <div className={cn('flex flex-1 flex-col ps-[14%] pe-[8%] pt-[14%]', size === 'sm' ? 'gap-1' : 'gap-2')}>
        <p className={cn('font-reading leading-snug font-semibold [overflow-wrap:anywhere]', size === 'sm' ? 'line-clamp-3 text-[10px]' : size === 'lg' ? 'line-clamp-5 text-xl' : 'line-clamp-4 text-sm')}>{title}</p>
        <span className="h-px w-1/3 bg-white/40" />
        {author && <p className={cn('line-clamp-2 text-white/75', size === 'sm' ? 'text-[8px]' : 'text-[11px]')}>{author}</p>}
      </div>
    </div>
  );
}
