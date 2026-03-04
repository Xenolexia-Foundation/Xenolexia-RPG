/**
 * Unit tests for grammar rules and getRandomGrammarTask.
 */

import {
  GRAMMAR_RULES,
  GRAMMAR_TU_ER,
  GRAMMAR_TU_AVOIR_ETRE,
  GRAMMAR_JE_PARLER,
  getRandomGrammarTask,
  getGrammarRule,
} from '../grammarRules';

describe('grammarRules', () => {
  describe('GRAMMAR_TU_ER', () => {
    it('accepts parles, manges, aimes, danses', () => {
      expect(GRAMMAR_TU_ER.validate('parles')).toBe(true);
      expect(GRAMMAR_TU_ER.validate('  Parles  ')).toBe(true);
      expect(GRAMMAR_TU_ER.validate('manges')).toBe(true);
      expect(GRAMMAR_TU_ER.validate('aimes')).toBe(true);
      expect(GRAMMAR_TU_ER.validate('danses')).toBe(true);
    });

    it('rejects wrong forms', () => {
      expect(GRAMMAR_TU_ER.validate('parle')).toBe(false);
      expect(GRAMMAR_TU_ER.validate('parlons')).toBe(false);
    });
  });

  describe('GRAMMAR_TU_AVOIR_ETRE', () => {
    it('accepts as and es', () => {
      expect(GRAMMAR_TU_AVOIR_ETRE.validate('as')).toBe(true);
      expect(GRAMMAR_TU_AVOIR_ETRE.validate('es')).toBe(true);
    });

    it('rejects other', () => {
      expect(GRAMMAR_TU_AVOIR_ETRE.validate('est')).toBe(false);
    });
  });

  describe('GRAMMAR_JE_PARLER', () => {
    it('accepts parle', () => {
      expect(GRAMMAR_JE_PARLER.validate('parle')).toBe(true);
    });

    it('rejects parles', () => {
      expect(GRAMMAR_JE_PARLER.validate('parles')).toBe(false);
    });
  });

  describe('getRandomGrammarTask', () => {
    it('returns payload with prompt, correctAnswers, validate', () => {
      for (let i = 0; i < 20; i++) {
        const task = getRandomGrammarTask();
        expect(task.prompt).toBeDefined();
        expect(Array.isArray(task.correctAnswers)).toBe(true);
        expect(typeof task.validate).toBe('function');
        expect(task.correctAnswers.length).toBeGreaterThan(0);
        // At least one correct answer should pass the rule's validate
        const someCorrect = task.correctAnswers.some(a => task.validate(a));
        expect(someCorrect).toBe(true);
      }
    });
  });

  describe('getGrammarRule', () => {
    it('returns rule by id', () => {
      expect(getGrammarRule('fr_tu_er')).toBe(GRAMMAR_TU_ER);
      expect(getGrammarRule('fr_je_parler')).toBe(GRAMMAR_JE_PARLER);
    });

    it('returns undefined for unknown id', () => {
      expect(getGrammarRule('unknown')).toBeUndefined();
    });
  });

  describe('GRAMMAR_RULES', () => {
    it('includes all exported rules', () => {
      expect(GRAMMAR_RULES).toContain(GRAMMAR_TU_ER);
      expect(GRAMMAR_RULES).toContain(GRAMMAR_TU_AVOIR_ETRE);
      expect(GRAMMAR_RULES).toContain(GRAMMAR_JE_PARLER);
    });
  });
});
