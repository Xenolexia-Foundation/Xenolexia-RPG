/**
 * Teacher NPC – dialogue in target language (French) with multiple-choice response.
 * Rewards XP for correct answers; integrates with First Words quest.
 */

import { RpgEvent, EventData, RpgPlayer } from '@rpgjs/server';
import { LanguageEngine } from '../server/languageEngine';
import {
  getPlayerEngineState,
  setPlayerEngineState,
  getOrCreatePlayerLanguageSave,
} from '../server/playerLanguageSave';
import {
  getCompletedTaskIds,
  markTaskComplete,
  STARTER_QUEST_ID,
  VERB_QUEST_ID,
  getQuest,
} from '../server/quests';

const XP_CORRECT = 10;
const XP_GRAMMAR = 15;

@EventData({
  name: 'npc_teacher',
  hitbox: { width: 32, height: 16 },
})
export default class TeacherEvent extends RpgEvent {
  onInit() {
    this.setGraphic('female');
  }

  async onAction(player: RpgPlayer) {
    const engine = new LanguageEngine();
    const state = getPlayerEngineState(player);
    engine.loadState(state);

    const save = getOrCreatePlayerLanguageSave(player);
    const questProgress = { ...(save.questProgress ?? {}) };

    await player.showText('Bonjour ! Comment ça va ?', { talkWith: this });

    const choice = await player.showChoices(
      'Choisis la bonne réponse :',
      [
        { text: 'Bien, merci.', value: 'bien' },
        { text: 'Mal.', value: 'mal' },
        { text: 'Je ne sais pas.', value: 'sais_pas' },
      ],
      { talkWith: this }
    );

    const correct = choice?.value === 'bien';
    if (correct) {
      await player.showText('Très bien ! (+' + XP_CORRECT + ' XP)', { talkWith: this });
      const newLanguageXp = (save.languageXp ?? 0) + XP_CORRECT;
      const newState = engine.getState(save.sourceLanguage, save.targetLanguage, newLanguageXp);
      setPlayerEngineState(player, newState, questProgress);
      player.exp = (player.exp ?? 0) + XP_CORRECT;
    } else {
      await player.showText('Essayons encore ! La bonne réponse : « Bien, merci. »', {
        talkWith: this,
      });
      setPlayerEngineState(
        player,
        engine.getState(save.sourceLanguage, save.targetLanguage, save.languageXp ?? 0),
        questProgress
      );
    }

    const completedIds = getCompletedTaskIds(questProgress, STARTER_QUEST_ID);
    if (!completedIds.includes('t1')) {
      await player.showText(
        'Pour la quête « First Words » : comment dit-on « Hello » en français ?',
        { talkWith: this }
      );
      const translateChoice = await player.showChoices(
        'Choisis :',
        [
          { text: 'Bonjour', value: 'bonjour' },
          { text: 'Au revoir', value: 'au_revoir' },
          { text: 'Merci', value: 'merci' },
        ],
        { talkWith: this }
      );
      if (translateChoice?.value === 'bonjour') {
        const updated = markTaskComplete(questProgress, STARTER_QUEST_ID, 't1');
        questProgress[STARTER_QUEST_ID] = updated[STARTER_QUEST_ID];
        await player.showText('Correct ! (1/3)', { talkWith: this });
        player.exp = (player.exp ?? 0) + 10;
      } else {
        await player.showText('Réponse correcte : Bonjour.', { talkWith: this });
      }
      setPlayerEngineState(
        player,
        engine.getState(save.sourceLanguage, save.targetLanguage, player.exp ?? 0),
        questProgress
      );
    }

    // Grammar challenge: conjugate "parler" for "tu" (counts as Verb Conjugation v1 or Academy a2 if "manges")
    await player.showText('Grammaire : conjugue "parler" au présent pour "tu".', {
      talkWith: this,
    });
    const grammarChoice = await player.showChoices(
      'Choisis la bonne forme :',
      [
        { text: 'parles', value: 'parles' },
        { text: 'parle', value: 'parle' },
        { text: 'parlons', value: 'parlons' },
      ],
      { talkWith: this }
    );
    if (grammarChoice?.value === 'parles') {
      await player.showText('Parfait ! (+' + XP_GRAMMAR + ' XP)', { talkWith: this });
      player.exp = (player.exp ?? 0) + XP_GRAMMAR;
      const vQuest = getQuest(VERB_QUEST_ID);
      if (vQuest && !getCompletedTaskIds(questProgress, VERB_QUEST_ID).includes('v1')) {
        const up = markTaskComplete(questProgress, VERB_QUEST_ID, 'v1');
        questProgress[VERB_QUEST_ID] = up[VERB_QUEST_ID];
      }
    } else {
      await player.showText('La bonne réponse : « parles » (tu parles).', { talkWith: this });
    }
    setPlayerEngineState(
      player,
      engine.getState(save.sourceLanguage, save.targetLanguage, player.exp ?? 0),
      questProgress
    );
  }
}
