import { useState, type ReactNode } from 'react';
import { ChevronRight, Download, LogOut, Moon, Monitor, Plus, Sun, Trash2 } from 'lucide-react';
import { useI18n, useT } from '@/lib/i18n';
import { useAuth, signOut, deleteAccount } from '@/lib/auth';
import { useSubjects } from '@/lib/db/hooks';
import { formatDateLong, formatDayMonth, weekdayName } from '@/lib/dates';
import type { Subject } from '@/types/database';
import { updateSettings, useSettings } from '@/features/settings/settings';
import { exportAllData } from '@/features/settings/exportData';
import { SubjectEditor } from '@/features/subjects/SubjectEditor';
import { SubjectIcon } from '@/features/subjects/icons';
import { NotificationSettings } from '@/features/reminders/NotificationSettings';
import { subjectColor } from '@/design/tokens';
import { Button, Dialog, Field, Input, Segmented, Select, Switch, toast } from '@/components/ui';
import { PageBody, PageHeader } from '@/app/shell/PageHeader';

export function SettingsPage() {
  const t = useT();
  const lang = useI18n((s) => s.lang);
  const settings = useSettings();
  const subjects = useSubjects();
  const { mode, email } = useAuth();
  const [editing, setEditing] = useState<Subject | null | 'new'>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const today = new Date();

  return (
    <>
      <PageHeader title={t('settings.title')} />
      <PageBody>
        <div className="flex max-w-[720px] flex-col gap-10">
          <Section title={t('settings.general')}>
            <Row label={t('settings.language')}>
              <Segmented
                label={t('settings.language')}
                value={lang}
                onValueChange={(v) => void updateSettings({ language: v })}
                options={[
                  { value: 'ar', label: 'العربية' },
                  { value: 'en', label: 'English' },
                ]}
              />
            </Row>
            <Row label={t('settings.theme')}>
              <Segmented
                label={t('settings.theme')}
                value={settings.theme}
                onValueChange={(v) => void updateSettings({ theme: v })}
                options={[
                  { value: 'dark', label: t('settings.theme.dark'), icon: <Moon size={14} /> },
                  { value: 'light', label: t('settings.theme.light'), icon: <Sun size={14} /> },
                  { value: 'system', label: t('settings.theme.system'), icon: <Monitor size={14} /> },
                ]}
              />
            </Row>
            <Row label={t('settings.weekStart')}>
              <div className="w-full sm:w-48">
                <Select
                  aria-label={t('settings.weekStart')}
                  value={settings.week_start}
                  onChange={(e) => void updateSettings({ week_start: Number(e.target.value) as 0 | 1 | 6 })}
                >
                  {[6, 0, 1].map((d) => (
                    <option key={d} value={d}>
                      {weekdayName(d, lang)}
                    </option>
                  ))}
                </Select>
              </div>
            </Row>
          </Section>

          <Section title={t('settings.calendar')}>
            <Row label={t('settings.calendar.primary')} hint={formatDateLong(today, lang, settings.calendar_primary)}>
              <Segmented
                label={t('settings.calendar.primary')}
                value={settings.calendar_primary}
                onValueChange={(v) => void updateSettings({ calendar_primary: v })}
                options={[
                  { value: 'gregorian', label: t('settings.calendar.gregorian') },
                  { value: 'hijri', label: t('settings.calendar.hijri') },
                ]}
              />
            </Row>
            <div className="py-3">
              <Switch
                checked={settings.calendar_show_secondary}
                onCheckedChange={(v) => void updateSettings({ calendar_show_secondary: v })}
                label={t('settings.calendar.showSecondary')}
                description={formatDayMonth(today, lang, settings.calendar_primary === 'gregorian' ? 'hijri' : 'gregorian')}
              />
            </div>
          </Section>

          <Section title={t('notif.title')}>
            <NotificationSettings />
          </Section>

          <Section
            title={t('settings.subjects')}
            action={
              <Button size="sm" variant="ghost" iconStart={<Plus size={14} />} onClick={() => setEditing('new')}>
                {t('settings.subjects.add')}
              </Button>
            }
          >
            {subjects && subjects.length === 0 && <p className="py-3 text-base text-text-3">{t('settings.subjects.empty')}</p>}
            <ul className="-mx-2">
              {subjects?.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setEditing(s)}
                    className="flex h-12 w-full items-center gap-3 rounded-control px-2 text-start hover:bg-surface-2"
                  >
                    <span
                      className="inline-flex size-7 items-center justify-center rounded-control"
                      style={{ background: `color-mix(in oklab, ${subjectColor(s.color)} 16%, transparent)`, color: subjectColor(s.color) }}
                    >
                      <SubjectIcon name={s.icon} size={15} />
                    </span>
                    <span className="flex-1 truncate text-base text-text">{s.name}</span>
                    <ChevronRight size={16} className="flip-rtl text-text-3" />
                  </button>
                </li>
              ))}
            </ul>
          </Section>

          <Section title={t('settings.account')}>
            <p className="py-3 text-base text-text-2">
              {mode === 'cloud' ? t('settings.account.signedIn', { email: email ?? '' }) : t('settings.account.demo')}
            </p>
            <Row label={t('settings.export')} hint={t('settings.export.hint')}>
              <Button
                iconStart={<Download size={16} />}
                onClick={async () => {
                  await exportAllData();
                  toast(t('settings.export.done'), { tone: 'success' });
                }}
              >
                {t('settings.export')}
              </Button>
            </Row>
            <Row label={t('auth.signOut')}>
              <Button variant="ghost" iconStart={<LogOut size={16} className="flip-rtl" />} onClick={() => void signOut()}>
                {t('auth.signOut')}
              </Button>
            </Row>
            <Row label={t('settings.delete')} hint={t('settings.delete.hint')}>
              <Button variant="danger" iconStart={<Trash2 size={16} />} onClick={() => setConfirmDelete(true)}>
                {t('c.delete')}
              </Button>
            </Row>
          </Section>
        </div>
      </PageBody>

      <SubjectEditor
        open={editing !== null}
        onOpenChange={(v) => !v && setEditing(null)}
        subject={editing === 'new' ? null : editing}
        lastPosition={subjects?.at(-1)?.position ?? null}
      />

      <Dialog
        open={confirmDelete}
        onOpenChange={(v) => {
          setConfirmDelete(v);
          setTyped('');
        }}
        title={t('settings.delete.confirmTitle')}
        description={t('settings.delete.confirmBody')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              {t('c.cancel')}
            </Button>
            <Button
              variant="danger"
              disabled={typed !== 'DELETE'}
              loading={deleting}
              onClick={async () => {
                setDeleting(true);
                const ok = await deleteAccount();
                setDeleting(false);
                toast(ok ? t('settings.delete.done') : t('auth.err.generic'), { tone: ok ? 'neutral' : 'danger' });
              }}
            >
              {t('c.delete')}
            </Button>
          </>
        }
      >
        <Field label={t('settings.delete.confirmType')}>
          {({ id }) => <Input id={id} value={typed} onChange={(e) => setTyped(e.target.value)} dir="ltr" autoComplete="off" />}
        </Field>
      </Dialog>
    </>
  );
}

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-1 flex items-center justify-between border-b border-border pb-2">
        <h2 className="text-sm font-medium text-text-3">{title}</h2>
        {action}
      </div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-base text-text">{label}</p>
        {hint && <p className="mt-0.5 text-sm text-text-3">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
