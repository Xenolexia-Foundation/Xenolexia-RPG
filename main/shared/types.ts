/**
 * Xenolexia RPG – shared types for language-learning game.
 * Reuses Language, VocabularyItem, etc. from xenolexia-typescript where applicable.
 */

import type { Language, VocabularyItem } from 'xenolexia-typescript';

export type { Language, VocabularyItem, VocabularyStatus } from 'xenolexia-typescript';

// Re-export for convenience
export type { LanguagePair, ProficiencyLevel } from 'xenolexia-typescript';

// ---------------------------------------------------------------------------
// Grammar (RPG-specific; xenolexia-typescript has no GrammarRule)
// ---------------------------------------------------------------------------

export interface GrammarRule {
  id: string;
  description: string;
  examples: string[];
  /** Validates player input (e.g. conjugation, fill-in-blank). */
  validate: (input: string) => boolean;
}

// ---------------------------------------------------------------------------
// Quests
// ---------------------------------------------------------------------------

export type QuestTaskType =
  | 'talk_to_npc'
  | 'answer_question'
  | 'collect_vocab'
  | 'dialogue_challenge'
  | 'translate'
  | 'conjugate';

export interface QuestTask {
  id: string;
  type: QuestTaskType;
  /** e.g. NPC event name or vocab id */
  targetId?: string;
  prompt?: string;
  /** For answer_question / translate: accepted answers (exact or normalized). */
  acceptedAnswers?: string[];
  /** For dialogue_challenge: correct choice index or text. */
  correctChoice?: number | string;
  completed?: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  tasks: QuestTask[];
  rewards: { xp: number; gold?: number; items?: string[] };
  /** Optional: required quest id to unlock */
  requiredQuestId?: string;
}

// ---------------------------------------------------------------------------
// Dialogue challenges (NPC)
// ---------------------------------------------------------------------------

export interface DialogueChoice {
  text: string;
  /** If set, this choice is the correct answer for a language challenge. */
  correct?: boolean;
  /** Next dialogue id or null to end. */
  nextId?: string | null;
}

export interface DialogueNode {
  id: string;
  /** Text in target language (e.g. French). */
  text: string;
  /** Optional translation hint for the player. */
  hint?: string;
  choices?: DialogueChoice[];
  /** If no choices, next node id. */
  nextId?: string | null;
}

export interface DialogueTree {
  id: string;
  startId: string;
  nodes: Record<string, DialogueNode>;
}

// ---------------------------------------------------------------------------
// Language task (battle / quiz)
// ---------------------------------------------------------------------------

export type LanguageTaskType =
  | 'translate'
  | 'conjugate'
  | 'fill_blank'
  | 'listen_repeat'
  | 'multiple_choice';

export interface LanguageTask {
  id: string;
  type: LanguageTaskType;
  /** Question in source or target language. */
  prompt: string;
  /** Correct answer(s); validate may do normalization. */
  correctAnswers: string[];
  /** Optional audio URL for listen_repeat. */
  audioUrl?: string;
  /** Custom validator; if not set, use normalized string match. */
  validate?: (input: string) => boolean;
  /** XP reward for correct answer. */
  xpReward?: number;
}

// ---------------------------------------------------------------------------
// Player save (vocabulary + quest progress; RPGJS handles position, gold, etc.)
// ---------------------------------------------------------------------------

export interface PlayerLanguageSave {
  /** Language pair for this save. */
  sourceLanguage: Language;
  targetLanguage: Language;
  /** Vocabulary items (SRS state). */
  vocabulary: VocabularyItem[];
  /** Quest id -> completed task ids. */
  questProgress: Record<string, string[]>;
  /** Total XP from language activities (can be merged with RPGJS exp). */
  languageXp?: number;
}
