/**
 * Merchant NPC – shopping dialogue and Market Phrases quest progress.
 */

import { RpgEvent, EventData, RpgPlayer } from '@rpgjs/server';
import { getOrCreatePlayerLanguageSave, setPlayerLanguageSave } from '../server/playerLanguageSave';
import { getCompletedTaskIds, markTaskComplete, MARKET_QUEST_ID, getQuest } from '../server/quests';

const XP_PHRASE = 12;

@EventData({
  name: 'npc_merchant',
  hitbox: { width: 32, height: 16 },
})
export default class MerchantEvent extends RpgEvent {
  onInit() {
    this.setGraphic('male');
  }

  async onAction(player: RpgPlayer) {
    const save = getOrCreatePlayerLanguageSave(player);
    const questProgress = { ...(save.questProgress ?? {}) };
    const quest = getQuest(MARKET_QUEST_ID);
    const completedIds = getCompletedTaskIds(questProgress, MARKET_QUEST_ID);

    await player.showText('Bienvenue ! Vous voulez acheter quelque chose ?', { talkWith: this });

    if (quest && !completedIds.includes('m1')) {
      await player.showText('Quest: How do you say "How much?" in French?', { talkWith: this });
      const c = await player.showChoices(
        'Choose:',
        [
          { text: 'Combien', value: 'combien' },
          { text: 'Oui', value: 'oui' },
          { text: 'Merci', value: 'merci' },
        ],
        { talkWith: this }
      );
      if (c?.value === 'combien') {
        const updated = markTaskComplete(questProgress, MARKET_QUEST_ID, 'm1');
        questProgress[MARKET_QUEST_ID] = updated[MARKET_QUEST_ID];
        await player.showText('Correct! (+' + XP_PHRASE + ' XP)', { talkWith: this });
        player.exp = (player.exp ?? 0) + XP_PHRASE;
      } else {
        await player.showText('The answer is: Combien.', { talkWith: this });
      }
    } else if (quest && !completedIds.includes('m2')) {
      await player.showText('Quest: How do you say "I would like..." in French?', {
        talkWith: this,
      });
      const c = await player.showChoices(
        'Choose:',
        [
          { text: 'Je voudrais', value: 'je voudrais' },
          { text: 'Au revoir', value: 'au revoir' },
          { text: 'Combien', value: 'combien' },
        ],
        { talkWith: this }
      );
      if (c?.value === 'je voudrais') {
        const updated = markTaskComplete(questProgress, MARKET_QUEST_ID, 'm2');
        questProgress[MARKET_QUEST_ID] = updated[MARKET_QUEST_ID];
        await player.showText('Correct! (+' + XP_PHRASE + ' XP)', { talkWith: this });
        player.exp = (player.exp ?? 0) + XP_PHRASE;
      } else {
        await player.showText('The answer is: Je voudrais.', { talkWith: this });
      }
    } else if (quest && !completedIds.includes('m3')) {
      await player.showText('Quest: How do you say "Too expensive" in French?', { talkWith: this });
      const c = await player.showChoices(
        'Choose:',
        [
          { text: 'Trop cher', value: 'trop cher' },
          { text: 'Très bien', value: 'très bien' },
          { text: 'Je voudrais', value: 'je voudrais' },
        ],
        { talkWith: this }
      );
      if (c?.value === 'trop cher') {
        const updated = markTaskComplete(questProgress, MARKET_QUEST_ID, 'm3');
        questProgress[MARKET_QUEST_ID] = updated[MARKET_QUEST_ID];
        await player.showText('Correct! (+' + XP_PHRASE + ' XP). Market Phrases complete!', {
          talkWith: this,
        });
        player.exp = (player.exp ?? 0) + XP_PHRASE;
      } else {
        await player.showText('The answer is: Trop cher.', { talkWith: this });
      }
    } else {
      await player.showText('Come back when you have more quests!', { talkWith: this });
    }

    save.questProgress = questProgress;
    setPlayerLanguageSave(player, save);
  }
}
