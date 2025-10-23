import { create } from 'zustand';
import {
  GalaxyPlanet,
  GalaxySystem,
  Player,
  PlayerProfile,
  PlayerPlanetSummary,
} from '@/types';
import { ALLIANCE_DIRECTORY, CURRENT_PLAYER_ID, PLAYER_DIRECTORY, SYSTEM_SNAPSHOT } from '@/lib/mockFactory';
import { formatSystemCoordinate } from '@/lib/hex';
import { fetchDirectorySnapshot, fetchPlayerProfile } from '@/lib/api/directory';

interface DirectoryState {
  systems: GalaxySystem[];
  players: Player[];
  favorites: string[];
  openProfileId: string | null;
  profiles: Record<string, PlayerProfile>;
  currentPlayerId: string;
  allianceColors: Record<string, string>;
  isLoading: boolean;
  isReady: boolean;
  error?: string;
}

interface DirectoryActions {
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  openPlayerProfile: (playerId: string) => void;
  closePlayerProfile: () => void;
  favoritePlanet: (planetId: string) => void;
  getPlanetById: (planetId: string) => GalaxyPlanet | undefined;
  getSystemById: (systemId: string) => GalaxySystem | undefined;
  getAllianceColor: (allianceId?: string) => string | undefined;
  setPlanetOwner: (planetId: string, ownerId: string, allianceId?: string) => void;
}

interface DirectorySnapshot {
  systems: GalaxySystem[];
  players: Player[];
  currentPlayerId: string;
  allianceColors: Record<string, string>;
}

const buildAllianceColorMap = (alliances: { id: string; color: string }[]): Record<string, string> =>
  alliances.reduce<Record<string, string>>((acc, alliance) => {
    acc[alliance.id] = alliance.color;
    return acc;
  }, {});

const deriveProfile = (
  playerId: string,
  systems: GalaxySystem[],
  favorites: string[],
  players: Player[],
): PlayerProfile => {
  const player = players.find((entry) => entry.id === playerId);
  const playerIndex = Math.max(0, players.findIndex((entry) => entry.id === playerId));
  const planets: PlayerPlanetSummary[] = [];
  systems.forEach((system) => {
    system.planets.forEach((planet) => {
      if (planet.ownerId === playerId) {
        planets.push({
          planetId: planet.id,
          systemId: system.id,
          slot: planet.slot,
          biome: planet.biome,
          coordinates: `${formatSystemCoordinate(system)}:${planet.slot}`,
          isFavorite: favorites.includes(planet.id),
        });
      }
    });
  });
  return {
    id: playerId,
    tagline: `${player?.name ?? 'Kommandant'} · Arkana Flotte`,
    lastActiveAt: Date.now() - playerIndex * 60 * 60 * 1000,
    allianceId: player?.allianceId,
    planets,
  };
};

const createFallbackSnapshot = (): DirectorySnapshot => ({
  systems: SYSTEM_SNAPSHOT,
  players: PLAYER_DIRECTORY,
  currentPlayerId: CURRENT_PLAYER_ID,
  allianceColors: buildAllianceColorMap(ALLIANCE_DIRECTORY.map((entry) => ({ id: entry.id, color: entry.color }))),
});

const applySnapshot = (set: (partial: Partial<DirectoryState>) => void, snapshot: DirectorySnapshot) => {
  set({
    systems: snapshot.systems,
    players: snapshot.players,
    currentPlayerId: snapshot.currentPlayerId,
    allianceColors: snapshot.allianceColors,
    isLoading: false,
    isReady: true,
  });
};

const mapResponseToSnapshot = (response: DirectorySnapshot): DirectorySnapshot => ({
  systems: response.systems,
  players: response.players,
  currentPlayerId: response.currentPlayerId,
  allianceColors: response.allianceColors,
});

/**
 * Zustand store for directory, profile and favorites state management.
 */
export const useDirectoryStore = create<DirectoryState & DirectoryActions>((set, get) => ({
  systems: [],
  players: [],
  favorites: [],
  openProfileId: null,
  profiles: {},
  currentPlayerId: '',
  allianceColors: {},
  isLoading: false,
  isReady: false,
  error: undefined,

  initialize: async () => {
    if (get().isReady || get().isLoading) {
      return;
    }
    await get().refresh();
  },

  refresh: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const response = await fetchDirectorySnapshot();
      applySnapshot(set, mapResponseToSnapshot({
        systems: response.systems,
        players: response.players,
        currentPlayerId: response.currentPlayerId,
        allianceColors: buildAllianceColorMap(response.alliances),
      }));
    } catch (error) {
      console.error('Directory snapshot fallback active:', error);
      const fallback = createFallbackSnapshot();
      applySnapshot(set, fallback);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler beim Laden des Verzeichnisses.' });
    }
  },

  openPlayerProfile: (playerId) => {
    set({ openProfileId: playerId });
    const { profiles } = get();
    if (profiles[playerId]) {
      return;
    }
    (async () => {
      try {
        const profile = await fetchPlayerProfile(playerId);
        set((state) => {
          const favoriteSet = new Set(state.favorites);
          return {
            profiles: {
              ...state.profiles,
              [playerId]: {
                ...profile,
                planets: profile.planets.map((planet) => ({
                  ...planet,
                  isFavorite: favoriteSet.has(planet.planetId),
                })),
              },
            },
          };
        });
      } catch (error) {
        console.warn('Falling back to derived profile for', playerId, error);
        set((state) => ({
          profiles: {
            ...state.profiles,
            [playerId]: deriveProfile(playerId, state.systems, state.favorites, state.players),
          },
        }));
      }
    })();
  },

  closePlayerProfile: () => set({ openProfileId: null }),

  favoritePlanet: (planetId) => {
    set((state) => {
      const isFavorite = state.favorites.includes(planetId);
      const favorites = isFavorite
        ? state.favorites.filter((id) => id !== planetId)
        : [...state.favorites, planetId];
      const profiles = Object.fromEntries(
        Object.entries(state.profiles).map(([playerId, profile]) => {
          const planets = profile.planets.map((planet) =>
            planet.planetId === planetId ? { ...planet, isFavorite: !isFavorite } : planet,
          );
          return [playerId, { ...profile, planets }];
        }),
      );
      return { favorites, profiles };
    });
  },

  getPlanetById: (planetId) => {
    const { systems } = get();
    for (const system of systems) {
      const planet = system.planets.find((entry) => entry.id === planetId);
      if (planet) {
        return planet;
      }
    }
    return undefined;
  },

  getSystemById: (systemId) => get().systems.find((system) => system.id === systemId),

  getAllianceColor: (allianceId) => {
    if (!allianceId) {
      return undefined;
    }
    const color = get().allianceColors[allianceId];
    if (color) {
      return color;
    }
    const fallbackAlliance = ALLIANCE_DIRECTORY.find((entry) => entry.id === allianceId);
    return fallbackAlliance?.color;
  },

  setPlanetOwner: (planetId, ownerId, allianceId) => {
    set((state) => {
      let updatedSystems = state.systems;
      let previousOwnerId: string | undefined;
      updatedSystems = state.systems.map((system) => {
        const planets = system.planets.map((planet) => {
          if (planet.id !== planetId) {
            return planet;
          }
          previousOwnerId = planet.ownerId;
          return {
            ...planet,
            ownerId,
            allianceId,
          };
        });
        return { ...system, planets };
      });

      const profiles = { ...state.profiles };
      const affectedOwners = new Set<string>();
      if (previousOwnerId) {
        affectedOwners.add(previousOwnerId);
      }
      affectedOwners.add(ownerId);
      affectedOwners.forEach((playerId) => {
        profiles[playerId] = deriveProfile(playerId, updatedSystems, state.favorites, state.players);
      });

      return {
        systems: updatedSystems,
        profiles,
      };
    });
  },
}));
