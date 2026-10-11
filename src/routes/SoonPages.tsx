import type { ReactNode } from 'react';
import { GraduationCap } from 'lucide-react';
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

export const TutorSoon = () => (
  <Soon titleKey="nav.tutor" headKey="soon.tutor.title" bodyKey="soon.tutor.body" icon={<GraduationCap size={20} />} />
);
