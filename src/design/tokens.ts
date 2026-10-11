/** Tokens needed in TypeScript (motion, subject palette). Visual tokens live in tokens.css. */

export const motion = {
  fast: 0.12,
  base: 0.18,
  slow: 0.24,
  sheet: 0.3,
  ease: [0.2, 0, 0, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
  emphasized: [0.05, 0.7, 0.1, 1] as const,
};

/** Ten subject colours tuned to similar lightness so no subject shouts louder than another. */
export const SUBJECT_COLORS = [
  { id: 'coral', hex: '#EF8A6F' },
  { id: 'amber', hex: '#E3B04F' },
  { id: 'lime', hex: '#A9C65C' },
  { id: 'jade', hex: '#4FC59B' },
  { id: 'teal', hex: '#41B6C2' },
  { id: 'sky', hex: '#62A6E6' },
  { id: 'periwinkle', hex: '#8E96EE' },
  { id: 'orchid', hex: '#C68ADB' },
  { id: 'rose', hex: '#E880A3' },
  { id: 'sand', hex: '#C6A981' },
] as const;

export type SubjectColorId = (typeof SUBJECT_COLORS)[number]['id'];

/** CSS colour for a subject, darkened in light theme via --subject-mix. */
export function subjectColor(hex: string): string {
  return `color-mix(in oklab, ${hex} var(--subject-mix), #000)`;
}
