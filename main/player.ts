import { RpgPlayer, type RpgPlayerHooks, Control, Components } from '@rpgjs/server';

const player: RpgPlayerHooks = {
  onConnected(player: RpgPlayer) {
    player.name = 'Adventurer';
    player.setComponentsTop(Components.text('{name}'));
  },
  onInput(player: RpgPlayer, { input }) {
    if (input == Control.Back) {
      player.callMainMenu();
    }
  },
  async onJoinMap(player: RpgPlayer) {
    if (player.getVariable('AFTER_INTRO')) {
      return;
    }
    await player.showText('Welcome to Xenolexia RPG!');
    await player.showText(
      'Learn a language by talking to NPCs, completing quests, and answering correctly. Progress depends on using the target language.'
    );
    await player.showText(
      'Find the Teacher to practise French, and the Quest Giver to start « First Words ».'
    );
    player.setVariable('AFTER_INTRO', true);
  },
};

export default player;
