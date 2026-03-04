/**
 * Sanity checks for shared types (re-exports and shape).
 */

import type { Quest, QuestTask, LanguageTask, GrammarRule, PlayerLanguageSave } from '../types';

describe('shared types', () => {
  it('Quest has required fields', () => {
    const q: Quest = {
      id: 'q1',
      title: 'Test',
      description: 'Desc',
      tasks: [],
      rewards: { xp: 10 },
    };
    expect(q.id).toBe('q1');
    expect(q.rewards.xp).toBe(10);
  });

  it('QuestTask type allows answer_question', () => {
    const t: QuestTask = {
      id: 't1',
      type: 'answer_question',
      prompt: 'Hello?',
      acceptedAnswers: ['bonjour'],
    };
    expect(t.type).toBe('answer_question');
  });

  it('LanguageTask has validate optional', () => {
    const task: LanguageTask = {
      id: 'lt1',
      type: 'translate',
      prompt: 'hello',
      correctAnswers: ['bonjour'],
    };
    expect(task.validate).toBeUndefined();
    const withValidate: LanguageTask = {
      ...task,
      validate: x => x === 'bonjour',
    };
    expect(withValidate.validate?.('bonjour')).toBe(true);
  });

  it('GrammarRule has validate function', () => {
    const rule: GrammarRule = {
      id: 'r1',
      description: 'Test',
      examples: ['a → b'],
      validate: x => x === 'b',
    };
    expect(rule.validate('b')).toBe(true);
  });

  it('PlayerLanguageSave has vocabulary and questProgress', () => {
    const save: PlayerLanguageSave = {
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      vocabulary: [],
      questProgress: {},
    };
    expect(save.vocabulary).toEqual([]);
    expect(save.questProgress).toEqual({});
  });
});
