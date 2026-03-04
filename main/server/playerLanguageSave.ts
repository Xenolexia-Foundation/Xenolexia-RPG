/**
 * Load/save language state from RPGJS player variables.
 * State is stored under variable LANGUAGE_SAVE_KEY as JSON.
 */

import type { RpgPlayer } from '@rpgjs/server';
import type { PlayerLanguageSave } from '../shared/types';
import type { LanguageEngineState } from './languageEngine';
import { getDefaultLanguagePair } from './languageEngine';

export const LANGUAGE_SAVE_KEY = 'xenolexia_language_save';

export function getPlayerLanguageSave(player: RpgPlayer): PlayerLanguageSave | null {
  const raw = player.getVariable(LANGUAGE_SAVE_KEY);
  if (raw == null || typeof raw !== 'string') return null;
  try {
    const data = JSON.parse(raw) as PlayerLanguageSave;
    if (!data.vocabulary || !Array.isArray(data.vocabulary)) return null;
    // Rehydrate dates (parsed from JSON so values may be strings)
    data.vocabulary = data.vocabulary.map(v => {
      const item = v as unknown as Record<string, unknown>;
      return {
        ...item,
        addedAt: item.addedAt ? new Date(item.addedAt as string) : new Date(),
        lastReviewedAt: item.lastReviewedAt ? new Date(item.lastReviewedAt as string) : null,
      } as PlayerLanguageSave['vocabulary'][number];
    }) as PlayerLanguageSave['vocabulary'];
    return data;
  } catch {
    return null;
  }
}

export function setPlayerLanguageSave(player: RpgPlayer, save: PlayerLanguageSave): void {
  const toStore = {
    ...save,
    vocabulary: save.vocabulary.map(v => ({
      ...v,
      addedAt: v.addedAt instanceof Date ? v.addedAt.toISOString() : v.addedAt,
      lastReviewedAt:
        v.lastReviewedAt instanceof Date ? v.lastReviewedAt.toISOString() : v.lastReviewedAt,
    })),
  };
  player.setVariable(LANGUAGE_SAVE_KEY, JSON.stringify(toStore));
}

/** Get engine state from player variable (for LanguageEngine.loadState). */
export function getPlayerEngineState(player: RpgPlayer): LanguageEngineState | null {
  const save = getPlayerLanguageSave(player);
  if (!save) return null;
  return {
    dataStoreSnapshot: {
      vocabulary: save.vocabulary.map(v => ({
        id: v.id,
        source_word: v.sourceWord,
        target_word: v.targetWord,
        source_lang: v.sourceLanguage,
        target_lang: v.targetLanguage,
        context_sentence: v.contextSentence ?? null,
        book_id: v.bookId ?? null,
        book_title: v.bookTitle ?? null,
        added_at: v.addedAt instanceof Date ? v.addedAt.getTime() : new Date(v.addedAt).getTime(),
        last_reviewed_at: v.lastReviewedAt
          ? v.lastReviewedAt instanceof Date
            ? v.lastReviewedAt.getTime()
            : new Date(v.lastReviewedAt).getTime()
          : null,
        review_count: v.reviewCount,
        ease_factor: v.easeFactor,
        interval: v.interval,
        status: v.status,
      })),
      preferences: {},
    },
    sourceLanguage: save.sourceLanguage,
    targetLanguage: save.targetLanguage,
    languageXp: save.languageXp ?? 0,
  };
}

/** Persist engine state to player (from LanguageEngine.getState). */
export function setPlayerEngineState(
  player: RpgPlayer,
  state: LanguageEngineState,
  questProgress?: Record<string, string[]>
): void {
  const current = getPlayerLanguageSave(player);
  const save: PlayerLanguageSave = {
    sourceLanguage: state.sourceLanguage,
    targetLanguage: state.targetLanguage,
    vocabulary: state.dataStoreSnapshot.vocabulary.map(r => ({
      id: r.id,
      sourceWord: r.source_word,
      targetWord: r.target_word,
      sourceLanguage: r.source_lang as PlayerLanguageSave['vocabulary'][0]['sourceLanguage'],
      targetLanguage: r.target_lang as PlayerLanguageSave['vocabulary'][0]['targetLanguage'],
      contextSentence: r.context_sentence,
      bookId: r.book_id,
      bookTitle: r.book_title ?? null,
      addedAt: new Date(r.added_at),
      lastReviewedAt: r.last_reviewed_at ? new Date(r.last_reviewed_at) : null,
      reviewCount: r.review_count,
      easeFactor: r.ease_factor,
      interval: r.interval,
      status: r.status as PlayerLanguageSave['vocabulary'][0]['status'],
    })),
    questProgress: questProgress ?? current?.questProgress ?? {},
    languageXp: state.languageXp,
  };
  setPlayerLanguageSave(player, save);
}

export function getOrCreatePlayerLanguageSave(player: RpgPlayer): PlayerLanguageSave {
  const existing = getPlayerLanguageSave(player);
  if (existing) return existing;
  const { sourceLanguage, targetLanguage } = getDefaultLanguagePair();
  return {
    sourceLanguage,
    targetLanguage,
    vocabulary: [],
    questProgress: {},
    languageXp: 0,
  };
}

/** Data for the Lexicon GUI: vocabulary list + count due for review. */
export function getLexiconData(player: RpgPlayer): {
  vocabulary: PlayerLanguageSave['vocabulary'];
  dueCount: number;
} {
  const save = getOrCreatePlayerLanguageSave(player);
  const now = Date.now();
  let dueCount = 0;
  for (const v of save.vocabulary) {
    if (v.status === 'new' || v.status === 'learning') {
      dueCount++;
      continue;
    }
    const last = v.lastReviewedAt
      ? v.lastReviewedAt instanceof Date
        ? v.lastReviewedAt.getTime()
        : new Date(v.lastReviewedAt).getTime()
      : v.addedAt instanceof Date
        ? v.addedAt.getTime()
        : 0;
    const next = last + (v.interval || 0) * 24 * 60 * 60 * 1000;
    if (now >= next) dueCount++;
  }
  return { vocabulary: save.vocabulary, dueCount };
}
