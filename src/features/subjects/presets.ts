import type { MessageKey } from '@/locales/en';

export interface SubjectPreset {
  key: string;
  nameKey: MessageKey;
  icon: string;
  color: string;
  /** Selected by default during onboarding. */
  core: boolean;
}

/** Bahrain public secondary track, editable at any time. */
export const SUBJECT_PRESETS: SubjectPreset[] = [
  { key: 'arabic', nameKey: 'subject.preset.arabic', icon: 'pen-line', color: '#C6A981', core: true },
  { key: 'english', nameKey: 'subject.preset.english', icon: 'languages', color: '#62A6E6', core: true },
  { key: 'math', nameKey: 'subject.preset.math', icon: 'calculator', color: '#EF8A6F', core: true },
  { key: 'physics', nameKey: 'subject.preset.physics', icon: 'atom', color: '#8E96EE', core: true },
  { key: 'chemistry', nameKey: 'subject.preset.chemistry', icon: 'flask-conical', color: '#41B6C2', core: true },
  { key: 'biology', nameKey: 'subject.preset.biology', icon: 'dna', color: '#A9C65C', core: true },
  { key: 'islamic', nameKey: 'subject.preset.islamic', icon: 'book-marked', color: '#4FC59B', core: true },
  { key: 'citizenship', nameKey: 'subject.preset.citizenship', icon: 'landmark', color: '#E3B04F', core: true },
  { key: 'design', nameKey: 'subject.preset.design', icon: 'palette', color: '#C68ADB', core: false },
];
