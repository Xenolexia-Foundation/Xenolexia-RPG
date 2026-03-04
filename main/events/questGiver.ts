/**
 * Quest Giver NPC – offers quests and checks progress.
 * Lists: First Words, Market Phrases, Verb Conjugation, Academy of Grammar.
 */

import { RpgEvent, EventData, RpgPlayer } from '@rpgjs/server';
import { getQuest, getCompletedTaskIds, isQuestComplete, QUESTS } from '../server/quests';
import { getOrCreatePlayerLanguageSave } from '../server/playerLanguageSave';

@EventData({
  name: 'npc_quest_giver',
  hitbox: { width: 32, height: 16 },
})
export default class QuestGiverEvent extends RpgEvent {
  onInit() {
    this.setGraphic('male');
  }

  async onAction(player: RpgPlayer) {
    const save = getOrCreatePlayerLanguageSave(player);
    const questProgress = save.questProgress ?? {};

    const choice = await player.showChoices(
      'Which quest do you want to talk about?',
      QUESTS.map(q => ({
        text:
          q.title + (getCompletedTaskIds(questProgress, q.id).length > 0 ? ' (in progress)' : ''),
        value: q.id,
      })),
      { talkWith: this }
    );

    const questId = choice?.value;
    if (!questId) return;

    const quest = getQuest(questId);
    if (!quest) return;

    const completedIds = getCompletedTaskIds(questProgress, quest.id);
    const done = isQuestComplete(quest, completedIds);

    if (completedIds.length === 0) {
      await player.showText(quest.title + ' – ' + quest.description, { talkWith: this });
      if (quest.requiredQuestId) {
        const requiredQuest = getQuest(quest.requiredQuestId);
        const requiredDone =
          requiredQuest &&
          (questProgress[quest.requiredQuestId]?.length ?? 0) > 0 &&
          isQuestComplete(requiredQuest, questProgress[quest.requiredQuestId] || []);
        if (!requiredDone) {
          await player.showText('Complete the previous quest first.', { talkWith: this });
          return;
        }
      }
      await player.showText(
        'Complete the tasks to earn ' +
          quest.rewards.xp +
          ' XP and ' +
          (quest.rewards.gold || 0) +
          ' gold.',
        { talkWith: this }
      );
      return;
    }

    if (done) {
      const claimKey = 'quest_claimed_' + quest.id;
      if (!player.getVariable(claimKey)) {
        await player.showText('You completed « ' + quest.title + ' »! Here are your rewards.', {
          talkWith: this,
        });
        player.exp = (player.exp ?? 0) + quest.rewards.xp;
        if (quest.rewards.gold) player.gold = (player.gold ?? 0) + quest.rewards.gold;
        await player.showText(
          '+' + quest.rewards.xp + ' XP, +' + (quest.rewards.gold ?? 0) + ' gold.',
          { talkWith: this }
        );
        player.setVariable(claimKey, true);
      } else {
        await player.showText('You already claimed the rewards for « ' + quest.title + ' ».', {
          talkWith: this,
        });
      }
      return;
    }

    await player.showText(
      quest.title +
        ': ' +
        completedIds.length +
        '/' +
        quest.tasks.length +
        ' tasks done. Keep practising!',
      { talkWith: this }
    );
  }
}
