/**
 * Grammar rules for language challenges (French).
 * Used in dialogue and battles for conjugate / fill-in-blank tasks.
 */

import type { GrammarRule } from '../shared/types';
import { normalizeAnswer } from './languageEngine';

function norm(s: string): string {
  return normalizeAnswer(s);
}

/** French present tense "tu" conjugation for -er verbs (e.g. parler -> parles). */
export const GRAMMAR_TU_ER: GrammarRule = {
  id: 'fr_tu_er',
  description: 'Conjugate -er verbs in present tense for "tu" (e.g. parler → parles)',
  examples: ['parler → parles', 'manger → manges'],
  validate: (input: string) => {
    const n = norm(input);
    return n === 'parles' || n === 'manges' || n === 'aimes' || n === 'danses';
  },
};

/** French "tu" form of avoir and être. */
export const GRAMMAR_TU_AVOIR_ETRE: GrammarRule = {
  id: 'fr_tu_avoir_etre',
  description: 'Conjugate avoir and être for "tu" in present (avoir → as, être → es)',
  examples: ['avoir → as', 'être → es'],
  validate: (input: string) => {
    const n = norm(input);
    return n === 'as' || n === 'es';
  },
};

/** Fill in the blank: "Je ___ français" (parle). */
export const GRAMMAR_JE_PARLER: GrammarRule = {
  id: 'fr_je_parler',
  description: 'Complete: "Je ___ français" (I speak French)',
  examples: ['Je parle français', 'parler → parle'],
  validate: (input: string) => norm(input) === 'parle',
};

export const GRAMMAR_RULES: GrammarRule[] = [
  GRAMMAR_TU_ER,
  GRAMMAR_TU_AVOIR_ETRE,
  GRAMMAR_JE_PARLER,
];

export interface GrammarTaskPayload {
  ruleId: string;
  prompt: string;
  correctAnswers: string[];
  validate: (input: string) => boolean;
}

/** Build a language task from a grammar rule (for battles/dialogue). */
export function grammarRuleToTask(rule: GrammarRule, prompt: string): GrammarTaskPayload {
  return {
    ruleId: rule.id,
    prompt,
    correctAnswers: rule.examples.map(ex => ex.split('→')[1]?.trim() || ex),
    validate: rule.validate,
  };
}

/** Get a random grammar task for "tu" conjugation or fill-in-blank. */
export function getRandomGrammarTask(): GrammarTaskPayload {
  const rule = GRAMMAR_RULES[Math.floor(Math.random() * GRAMMAR_RULES.length)];
  const prompts: Record<string, string> = {
    fr_tu_er: 'Conjugate "parler" for "tu" (present):',
    fr_tu_avoir_etre: 'How do you say "you have" in French? (tu form of avoir)',
    fr_je_parler: 'Complete: "Je ___ français" (I speak French):',
  };
  return grammarRuleToTask(rule, prompts[rule.id] || rule.description);
}

export function getGrammarRule(id: string): GrammarRule | undefined {
  return GRAMMAR_RULES.find(r => r.id === id);
}
