import { Flag, GraduationCap } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { subjectColor } from '@/design/tokens';
import { ProgressRing } from '@/components/ui';

/**
 * Desktop-only glimpse of the product on the sign-in screen:
 * an exam card, the timer linked to a subject, and the tutor that knows about the exam.
 * It shows the one idea that matters — the three tools are connected.
 */
export function WelcomePreview() {
  const t = useT();
  const math = '#B83E0A';
  const physics = '#6F7DED';
  const arabic = '#C77806';
  return (
    <div aria-hidden className="relative hidden overflow-hidden border-s border-border bg-surface-1 lg:block">
      <div className="relative flex h-full items-center px-16">
        <div className="grid w-full max-w-[640px] grid-cols-[minmax(0,1fr)_200px] gap-6">
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-xs font-medium text-text-3">{t('welcome.week')}</p>
            <PreviewCard color={math} title={t('welcome.exam')} meta={t('welcome.thu')} exam />
            <PreviewCard color={physics} title={t('welcome.card1')} meta={t('welcome.today')} />
            <PreviewCard color={arabic} title={t('welcome.card2')} meta={t('welcome.tomorrow')} />
          </div>
          <div className="flex flex-col gap-4 pt-6">
            <div className="flex flex-col items-center gap-3 rounded-pop border border-border bg-surface-2 p-5 raised">
              <ProgressRing value={0.62} size={112} stroke={4} color={subjectColor(physics)}>
                <span className="font-mono text-xl text-text tabular" dir="ltr">
                  18:42
                </span>
              </ProgressRing>
              <span className="text-xs text-text-2">{t('welcome.focusing')}</span>
            </div>
          </div>
          <div className="col-span-2 flex gap-3 rounded-pop border border-border bg-surface-2 p-4 raised">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent">
              <GraduationCap size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-3">{t('welcome.tutorName')}</p>
              <p className="mt-0.5 text-base text-text">{t('welcome.tutor')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ color, title, meta, exam }: { color: string; title: string; meta: string; exam?: boolean }) {
  const c = subjectColor(color);
  return (
    <div className="relative rounded-card border border-border bg-surface-2 py-3 ps-4 pe-3 raised">
      <span className="absolute inset-y-2 start-0 w-[3px] rounded-full" style={{ background: c, width: exam ? 4 : 3 }} />
      <p className="text-base text-text">{title}</p>
      <div className="mt-1.5 flex items-center gap-2 text-xs text-text-3">
        {exam && (
          <span className="inline-flex items-center gap-1 font-medium" style={{ color: c }}>
            <Flag size={12} />
          </span>
        )}
        <span>{meta}</span>
      </div>
    </div>
  );
}
