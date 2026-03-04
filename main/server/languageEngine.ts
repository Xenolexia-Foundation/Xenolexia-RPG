/**
 * Language-learning engine for Xenolexia RPG.
 * Uses xenolexia-typescript: VocabularyRepository (SRS), gamification (XP/levels).
 */

import { createStorageService, getLevelFromXp, XP_PER_WORD_SAVED } from 'xenolexia-typescript';
import type { VocabularyItem, Language } from 'xenolexia-typescript';
import { InMemoryRpgDataStore, type RpgDataStoreSnapshot } from './rpgDataStore';
import type { LanguageTask } from '../shared/types';

const defaultSourceLanguage: Language = 'en';
const defaultTargetLanguage: Language = 'fr';

/** Normalize answer for comparison: trim, lowercase, collapse spaces. */
export function normalizeAnswer(s: string): string {
  return (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Validate answer against accepted list or custom validator. */
export function validateAnswer(
  input: string,
  correctAnswers: string[],
  customValidate?: (input: string) => boolean
): boolean {
  if (customValidate) return customValidate(input);
  const n = normalizeAnswer(input);
  return correctAnswers.some(a => normalizeAnswer(a) === n);
}

export interface LanguageEngineState {
  dataStoreSnapshot: RpgDataStoreSnapshot;
  sourceLanguage: Language;
  targetLanguage: Language;
  languageXp: number;
}

export class LanguageEngine {
  private store: InMemoryRpgDataStore;
  private storageService: ReturnType<typeof createStorageService>;

  constructor() {
    this.store = new InMemoryRpgDataStore();
    this.storageService = createStorageService(this.store);
  }

  /** Load state from player save (e.g. player variable JSON). */
  loadState(state: LanguageEngineState | null): void {
    if (!state?.dataStoreSnapshot) return;
    this.store.loadSnapshot(state.dataStoreSnapshot);
  }

  /** Persist state for save. */
  getState(
    sourceLanguage: Language,
    targetLanguage: Language,
    languageXp: number
  ): LanguageEngineState {
    return {
      dataStoreSnapshot: this.store.getSnapshot(),
      sourceLanguage,
      targetLanguage,
      languageXp,
    };
  }

  getVocabularyRepository() {
    return this.storageService.getVocabularyRepository();
  }

  /** Add a new vocabulary item (e.g. when player learns a word in-game). */
  async addVocabulary(item: VocabularyItem): Promise<void> {
    await this.storageService.initialize();
    await this.storageService.addVocabulary(item);
  }

  /** Get vocabulary due for review (SRS). */
  async getDueForReview(limit = 10): Promise<VocabularyItem[]> {
    await this.storageService.initialize();
    return this.storageService.getVocabularyRepository().getDueForReview(limit);
  }

  /** Record a review result (quality 0–5); updates SRS. */
  async recordReview(itemId: string, quality: number): Promise<void> {
    await this.storageService.initialize();
    await this.storageService.getVocabularyRepository().recordReview(itemId, quality);
  }

  /** Build a language task from a vocabulary item (translate: show source, expect target). */
  vocabToTask(item: VocabularyItem, xpReward = XP_PER_WORD_SAVED): LanguageTask {
    return {
      id: item.id,
      type: 'translate',
      prompt: item.sourceWord,
      correctAnswers: [item.targetWord],
      xpReward,
      validate: input => validateAnswer(input, [item.targetWord]),
    };
  }

  /** Get a random task from due vocabulary (for battle or quiz). */
  async getRandomTaskFromDue(limit = 5): Promise<LanguageTask | null> {
    const due = await this.getDueForReview(limit);
    if (due.length === 0) return null;
    const item = due[Math.floor(Math.random() * due.length)];
    return this.vocabToTask(item);
  }

  /** Check if player answer is correct for a task; return XP reward if correct. */
  checkTask(task: LanguageTask, playerAnswer: string): { correct: boolean; xpReward: number } {
    const correct = task.validate
      ? task.validate(playerAnswer)
      : validateAnswer(playerAnswer, task.correctAnswers);
    return {
      correct,
      xpReward: correct ? (task.xpReward ?? XP_PER_WORD_SAVED) : 0,
    };
  }

  /** Get current level from total language XP (uses xenolexia gamification). */
  getLevelFromXp(totalXp: number): number {
    return getLevelFromXp(totalXp);
  }
}

/** Default language pair for new games. */
export function getDefaultLanguagePair(): { sourceLanguage: Language; targetLanguage: Language } {
  return { sourceLanguage: defaultSourceLanguage, targetLanguage: defaultTargetLanguage };
}
