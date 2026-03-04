/**
 * Unit tests for quest helpers.
 */

import {
  getQuest,
  getCompletedTaskIds,
  isQuestComplete,
  markTaskComplete,
  QUESTS,
  STARTER_QUEST_ID,
  MARKET_QUEST_ID,
} from '../quests';

describe('quests', () => {
  describe('getQuest', () => {
    it('returns quest by id', () => {
      const q = getQuest(STARTER_QUEST_ID);
      expect(q?.id).toBe(STARTER_QUEST_ID);
      expect(q?.title).toBe('First Words');
      expect(q?.tasks.length).toBe(3);
    });

    it('returns undefined for unknown id', () => {
      expect(getQuest('unknown')).toBeUndefined();
    });
  });

  describe('getCompletedTaskIds', () => {
    it('returns empty when no progress', () => {
      expect(getCompletedTaskIds(undefined, STARTER_QUEST_ID)).toEqual([]);
      expect(getCompletedTaskIds({}, STARTER_QUEST_ID)).toEqual([]);
    });

    it('returns completed ids from progress', () => {
      expect(getCompletedTaskIds({ [STARTER_QUEST_ID]: ['t1', 't2'] }, STARTER_QUEST_ID)).toEqual([
        't1',
        't2',
      ]);
    });
  });

  describe('isQuestComplete', () => {
    it('returns false when not all tasks done', () => {
      const q = getQuest(STARTER_QUEST_ID);
      expect(q).toBeDefined();
      if (q) {
        expect(isQuestComplete(q, [])).toBe(false);
        expect(isQuestComplete(q, ['t1'])).toBe(false);
      }
    });

    it('returns true when all task ids present', () => {
      const q = getQuest(STARTER_QUEST_ID);
      expect(q).toBeDefined();
      if (q) expect(isQuestComplete(q, ['t1', 't2', 't3'])).toBe(true);
    });
  });

  describe('markTaskComplete', () => {
    it('adds task id to progress', () => {
      const progress: Record<string, string[]> = {};
      const next = markTaskComplete(progress, STARTER_QUEST_ID, 't1');
      expect(next[STARTER_QUEST_ID]).toEqual(['t1']);
    });

    it('does not duplicate task id', () => {
      const progress = { [STARTER_QUEST_ID]: ['t1'] };
      const next = markTaskComplete(progress, STARTER_QUEST_ID, 't1');
      expect(next[STARTER_QUEST_ID]).toEqual(['t1']);
    });

    it('appends second task', () => {
      const progress = { [STARTER_QUEST_ID]: ['t1'] };
      const next = markTaskComplete(progress, STARTER_QUEST_ID, 't2');
      expect(next[STARTER_QUEST_ID]).toEqual(['t1', 't2']);
    });
  });

  describe('QUESTS', () => {
    it('has at least 4 quests', () => {
      expect(QUESTS.length).toBeGreaterThanOrEqual(4);
    });

    it('Market Phrases has requiredQuestId', () => {
      const q = getQuest(MARKET_QUEST_ID);
      expect(q?.requiredQuestId).toBe(STARTER_QUEST_ID);
    });
  });
});
