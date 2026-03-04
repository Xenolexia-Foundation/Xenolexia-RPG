# Xenolexia RPG

A **language-learning RPG** built with [RPGJS](https://rpgjs.dev) and TypeScript. Progress in the game depends on using the target language: dialogue choices, vocabulary tasks, and quests are all learning moments.

This project reuses [xenolexia-typescript](https://github.com/Xenolexia-Foundation/xenolexia-typescript) for vocabulary types, SRS (spaced repetition), and gamification (XP/levels).

## Architecture

- **Client (browser):** Maps, sprites, dialogue UI, default RPGJS GUIs.
- **Server (Node.js):** Player save data, quest progression, language engine (validation, SRS).
- **Shared:** TypeScript types for vocabulary, quests, dialogue trees, and language tasks.

## What’s Reused from xenolexia-typescript

- **Types:** `Language`, `VocabularyItem`, `VocabularyStatus`, `LanguagePair`, etc.
- **VocabularyRepository:** SRS (getDueForReview, recordReview) via an in-memory `IDataStore` adapter.
- **Gamification:** `getLevelFromXp`, XP constants (`XP_PER_WORD_SAVED`), so in-game XP can align with levels.

## Game Structure

- **Starter Village** (map: simplemap): Basic greetings and first words (French).
- **Forest of Verbs** (map: simplemap2): Conjugations, tenses (unlocks after First Words).
- **NPCs:**
  - **Teacher** – Dialogue in French with multiple-choice answers; rewards XP; integrates with the “First Words” and “Verb Conjugation” quests; includes a grammar challenge (conjugate “parler” for “tu”).
  - **Quest Giver** – Offers multiple quests (First Words, Market Phrases, Verb Conjugation, Academy of Grammar) and gives rewards on completion.
  - **Merchant** – Shopping phrases and “Market Phrases” quest (How much?, I would like..., Too expensive).
  - **Lexicon Keeper** – Opens the **Lexicon** (vocabulary inventory) GUI: list of words, due-for-review count, next-review date.
  - **Language Slime** – “Battle” by answering vocabulary or **grammar** questions (e.g. conjugate “parler” for “tu”); correct = damage enemy, wrong = take damage.

## Running the Game

1. **Build xenolexia-typescript (required once):**
   ```bash
   cd ../xenolexia-typescript/ts-shared-core && npm run build
   ```

2. **Install and run Xenolexia RPG:**
   ```bash
   cd Xenolexia-RPG
   npm install
   npm run dev
   ```

3. Open the URL shown (e.g. http://localhost:3000). Use the Teacher and Quest Giver on the map to practise French; find the language slime to “battle” with vocabulary.

## Save System

- **RPGJS** handles position, gold, EXP, and variables.
- **Language state** is stored in the player variable `xenolexia_language_save` (JSON):
  - Vocabulary (SRS state)
  - Quest progress (completed task ids per quest)
  - Language XP

## Adding Maps and Content

- **Maps:** Edit or add `.tmx` files in `main/worlds/maps/` (e.g. with [Tiled](https://www.mapeditor.org/)). Regions are defined in `main/server/regions.ts` (Starter Village = simplemap, Forest of Verbs = simplemap2).
- **Events:** Place NPCs in Tiled and set their event name to:
  - `npc_teacher` – Teacher (dialogue + grammar + First Words / Verb Conjugation)
  - `npc_quest_giver` – Quest Giver (multiple quests)
  - `npc_merchant` – Merchant (Market Phrases quest)
  - `npc_lexicon_keeper` – Opens Lexicon GUI
  - `enemy_language_slime` – Language battle (vocab + grammar)
- **Quests:** Edit `main/server/quests.ts` (First Words, Market Phrases, Verb Conjugation, Academy of Grammar).
- **Grammar:** Edit `main/server/grammarRules.ts` to add or change grammar rules used in dialogue and battles.

## Optional Next Steps (from PLAN.md)

- **Vocabulary inventory:** Lexicon GUI is implemented; open via the Lexicon Keeper NPC. Optional: add in-menu “Lexicon” entry or key binding (e.g. L).
- **Full battle system:** Override RPGJS battle flow so each “attack” is a language question (translate, conjugate, fill-in-blank).
- **Audio + speech recognition:** Web Speech API on the client for “listen and repeat” and spoken answers.
- **More regions:** Add maps for Marketplace City, Academy of Grammar, Kingdom of Fluency and link them in `regions.ts` with new quests.

## License

Same as the Xenolexia project (AGPL-3.0). See LICENSE in the repo root.
# Xenolexia-RPG
