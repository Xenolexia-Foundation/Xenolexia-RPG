/**
 * Game regions (maps) as learning levels.
 * Maps in the world file are treated as regions; each region can have a suggested focus.
 */

export interface Region {
  id: string;
  name: string;
  /** Map file name without extension (e.g. simplemap). */
  mapId: string;
  /** Short description for UI / intro. */
  description: string;
  /** Optional: quest id that unlocks this region (e.g. must complete First Words). */
  requiredQuestId?: string;
}

export const REGIONS: Region[] = [
  {
    id: 'starter_village',
    name: 'Starter Village',
    mapId: 'simplemap',
    description: 'Basic greetings, numbers, simple verbs.',
  },
  {
    id: 'forest_of_verbs',
    name: 'Forest of Verbs',
    mapId: 'simplemap2',
    description: 'Conjugations, tenses.',
    requiredQuestId: 'quest_starter_vocabulary',
  },
];

export function getRegionByMapId(mapId: string): Region | undefined {
  return REGIONS.find(r => r.mapId === mapId);
}

export function getRegionById(id: string): Region | undefined {
  return REGIONS.find(r => r.id === id);
}
