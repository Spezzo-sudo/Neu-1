import {
  Alliance,
  AlliancePact,
  AllianceRank,
  GalaxyPlanet,
  GalaxySystem,
  PlanetBiome,
  Player,
} from '@/types';
import { createGalaxyCoordinate } from '@/lib/hex';

interface UniverseSeedOptions {
  allianceCount?: number;
  playerCount?: number;
  systemWidth?: number;
  systemHeight?: number;
}

type RandomFn = () => number;

const PALETTE = ['#facc15', '#f97316', '#38bdf8', '#a855f7', '#34d399', '#f472b6', '#22d3ee', '#f87171'];
const ALLIANCE_NAMES = [
  ['AER', 'Ätherische Expeditionäre'],
  ['BRG', 'Brassgear Garde'],
  ['CLK', 'Clockwork Legion'],
  ['DKR', 'Dunkelkern Syndikat'],
  ['EON', 'Eon Navigatoren'],
  ['FUM', 'Fumarium Hanse'],
  ['GLM', 'Glimmerpakt'],
  ['HEL', 'Helion Konklave'],
  ['IGN', 'Ignis Armada'],
  ['LUX', 'Lux Machina'],
  ['MER', 'Merkurisches Kartell'],
  ['NIM', 'Nimbus Orden'],
  ['OBS', 'Observatoriumskreis'],
  ['PYR', 'Pyroclast Kohorte'],
  ['QUA', 'Quarz Allianz'],
  ['RIM', 'Riftmariner'],
  ['STE', 'Steamvigil'],
  ['ZEN', 'Zenith Gesellschaft'],
];

const PLAYER_NAMES = [
  'Captain Selene',
  'Lord Vraxx',
  'Magister Aurum',
  'Navigator Nyx',
  'Duchess Volta',
  'Maréchal Arcturus',
  'Gilde der Navigatoren',
  'Haus Zephyr',
  'Admiral Ferris',
  'Mechanist Lyra',
  'Guildmaster Brumm',
  'Savant Cressida',
  'Chronicler Vox',
  'Oracle Mira',
  'Skipper Thorne',
  'Graf Obsidian',
];

const PLANET_NAMES = [
  'Chronos Prime',
  'Aetherion',
  'Helios',
  'Rhea',
  'Aurora',
  'Nimbus Reach',
  'Ferrum',
  'Cinderfall',
  'Galanthys',
  'Vigilant Star',
  'Elyss',
  'Mirage',
  'Oberon',
  'Arcadia',
  'Voltspire',
  'Sable Crest',
];

/**
 * Deterministic linear congruential generator to keep mock data stable across reloads.
 */
const createRandom = (seed: number): RandomFn => {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) % 0xffffffff;
    return state / 0xffffffff;
  };
};

/**
 * Picks an entry from a list using the provided random function.
 */
const pick = <T>(items: T[], random: RandomFn) => items[Math.floor(random() * items.length) % items.length];

/**
 * Generates mock players with colors and optional alliance membership.
 */
export const generatePlayers = (count: number, random: RandomFn): Player[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `player-${index + 1}`,
    name: pick(PLAYER_NAMES, random),
    color: pick(PALETTE, random),
  }));

/**
 * Creates default alliance ranks.
 */
const createAllianceRanks = (): AllianceRank[] => [
  {
    id: 'leader',
    name: 'Leader',
    permissions: { invite: true, remove: true, editNotes: true, managePacts: true },
  },
  {
    id: 'officer',
    name: 'Offizier',
    permissions: { invite: true, remove: true, editNotes: true, managePacts: false },
  },
  {
    id: 'member',
    name: 'Member',
    permissions: { invite: false, remove: false, editNotes: true, managePacts: false },
  },
];

/**
 * Generates alliances with random members and base metadata.
 */
export const generateAlliances = (players: Player[], count: number, random: RandomFn): Alliance[] => {
  const alliances: Alliance[] = [];
  const availablePlayers = [...players];

  for (let index = 0; index < count; index += 1) {
    const [tag, name] = ALLIANCE_NAMES[index % ALLIANCE_NAMES.length];
    const memberCount = 8 + Math.floor(random() * 12);
    const members: string[] = [];
    for (let memberIndex = 0; memberIndex < memberCount; memberIndex += 1) {
      if (availablePlayers.length === 0) {
        break;
      }
      const selectionIndex = Math.floor(random() * availablePlayers.length);
      const [player] = availablePlayers.splice(selectionIndex, 1);
      if (!player) {
        break;
      }
      members.push(player.id);
      player.allianceId = `alliance-${index + 1}`;
    }

    const pactTargets = alliances.length > 0 ? [pick(alliances, random).id] : [];
    const pacts: AlliancePact[] = pactTargets.map((target, pactIndex) => ({
      id: `pact-${index + 1}-${pactIndex + 1}`,
      type: pactIndex % 2 === 0 ? 'ally' : 'nap',
      targetAllianceId: target,
    }));

    alliances.push({
      id: `alliance-${index + 1}`,
      tag,
      name,
      color: pick(PALETTE, random),
      members,
      ranks: createAllianceRanks(),
      pacts,
      notes: ['* Einsatzgebiet: Kernsektor', '* Koordination: tägliche Besprechung 20:00 Uhr'],
    });
  }

  return alliances;
};

/**
 * Generates planets for a given system using players and alliances for ownership.
 */
const generatePlanets = (
  systemId: string,
  slotCount: number,
  random: RandomFn,
  players: Player[],
): GalaxyPlanet[] =>
  Array.from({ length: slotCount }, (_, slotIndex) => {
    const owner = random() > 0.55 ? pick(players, random) : undefined;
    return {
      id: `${systemId}-planet-${slotIndex + 1}`,
      systemId,
      slot: slotIndex + 1,
      name: pick(PLANET_NAMES, random),
      biome: pick(Object.values(PlanetBiome), random),
      ownerId: owner?.id,
      allianceId: owner?.allianceId,
    };
  });

/**
 * Generates a grid of systems sized for 100–500 Spieler Mock-Daten.
 */
export const generateSystems = (
  width: number,
  height: number,
  random: RandomFn,
  players: Player[],
): GalaxySystem[] => {
  const systems: GalaxySystem[] = [];
  for (let sectorQ = 0; sectorQ < width; sectorQ += 1) {
    for (let sectorR = 0; sectorR < height; sectorR += 1) {
      const sysIndex = Math.floor(random() * 5);
      const coordinate = createGalaxyCoordinate(sectorQ, sectorR, sysIndex);
      const id = `system-${sectorQ}-${sectorR}-${sysIndex}`;
      systems.push({
        id,
        displayName: `Sektor ${sectorQ}:${sectorR} · ${sysIndex.toString().padStart(2, '0')}`,
        sectorQ,
        sectorR,
        sysIndex,
        axial: coordinate.axial,
        planets: generatePlanets(id, 7, random, players),
      });
    }
  }
  return systems;
};

/**
 * Generates a full universe mock tailored for the Galaxy v3 view.
 */
export const generateUniverse = (seed = 2023, options: UniverseSeedOptions = {}) => {
  const random = createRandom(seed);
  const playerCount = options.playerCount ?? 240;
  const allianceCount = options.allianceCount ?? 18;
  const width = options.systemWidth ?? 55;
  const height = options.systemHeight ?? 55;

  const players = generatePlayers(playerCount, random);
  const alliances = generateAlliances(players, allianceCount, random);
  const systems = generateSystems(width, height, random, players);

  return { systems, players, alliances };
};

const DEFAULT_UNIVERSE = generateUniverse();

/**
 * Exported mock data slices reused by multiple stores and components.
 */
export const SYSTEM_SNAPSHOT = DEFAULT_UNIVERSE.systems;

/**
 * Player directory mock used for the directory store bootstrap.
 */
export const PLAYER_DIRECTORY = DEFAULT_UNIVERSE.players;

/**
 * Alliance directory mock used for the alliance store bootstrap.
 */
export const ALLIANCE_DIRECTORY = DEFAULT_UNIVERSE.alliances;

/**
 * ID of the locally controlled commander for filtering helpers.
 */
export const CURRENT_PLAYER_ID = PLAYER_DIRECTORY[0]?.id ?? 'player-1';
