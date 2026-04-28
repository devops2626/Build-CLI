// Shared types for the CLI

export interface RawSession {
  sessionCode?: string;
  title?: string;
  description?: string;
  speakerNames?: string | string[];
  TimeSlot?: string;
  startDateTime?: string;
  endDateTime?: string;
  location?: string;
  sessionLevel?: Array<{ displayValue?: string; logicalValue?: string }> | string;
  sessionType?: { displayValue?: string; logicalValue?: string } | string;
  topic?: Array<{ displayValue?: string; logicalValue?: string }> | string;
  solutionArea?: Array<{ displayValue?: string; logicalValue?: string }> | string;
  product?: Array<{ displayValue?: string; logicalValue?: string } | string>;
  programmingLanguages?: Array<{ displayValue?: string; logicalValue?: string } | string>;
  tags?: Array<{ displayValue?: string; logicalValue?: string } | string>;
  relatedSessionCodes?: string[];
  slideDeck?: string;
  onDemand?: string;
  [key: string]: unknown;
}

export interface Session {
  sessionCode: string;
  title: string;
  description: string;
  speakers: string;
  timeSlot: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  level: string;
  type: string;
  topic: string;
  solutionArea: string;
  product: string;
  languages: string;
  tags: string;
  relatedSessionCodes: string;
  slideDeck: string;
  onDemand: string;
  event: string;
}

export interface EventConfig {
  id: string;
  name: string;
  endpoint: string;
}

export interface CacheMeta {
  eventId: string;
  fetchedAt: string;
  sessionCount: number;
  etag?: string;
  lastModified?: string;
}

export interface SearchResult {
  session: Session;
  score: number;
}
