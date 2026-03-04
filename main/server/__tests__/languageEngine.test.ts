/**
 * Unit tests for LanguageEngine and helpers (normalizeAnswer, validateAnswer, checkTask).
 */

import {
  normalizeAnswer,
  validateAnswer,
  getDefaultLanguagePair,
  LanguageEngine,
} from '../languageEngine';
import type { VocabularyItem } from 'xenolexia-typescript';

describe('normalizeAnswer', () => {
  it('trims and lowercases', () => {
    expect(normalizeAnswer('  BONJOUR  ')).toBe('bonjour');
  });

  it('collapses spaces', () => {
    expect(normalizeAnswer('au   revoir')).toBe('au revoir');
  });

  it('handles empty and nullish', () => {
    expect(normalizeAnswer('')).toBe('');
    expect(normalizeAnswer(null as unknown as string)).toBe('');
    expect(normalizeAnswer(undefined as unknown as string)).toBe('');
  });
});

describe('validateAnswer', () => {
  it('accepts exact match after normalization', () => {
    expect(validateAnswer('Bonjour', ['bonjour'])).toBe(true);
    expect(validateAnswer('  parles  ', ['parles'])).toBe(true);
  });

  it('accepts any of correct answers', () => {
    expect(validateAnswer('salut', ['bonjour', 'salut'])).toBe(true);
  });

  it('rejects wrong answer', () => {
    expect(validateAnswer('oui', ['bonjour'])).toBe(false);
  });

  it('uses custom validator when provided', () => {
    expect(validateAnswer('parles', [], x => x.toLowerCase() === 'parles')).toBe(true);
    expect(validateAnswer('parle', [], x => x.toLowerCase() === 'parles')).toBe(false);
  });
});

describe('getDefaultLanguagePair', () => {
  it('returns en and fr', () => {
    const pair = getDefaultLanguagePair();
    expect(pair.sourceLanguage).toBe('en');
    expect(pair.targetLanguage).toBe('fr');
  });
});

describe('LanguageEngine', () => {
  const makeVocabItem = (overrides: Partial<VocabularyItem> = {}): VocabularyItem =>
    ({
      id: 'v1',
      sourceWord: 'hello',
      targetWord: 'bonjour',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      contextSentence: null,
      bookId: null,
      bookTitle: null,
      addedAt: new Date(),
      lastReviewedAt: null,
      reviewCount: 0,
      easeFactor: 2.5,
      interval: 0,
      status: 'new',
      ...overrides,
    }) as VocabularyItem;

  describe('vocabToTask and checkTask', () => {
    it('builds task and validates correct answer', () => {
      const engine = new LanguageEngine();
      const item = makeVocabItem();
      const task = engine.vocabToTask(item);
      expect(task.prompt).toBe('hello');
      expect(task.correctAnswers).toEqual(['bonjour']);
      const result = engine.checkTask(task, 'Bonjour');
      expect(result.correct).toBe(true);
      expect(result.xpReward).toBeGreaterThan(0);
    });

    it('checkTask returns correct false and 0 xp for wrong answer', () => {
      const engine = new LanguageEngine();
      const item = makeVocabItem();
      const task = engine.vocabToTask(item);
      const result = engine.checkTask(task, 'oui');
      expect(result.correct).toBe(false);
      expect(result.xpReward).toBe(0);
    });
  });

  describe('loadState / getState', () => {
    it('round-trips state', () => {
      const engine = new LanguageEngine();
      const state = engine.getState('en', 'fr', 100);
      expect(state.sourceLanguage).toBe('en');
      expect(state.targetLanguage).toBe('fr');
      expect(state.languageXp).toBe(100);

      const engine2 = new LanguageEngine();
      engine2.loadState(null);
      engine2.loadState(state);
      const state2 = engine2.getState('en', 'fr', 100);
      expect(state2.dataStoreSnapshot.vocabulary).toEqual(state.dataStoreSnapshot.vocabulary);
    });
  });

  describe('getLevelFromXp', () => {
    it('returns level from xenolexia gamification', () => {
      const engine = new LanguageEngine();
      expect(engine.getLevelFromXp(0)).toBe(1);
      expect(engine.getLevelFromXp(100)).toBe(2);
    });
  });
});
