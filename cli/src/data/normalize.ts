import type { RawSession, Session } from '../contracts.js';

// Extract displayValue from nested dict fields, handling all observed shapes
function extractDisplayValues(field: unknown): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (Array.isArray(field)) {
    return field
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'displayValue' in item) {
          return (item as { displayValue?: string }).displayValue ?? '';
        }
        return String(item);
      })
      .filter(Boolean)
      .join(', ');
  }
  if (typeof field === 'object' && field !== null && 'displayValue' in field) {
    return (field as { displayValue?: string }).displayValue ?? '';
  }
  return String(field);
}

export function normalizeSession(raw: RawSession, eventId: string): Session | null {
  const code = raw.sessionCode?.trim();
  if (!code) return null;

  return {
    sessionCode: code,
    title: raw.title?.trim() ?? '',
    description: raw.description?.trim() ?? '',
    speakers: typeof raw.speakerNames === 'string'
      ? raw.speakerNames.trim()
      : Array.isArray(raw.speakerNames)
        ? raw.speakerNames.join(', ')
        : '',
    timeSlot: raw.TimeSlot?.trim() ?? '',
    startDateTime: raw.startDateTime ?? '',
    endDateTime: raw.endDateTime ?? '',
    location: raw.location?.trim() ?? '',
    level: extractDisplayValues(raw.sessionLevel),
    type: extractDisplayValues(raw.sessionType),
    topic: extractDisplayValues(raw.topic),
    solutionArea: extractDisplayValues(raw.solutionArea),
    product: extractDisplayValues(raw.product),
    languages: extractDisplayValues(raw.programmingLanguages),
    tags: extractDisplayValues(raw.tags),
    relatedSessionCodes: Array.isArray(raw.relatedSessionCodes)
      ? raw.relatedSessionCodes.join(', ')
      : '',
    slideDeck: raw.slideDeck ?? '',
    onDemand: raw.onDemand ?? '',
    event: eventId,
  };
}

export function normalizeCatalog(raw: unknown[], eventId: string): Session[] {
  return (raw as RawSession[])
    .map((s) => normalizeSession(s, eventId))
    .filter((s): s is Session => s !== null);
}
