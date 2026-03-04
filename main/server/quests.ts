/**
 * Quest definitions and helpers for Xenolexia RPG.
 */

import type { Quest } from '../shared/types';

export const STARTER_QUEST_ID = 'quest_starter_vocabulary';
export const MARKET_QUEST_ID = 'quest_market_phrases';
export const VERB_QUEST_ID = 'quest_verb_conjugation';
export const ACADEMY_QUEST_ID = 'quest_academy_grammar';

/** Quests available in the game, by region. */
export const QUESTS: Quest[] = [
  {
    id: STARTER_QUEST_ID,
    title: 'First Words',
    description: 'Help the teacher by translating three basic words (Hello, Thank you, Goodbye).',
    tasks: [
      {
        id: 't1',
        type: 'answer_question',
        targetId: 'teacher',
        prompt: 'Hello',
        acceptedAnswers: ['bonjour', 'salut'],
      },
      {
        id: 't2',
        type: 'answer_question',
        targetId: 'teacher',
        prompt: 'Thank you',
        acceptedAnswers: ['merci'],
      },
      {
        id: 't3',
        type: 'answer_question',
        targetId: 'teacher',
        prompt: 'Goodbye',
        acceptedAnswers: ['au revoir', 'adieu'],
      },
    ],
    rewards: { xp: 30, gold: 10 },
  },
  {
    id: MARKET_QUEST_ID,
    title: 'Market Phrases',
    description: 'Learn shopping vocabulary: buy, sell, how much, and numbers.',
    requiredQuestId: STARTER_QUEST_ID,
    tasks: [
      {
        id: 'm1',
        type: 'answer_question',
        targetId: 'merchant',
        prompt: 'How much?',
        acceptedAnswers: ['combien', "c'est combien", 'ça coûte combien'],
      },
      {
        id: 'm2',
        type: 'answer_question',
        targetId: 'merchant',
        prompt: 'I would like...',
        acceptedAnswers: ['je voudrais', 'je voudrais acheter'],
      },
      {
        id: 'm3',
        type: 'answer_question',
        targetId: 'merchant',
        prompt: 'Too expensive',
        acceptedAnswers: ['trop cher', "c'est trop cher"],
      },
    ],
    rewards: { xp: 40, gold: 15 },
  },
  {
    id: VERB_QUEST_ID,
    title: 'Verb Conjugation',
    description: 'Conjugate -er verbs and avoir/être for "tu" in the present tense.',
    requiredQuestId: STARTER_QUEST_ID,
    tasks: [
      {
        id: 'v1',
        type: 'conjugate',
        targetId: 'teacher',
        prompt: 'parler (tu)',
        acceptedAnswers: ['parles'],
      },
      {
        id: 'v2',
        type: 'conjugate',
        targetId: 'teacher',
        prompt: 'avoir (tu)',
        acceptedAnswers: ['as'],
      },
      {
        id: 'v3',
        type: 'conjugate',
        targetId: 'teacher',
        prompt: 'être (tu)',
        acceptedAnswers: ['es'],
      },
    ],
    rewards: { xp: 50, gold: 20 },
  },
  {
    id: ACADEMY_QUEST_ID,
    title: 'Academy of Grammar',
    description: 'Complete the sentence: "Je ___ français" and conjugate "manger" for "tu".',
    requiredQuestId: VERB_QUEST_ID,
    tasks: [
      {
        id: 'a1',
        type: 'answer_question',
        targetId: 'teacher',
        prompt: 'Je ___ français (I speak)',
        acceptedAnswers: ['parle'],
      },
      {
        id: 'a2',
        type: 'conjugate',
        targetId: 'teacher',
        prompt: 'manger (tu)',
        acceptedAnswers: ['manges'],
      },
    ],
    rewards: { xp: 60, gold: 25 },
  },
];

export function getQuest(questId: string): Quest | undefined {
  return QUESTS.find(q => q.id === questId);
}

export function getCompletedTaskIds(
  questProgress: Record<string, string[]> | undefined,
  questId: string
): string[] {
  return questProgress?.[questId] ?? [];
}

export function isTaskCompleted(
  questProgress: Record<string, string[]> | undefined,
  questId: string,
  taskId: string
): boolean {
  return getCompletedTaskIds(questProgress, questId).includes(taskId);
}

export function isQuestComplete(quest: Quest, completedTaskIds: string[]): boolean {
  return quest.tasks.every(t => completedTaskIds.includes(t.id));
}

/** Mark a task complete; returns new completed list for the quest. */
export function markTaskComplete(
  questProgress: Record<string, string[]>,
  questId: string,
  taskId: string
): Record<string, string[]> {
  const list = questProgress[questId] ?? [];
  if (list.includes(taskId)) return questProgress;
  return { ...questProgress, [questId]: [...list, taskId] };
}
