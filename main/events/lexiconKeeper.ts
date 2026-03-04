/**
 * Lexicon Keeper NPC – opens the Lexicon (vocabulary inventory) GUI.
 */

import { RpgEvent, EventData, RpgPlayer } from '@rpgjs/server';
import { getLexiconData } from '../server/playerLanguageSave';

@EventData({
  name: 'npc_lexicon_keeper',
  hitbox: { width: 32, height: 16 },
})
export default class LexiconKeeperEvent extends RpgEvent {
  onInit() {
    this.setGraphic('male');
  }

  async onAction(player: RpgPlayer) {
    const { vocabulary, dueCount } = getLexiconData(player);
    await player.showText('Here is your Lexicon. Review your words regularly!', { talkWith: this });
    await player.gui('rpg-lexicon').open(
      {
        vocabulary: vocabulary.map(v => ({
          ...v,
          addedAt: v.addedAt instanceof Date ? v.addedAt.toISOString() : v.addedAt,
          lastReviewedAt:
            v.lastReviewedAt instanceof Date ? v.lastReviewedAt.toISOString() : v.lastReviewedAt,
        })),
        dueCount,
      },
      { blockPlayerInput: true, waitingAction: true }
    );
  }
}
