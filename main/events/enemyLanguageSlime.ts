/**
 * Language enemy – "battle" by answering vocabulary questions.
 * Correct answer = damage to enemy; wrong answer = enemy attacks (player loses HP).
 */

import { RpgEvent, EventData, RpgPlayer } from '@rpgjs/server';
import { LanguageEngine, validateAnswer } from '../server/languageEngine';
import {
  getPlayerEngineState,
  setPlayerEngineState,
  getOrCreatePlayerLanguageSave,
} from '../server/playerLanguageSave';
import { getRandomGrammarTask } from '../server/grammarRules';

const ENEMY_HP_KEY = 'lang_enemy_slime_hp';
const ENEMY_DAMAGE = 10;
const PLAYER_DAMAGE = 5;
const XP_REWARD = 15;
const GOLD_REWARD = 5;
const GRAMMAR_CHANCE = 0.3;

const STARTER_QUESTIONS = [
  { prompt: 'Hello', correct: ['bonjour', 'salut'] },
  { prompt: 'Thank you', correct: ['merci'] },
  { prompt: 'Goodbye', correct: ['au revoir', 'adieu'] },
];

@EventData({
  name: 'enemy_language_slime',
  hitbox: { width: 24, height: 24 },
})
export default class LanguageEnemyEvent extends RpgEvent {
  onInit() {
    this.setGraphic('npc_1');
  }

  async onAction(player: RpgPlayer) {
    let hp = player.getVariable(ENEMY_HP_KEY);
    if (hp == null || typeof hp !== 'number') hp = 30;
    if (hp <= 0) {
      await player.showText('You already defeated this slime.', { talkWith: this });
      return;
    }

    const engine = new LanguageEngine();
    engine.loadState(getPlayerEngineState(player));
    const save = getOrCreatePlayerLanguageSave(player);

    let prompt: string;
    let correctAnswers: string[];
    let validate: (input: string) => boolean = x => validateAnswer(x, []);

    const useGrammar = Math.random() < GRAMMAR_CHANCE;
    if (useGrammar) {
      const grammar = getRandomGrammarTask();
      prompt = grammar.prompt;
      correctAnswers = grammar.correctAnswers;
      validate = grammar.validate;
    } else {
      const task = await engine.getRandomTaskFromDue(5);
      if (task) {
        prompt = task.prompt;
        correctAnswers = task.correctAnswers;
        validate = task.validate || (x => validateAnswer(x, correctAnswers));
      } else {
        const q = STARTER_QUESTIONS[Math.floor(Math.random() * STARTER_QUESTIONS.length)];
        prompt = q.prompt;
        correctAnswers = q.correct;
        validate = x => validateAnswer(x, correctAnswers);
      }
    }

    await player.showText('Slime: ' + prompt, { talkWith: this });
    const choices = [
      { text: correctAnswers[0], value: correctAnswers[0] },
      { text: 'oui', value: 'oui' },
      { text: 'non', value: 'non' },
    ];
    const choice = await player.showChoices('Choose:', choices, { talkWith: this });
    const correct = choice && validate(choice.value);

    if (correct) {
      hp -= ENEMY_DAMAGE;
      player.setVariable(ENEMY_HP_KEY, hp);
      await player.showText('Correct! Slime takes ' + ENEMY_DAMAGE + ' damage.', {
        talkWith: this,
      });
      player.exp = (player.exp ?? 0) + 5;
      if (hp <= 0) {
        await player.showText('Slime defeated! +' + XP_REWARD + ' XP, +' + GOLD_REWARD + ' gold.', {
          talkWith: this,
        });
        player.exp = (player.exp ?? 0) + XP_REWARD - 5;
        player.gold = (player.gold ?? 0) + GOLD_REWARD;
        player.setVariable(ENEMY_HP_KEY, -1);
      }
    } else {
      await player.showText('Wrong! Slime attacks. (-' + PLAYER_DAMAGE + ' HP)', {
        talkWith: this,
      });
      const p = player as { hp?: number };
      p.hp = Math.max(0, (p.hp ?? 100) - PLAYER_DAMAGE);
    }

    setPlayerEngineState(
      player,
      engine.getState(save.sourceLanguage, save.targetLanguage, player.exp ?? 0),
      save.questProgress
    );
  }
}
