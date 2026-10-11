import type { ReactNode } from 'react';
import { CalendarDays, ChartColumn, GraduationCap, Timer } from 'lucide-react';
import { useT } from '@/lib/i18n';
import type { MessageKey } from '@/locales/en';
import { Badge, EmptyState } from '@/components/ui';
import { PageBody, PageHeader } from '@/app/shell/PageHeader';

/** Placeholder pages for destinations built in later phases. Each says what will live here. */
function Soon({ titleKey, headKey, bodyKey, icon }: { titleKey: MessageKey; headKey: MessageKey; bodyKey: MessageKey; icon: ReactNode }) {
  const t = useT();
  return (
    <>
      <PageHeader title={t(titleKey)} />
      <PageBody>
        <EmptyState icon={icon} title={t(headKey)} body={t(bodyKey)}>
          <Badge tone="accent">{t('soon.phase')}</Badge>
        </EmptyState>
      </PageBody>
    </>
  );
}

export const CalendarSoon = () => (
  <Soon titleKey="nav.calendar" headKey="soon.calendar.title" bodyKey="soon.calendar.body" icon={<CalendarDays size={20} />} />
);
export const FocusSoon = () => <Soon titleKey="nav.timer" headKey="soon.timer.title" bodyKey="soon.timer.body" icon={<Timer size={20} />} />;
export const TutorSoon = () => (
  <Soon titleKey="nav.tutor" headKey="soon.tutor.title" bodyKey="soon.tutor.body" icon={<GraduationCap size={20} />} />
);
export const StatsSoon = () => (
  <Soon titleKey="nav.stats" headKey="soon.stats.title" bodyKey="soon.stats.body" icon={<ChartColumn size={20} />} />
);
