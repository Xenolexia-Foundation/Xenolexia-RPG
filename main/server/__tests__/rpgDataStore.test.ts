/**
 * Unit tests for InMemoryRpgDataStore (vocabulary + snapshot).
 */

import type { VocabularyRow } from 'xenolexia-typescript';
import { InMemoryRpgDataStore } from '../rpgDataStore';

function makeRow(overrides: Partial<VocabularyRow> = {}): VocabularyRow {
  return {
    id: 'v1',
    source_word: 'hello',
    target_word: 'bonjour',
    source_lang: 'en',
    target_lang: 'fr',
    context_sentence: null,
    book_id: null,
    book_title: null,
    added_at: Date.now() - 86400000,
    last_reviewed_at: null,
    review_count: 0,
    ease_factor: 2.5,
    interval: 0,
    status: 'new',
    ...overrides,
  };
}

describe('InMemoryRpgDataStore', () => {
  let store: InMemoryRpgDataStore;

  beforeEach(() => {
    store = new InMemoryRpgDataStore();
  });

  describe('vocabulary', () => {
    it('adds and gets by id', async () => {
      const row = makeRow({ id: 'v1' });
      await store.addVocabulary(row);
      expect(await store.getVocabularyById('v1')).toEqual(row);
    });

    it('getVocabulary returns all when no options', async () => {
      await store.addVocabulary(makeRow({ id: 'v1' }));
      await store.addVocabulary(makeRow({ id: 'v2', source_word: 'bye' }));
      const list = await store.getVocabulary({});
      expect(list.length).toBe(2);
    });

    it('getVocabulary with dueForReview returns new/learning or overdue', async () => {
      const now = Date.now();
      await store.addVocabulary(makeRow({ id: 'v1', status: 'new' }));
      await store.addVocabulary(
        makeRow({
          id: 'v2',
          status: 'review',
          last_reviewed_at: now - 8 * 24 * 60 * 60 * 1000,
          interval: 7,
        })
      );
      const due = await store.getVocabulary({ dueForReview: { now, limit: 10 } });
      expect(due.some(r => r.id === 'v1')).toBe(true);
      expect(due.some(r => r.id === 'v2')).toBe(true);
    });

    it('updateVocabulary updates row', async () => {
      await store.addVocabulary(makeRow({ id: 'v1', status: 'new' }));
      await store.updateVocabulary('v1', { status: 'learning', review_count: 1 });
      const row = await store.getVocabularyById('v1');
      expect(row?.status).toBe('learning');
      expect(row?.review_count).toBe(1);
    });

    it('deleteVocabulary removes row', async () => {
      await store.addVocabulary(makeRow({ id: 'v1' }));
      await store.deleteVocabulary('v1');
      expect(await store.getVocabularyById('v1')).toBeNull();
    });

    it('getVocabularyStatistics returns counts', async () => {
      await store.addVocabulary(makeRow({ id: 'v1', status: 'new' }));
      await store.addVocabulary(makeRow({ id: 'v2', status: 'learning' }));
      const stats = await store.getVocabularyStatistics();
      expect(stats.total).toBe(2);
      expect(stats.new_count).toBe(1);
      expect(stats.learning_count).toBe(1);
    });
  });

  describe('getSnapshot / loadSnapshot', () => {
    it('round-trips vocabulary and preferences', async () => {
      await store.addVocabulary(makeRow({ id: 'v1' }));
      await store.setPreference('key1', 'value1');
      const snap = store.getSnapshot();
      expect(snap.vocabulary.length).toBe(1);
      expect(snap.preferences.key1).toBe('value1');

      const store2 = new InMemoryRpgDataStore();
      store2.loadSnapshot(snap);
      expect(await store2.getVocabularyById('v1')).not.toBeNull();
      expect(await store2.getPreference('key1')).toBe('value1');
    });
  });
});
