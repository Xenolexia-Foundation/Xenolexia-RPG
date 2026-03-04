/**
 * In-memory IDataStore for Xenolexia RPG.
 * Implements only vocabulary + preferences so we can use xenolexia's VocabularyRepository
 * and persist state via player variables (serialize/deserialize).
 */

import type {
  IDataStore,
  VocabularyRow,
  VocabularyFilter,
  VocabularySort,
  BookRow,
  BookSort,
  BookFilter,
  SessionRow,
  WordListRow,
} from 'xenolexia-typescript';
import type { ReadingStats } from 'xenolexia-typescript';

const noop = (): Promise<void> => Promise.resolve();
const noopNull = <T>(): Promise<T | null> => Promise.resolve(null);
const noopArray = <T>(): Promise<T[]> => Promise.resolve([]);
const noopNumber = (): Promise<number> => Promise.resolve(0);

/** Normalize string for comparison (trim, lowercase). */
function norm(s: string): string {
  return (s || '').trim().toLowerCase();
}

/** Check if a vocabulary row is due for review at `now`. */
function isDueForReview(row: VocabularyRow, now: number): boolean {
  if (row.status === 'new') return true;
  if (row.status === 'learning') return true;
  const last = row.last_reviewed_at ?? row.added_at;
  const intervalMs = (row.interval || 0) * 24 * 60 * 60 * 1000;
  return last + intervalMs <= now;
}

export interface RpgDataStoreSnapshot {
  vocabulary: VocabularyRow[];
  preferences: Record<string, string>;
}

export class InMemoryRpgDataStore implements IDataStore {
  private vocabulary = new Map<string, VocabularyRow>();
  private vocabularyList: VocabularyRow[] = [];
  private preferences = new Map<string, string>();
  private schemaVersion = 1;

  async initialize(): Promise<void> {
    /* no-op */
  }
  async close(): Promise<void> {
    /* no-op */
  }
  isReady(): boolean {
    return true;
  }
  async getSchemaVersion(): Promise<number> {
    return this.schemaVersion;
  }

  // --- Vocabulary (full implementation) ---
  async getVocabularyById(id: string): Promise<VocabularyRow | null> {
    return this.vocabulary.get(id) ?? null;
  }

  async getVocabulary(options?: {
    filter?: VocabularyFilter;
    sort?: VocabularySort;
    limit?: number;
    addedAtGte?: number;
    dueForReview?: { now: number; limit: number };
  }): Promise<VocabularyRow[]> {
    let list = [...this.vocabularyList];

    if (options?.dueForReview) {
      const { now, limit } = options.dueForReview;
      list = list.filter(r => isDueForReview(r, now)).slice(0, limit);
    }
    if (options?.addedAtGte != null) {
      const gte = options.addedAtGte;
      list = list.filter(r => r.added_at >= gte);
    }
    if (options?.filter) {
      const f = options.filter;
      if (f.status != null) list = list.filter(r => r.status === f.status);
      if (f.book_id != null) list = list.filter(r => r.book_id === f.book_id);
      if (f.source_lang != null) list = list.filter(r => r.source_lang === f.source_lang);
      if (f.target_lang != null) list = list.filter(r => r.target_lang === f.target_lang);
    }
    if (options?.sort) {
      const { by, order } = options.sort;
      const mult = order === 'asc' ? 1 : -1;
      list.sort((a, b) => {
        let v = 0;
        if (by === 'addedAt') v = a.added_at - b.added_at;
        else if (by === 'lastReviewedAt') v = (a.last_reviewed_at ?? 0) - (b.last_reviewed_at ?? 0);
        else if (by === 'sourceWord') v = norm(a.source_word).localeCompare(norm(b.source_word));
        else if (by === 'status') v = a.status.localeCompare(b.status);
        return v * mult;
      });
    }
    const limit = options?.limit ?? 999;
    return list.slice(0, limit);
  }

  async addVocabulary(row: VocabularyRow): Promise<void> {
    const entry = { ...row };
    this.vocabulary.set(row.id, entry);
    this.vocabularyList.push(entry);
  }

  async updateVocabulary(id: string, updates: Partial<VocabularyRow>): Promise<void> {
    const row = this.vocabulary.get(id);
    if (!row) return;
    const updated = { ...row, ...updates };
    this.vocabulary.set(id, updated);
    const idx = this.vocabularyList.findIndex(r => r.id === id);
    if (idx >= 0) this.vocabularyList[idx] = updated;
  }

  async deleteVocabulary(id: string): Promise<void> {
    this.vocabulary.delete(id);
    this.vocabularyList = this.vocabularyList.filter(r => r.id !== id);
  }

  async deleteAllVocabulary(): Promise<void> {
    this.vocabulary.clear();
    this.vocabularyList = [];
  }

  async getVocabularyDueCount(now: number): Promise<number> {
    const due = this.vocabularyList.filter(r => isDueForReview(r, now));
    return due.length;
  }

  async getVocabularyStatistics(): Promise<{
    total: number;
    new_count: number;
    learning_count: number;
    review_count: number;
    learned_count: number;
    due: number;
  }> {
    const now = Date.now();
    const list = this.vocabularyList;
    return {
      total: list.length,
      new_count: list.filter(r => r.status === 'new').length,
      learning_count: list.filter(r => r.status === 'learning').length,
      review_count: list.filter(r => r.status === 'review').length,
      learned_count: list.filter(r => r.status === 'learned').length,
      due: list.filter(r => isDueForReview(r, now)).length,
    };
  }

  async getVocabularyCountByStatus(status: string): Promise<number> {
    return this.vocabularyList.filter(r => r.status === status).length;
  }

  // --- Preferences (for save blob) ---
  async getPreference(key: string): Promise<string | null> {
    return this.preferences.get(key) ?? null;
  }

  async setPreference(key: string, value: string): Promise<void> {
    this.preferences.set(key, value);
  }

  // --- Stubs for Books, Sessions, WordList, runTransaction ---
  async getBookById(): Promise<BookRow | null> {
    return noopNull();
  }
  async getBooks(_opts?: {
    sort?: BookSort;
    filter?: BookFilter;
    limit?: number;
  }): Promise<BookRow[]> {
    return noopArray();
  }
  async addBook(): Promise<void> {
    return noop();
  }
  async updateBook(): Promise<void> {
    return noop();
  }
  async deleteBook(): Promise<void> {
    return noop();
  }
  async deleteAllBooks(): Promise<void> {
    return noop();
  }
  async getBookCount(): Promise<number> {
    return noopNumber();
  }
  async getBookStatistics(): Promise<{
    total: number;
    in_progress: number;
    completed: number;
    total_time: number;
  }> {
    return Promise.resolve({ total: 0, in_progress: 0, completed: 0, total_time: 0 });
  }

  async getSessionById(): Promise<SessionRow | null> {
    return noopNull();
  }
  async getSessionsByBookId(): Promise<SessionRow[]> {
    return noopArray();
  }
  async getRecentSessions(): Promise<SessionRow[]> {
    return noopArray();
  }
  async getTodaySessions(): Promise<SessionRow[]> {
    return noopArray();
  }
  async addSession(): Promise<void> {
    return noop();
  }
  async updateSession(): Promise<void> {
    return noop();
  }
  async deleteSession(): Promise<void> {
    return noop();
  }
  async deleteSessionsByBookId(): Promise<void> {
    return noop();
  }
  async deleteAllSessions(): Promise<void> {
    return noop();
  }
  async getSessionStatistics(): Promise<ReadingStats> {
    return Promise.resolve({
      totalBooksRead: 0,
      totalReadingTime: 0,
      totalWordsLearned: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageSessionDuration: 0,
      wordsRevealedToday: 0,
      wordsSavedToday: 0,
    });
  }
  async getReadingTimeForPeriod(): Promise<number> {
    return noopNumber();
  }
  async getDailyReadingTime(): Promise<Array<{ date: string; minutes: number }>> {
    return noopArray();
  }
  async getDistinctSessionDays(): Promise<string[]> {
    return noopArray();
  }

  async getWordListEntry(): Promise<WordListRow | null> {
    return noopNull();
  }
  async getWordListEntryByVariant(): Promise<WordListRow | null> {
    return noopNull();
  }
  async getWordListByLevel(): Promise<WordListRow[]> {
    return noopArray();
  }
  async getWordListByLangs(): Promise<WordListRow[]> {
    return noopArray();
  }
  async getWordListCount(): Promise<number> {
    return noopNumber();
  }
  async addWordListEntry(): Promise<void> {
    return noop();
  }
  async deleteWordListByPair(): Promise<void> {
    return noop();
  }
  async getWordListProficiencyCounts(): Promise<Record<string, number>> {
    return Promise.resolve({});
  }
  async getWordListPosCounts(): Promise<Record<string, number>> {
    return Promise.resolve({});
  }
  async getWordListStats(): Promise<{
    total: number;
    pairs: Array<{ source_lang: string; target_lang: string; count: number }>;
  }> {
    return Promise.resolve({ total: 0, pairs: [] });
  }
  async getWordListSearch(): Promise<WordListRow[]> {
    return noopArray();
  }

  async runTransaction(operations: Array<{ method: string; args: unknown[] }>): Promise<void> {
    for (const op of operations) {
      const m = (this as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>)[
        op.method
      ];
      if (m && typeof m === 'function') await m.apply(this, op.args);
    }
  }

  // --- Snapshot for player save ---
  getSnapshot(): RpgDataStoreSnapshot {
    return {
      vocabulary: this.vocabularyList.map(r => ({ ...r })),
      preferences: Object.fromEntries(this.preferences),
    };
  }

  loadSnapshot(snapshot: RpgDataStoreSnapshot): void {
    this.vocabulary.clear();
    this.vocabularyList = [];
    for (const row of snapshot.vocabulary) {
      const entry = { ...row };
      this.vocabulary.set(row.id, entry);
      this.vocabularyList.push(entry);
    }
    this.preferences.clear();
    for (const [k, v] of Object.entries(snapshot.preferences)) {
      this.preferences.set(k, v);
    }
  }
}
