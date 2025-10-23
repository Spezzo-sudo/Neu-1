import { create } from 'zustand';
import { Alliance } from '@/types';
import { ALLIANCE_DIRECTORY, CURRENT_PLAYER_ID } from '@/lib/mockFactory';
import { useDirectoryStore } from '@/store/directoryStore';

interface AllianceState {
  alliances: Alliance[];
  invites: Record<string, string>;
  myAllianceId?: string;
  currentPlayerId: string;
}

interface CreateAlliancePayload {
  tag: string;
  name: string;
  color: string;
}

interface AllianceActions {
  createAlliance: (payload: CreateAlliancePayload) => void;
  joinAlliance: (inviteCode: string) => void;
  leaveAlliance: () => void;
  setAllianceColor: (color: string) => void;
  addNote: (text: string) => void;
  addPact: (type: 'nap' | 'ally', targetAllianceId: string) => void;
}

const cloneAlliance = (alliance: Alliance): Alliance => ({
  ...alliance,
  members: [...alliance.members],
  ranks: alliance.ranks.map((rank) => ({ ...rank, permissions: { ...rank.permissions } })),
  pacts: alliance.pacts.map((pact) => ({ ...pact })),
  notes: [...alliance.notes],
});

const bootstrapAlliances = () => ALLIANCE_DIRECTORY.map((alliance) => cloneAlliance(alliance));

const buildInvites = (alliances: Alliance[]) =>
  alliances.reduce<Record<string, string>>((acc, alliance) => {
    acc[`${alliance.tag}-JOIN`] = alliance.id;
    return acc;
  }, {});

const updatePlayerAlliance = (playerId: string, allianceId?: string) => {
  useDirectoryStore.setState((state) => ({
    players: state.players.map((player) =>
      player.id === playerId ? { ...player, allianceId } : player,
    ),
    profiles: state.profiles[playerId]
      ? {
          ...state.profiles,
          [playerId]: { ...state.profiles[playerId], allianceId },
        }
      : state.profiles,
  }));
};

const removeMemberFromAlliance = (alliances: Alliance[], allianceId: string, memberId: string) =>
  alliances.map((alliance) =>
    alliance.id === allianceId
      ? { ...alliance, members: alliance.members.filter((member) => member !== memberId) }
      : alliance,
  );

const addMemberToAlliance = (alliances: Alliance[], allianceId: string, memberId: string) =>
  alliances.map((alliance) =>
    alliance.id === allianceId && !alliance.members.includes(memberId)
      ? { ...alliance, members: [...alliance.members, memberId] }
      : alliance,
  );

const resolveCurrentPlayerId = () => useDirectoryStore.getState().currentPlayerId || CURRENT_PLAYER_ID;

const applyAllianceDirectory = (
  set: (partial: Partial<AllianceState>) => void,
  alliances: Alliance[],
  invites: Record<string, string>,
  currentPlayerId: string,
  myAllianceId?: string,
) => {
  set({
    alliances,
    invites,
    currentPlayerId,
    myAllianceId,
    isLoading: false,
    isReady: true,
  });
};

/**
 * Lightweight client-side alliance store handling membership and notes.
 */
export const useAllianceStore = create<AllianceState & AllianceActions>((set, _get) => ({
  alliances: [],
  invites: {},
  myAllianceId: undefined,
  currentPlayerId: CURRENT_PLAYER_ID,
  isLoading: false,
  isReady: false,
  error: undefined,

  initialize: async () => {
    if (_get().isReady || _get().isLoading) {
      return;
    }
    await _get().refresh();
  },

  refresh: async () => {
    set({ isLoading: true, error: undefined });
    const currentPlayerId = resolveCurrentPlayerId();
    try {
      const response = await fetchAllianceDirectory();
      const alliances = response.alliances.map((alliance) => cloneAlliance(alliance));
      const invites = Object.keys(response.invites ?? {}).length > 0 ? response.invites : buildInvites(alliances);
      const myAllianceId = response.currentAllianceId
        ? response.currentAllianceId
        : alliances.find((entry) => entry.members.includes(currentPlayerId))?.id;
      applyAllianceDirectory(set, alliances, invites, currentPlayerId, myAllianceId);
    } catch (error) {
      console.error('Alliance directory fallback active:', error);
      const alliances = bootstrapAlliances();
      const invites = buildInvites(alliances);
      const myAllianceId = alliances.find((entry) => entry.members.includes(currentPlayerId))?.id;
      applyAllianceDirectory(set, alliances, invites, currentPlayerId, myAllianceId);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler beim Laden der Allianzen.' });
    }
  },

  createAlliance: ({ tag, name, color }) => {
    set((state) => {
      const allianceId = `alliance-${state.alliances.length + 1}-${Date.now()}`;
      const newAlliance: Alliance = {
        id: allianceId,
        tag,
        name,
        color,
        members: [state.currentPlayerId],
        ranks:
          state.alliances[0]?.ranks.map((rank) => ({ ...rank, permissions: { ...rank.permissions } })) ?? [],
        pacts: [],
        notes: ['* Frisch gegründete Bande – strukturiert eure Kommandokette.'],
      };
      const alliancesWithoutMember = state.myAllianceId
        ? removeMemberFromAlliance(state.alliances, state.myAllianceId, state.currentPlayerId)
        : state.alliances;
      updatePlayerAlliance(state.currentPlayerId, allianceId);
      return {
        alliances: [...alliancesWithoutMember, newAlliance],
        invites: { ...state.invites, [`${tag}-JOIN`]: allianceId },
        myAllianceId: allianceId,
      };
    });
  },

  joinAlliance: (inviteCode) => {
    set((state) => {
      const allianceId = state.invites[inviteCode];
      if (!allianceId) {
        return {};
      }
      const alliancesWithoutMember = state.myAllianceId
        ? removeMemberFromAlliance(state.alliances, state.myAllianceId, state.currentPlayerId)
        : state.alliances;
      const alliances = addMemberToAlliance(alliancesWithoutMember, allianceId, state.currentPlayerId);
      updatePlayerAlliance(state.currentPlayerId, allianceId);
      return {
        alliances,
        myAllianceId: allianceId,
      };
    });
  },

  leaveAlliance: () => {
    set((state) => {
      if (!state.myAllianceId) {
        return {};
      }
      const alliances = removeMemberFromAlliance(state.alliances, state.myAllianceId, state.currentPlayerId);
      updatePlayerAlliance(state.currentPlayerId, undefined);
      return {
        alliances,
        myAllianceId: undefined,
      };
    });
  },

  setAllianceColor: (color) => {
    set((state) => {
      if (!state.myAllianceId) {
        return {};
      }
      const alliances = state.alliances.map((alliance) =>
        alliance.id === state.myAllianceId ? { ...alliance, color } : alliance,
      );
      return { alliances };
    });
  },

  addNote: (text) => {
    set((state) => {
      if (!state.myAllianceId || !text.trim()) {
        return {};
      }
      const alliances = state.alliances.map((alliance) =>
        alliance.id === state.myAllianceId
          ? { ...alliance, notes: [...alliance.notes, text.trim()] }
          : alliance,
      );
      return { alliances };
    });
  },

  addPact: (type, targetAllianceId) => {
    set((state) => {
      if (!state.myAllianceId || !targetAllianceId) {
        return {};
      }
      const alliances = state.alliances.map((alliance) =>
        alliance.id === state.myAllianceId
          ? {
              ...alliance,
              pacts: [
                ...alliance.pacts,
                {
                  id: `pact-${alliance.id}-${Date.now()}`,
                  type,
                  targetAllianceId,
                },
              ],
            }
          : alliance,
      );
      return { alliances };
    });
  },
}));
/**
 * Lightweight client-side alliance store handling membership and notes.
 */
export const useAllianceStore = create<AllianceState & AllianceActions>((set, _get) => {
  const initialAlliances = bootstrapAlliances();
  const currentPlayer = CURRENT_PLAYER_ID;
  const playerAlliance = initialAlliances.find((entry) => entry.members.includes(currentPlayer))?.id;
  return {
    alliances: initialAlliances,
    invites: buildInvites(initialAlliances),
    myAllianceId: playerAlliance,
    currentPlayerId: currentPlayer,

    createAlliance: ({ tag, name, color }) => {
      set((state) => {
        const allianceId = `alliance-${state.alliances.length + 1}-${Date.now()}`;
        const newAlliance: Alliance = {
          id: allianceId,
          tag,
          name,
          color,
          members: [state.currentPlayerId],
          ranks:
            state.alliances[0]?.ranks.map((rank) => ({ ...rank, permissions: { ...rank.permissions } })) ?? [],
          pacts: [],
          notes: ['* Frisch gegründete Bande – strukturiert eure Kommandokette.'],
        };
        const alliancesWithoutMember = state.myAllianceId
          ? removeMemberFromAlliance(state.alliances, state.myAllianceId, state.currentPlayerId)
          : state.alliances;
        updatePlayerAlliance(state.currentPlayerId, allianceId);
        return {
          alliances: [...alliancesWithoutMember, newAlliance],
          invites: { ...state.invites, [`${tag}-JOIN`]: allianceId },
          myAllianceId: allianceId,
        };
      });
    },

    joinAlliance: (inviteCode) => {
      set((state) => {
        const allianceId = state.invites[inviteCode];
        if (!allianceId) {
          return {};
        }
        const alliancesWithoutMember = state.myAllianceId
          ? removeMemberFromAlliance(state.alliances, state.myAllianceId, state.currentPlayerId)
          : state.alliances;
        const alliances = addMemberToAlliance(alliancesWithoutMember, allianceId, state.currentPlayerId);
        updatePlayerAlliance(state.currentPlayerId, allianceId);
        return {
          alliances,
          myAllianceId: allianceId,
        };
      });
    },

    leaveAlliance: () => {
      set((state) => {
        if (!state.myAllianceId) {
          return {};
        }
        const alliances = removeMemberFromAlliance(state.alliances, state.myAllianceId, state.currentPlayerId);
        updatePlayerAlliance(state.currentPlayerId, undefined);
        return {
          alliances,
          myAllianceId: undefined,
        };
      });
    },

    setAllianceColor: (color) => {
      set((state) => {
        if (!state.myAllianceId) {
          return {};
        }
        const alliances = state.alliances.map((alliance) =>
          alliance.id === state.myAllianceId ? { ...alliance, color } : alliance,
        );
        return { alliances };
      });
    },

    addNote: (text) => {
      set((state) => {
        if (!state.myAllianceId || !text.trim()) {
          return {};
        }
        const alliances = state.alliances.map((alliance) =>
          alliance.id === state.myAllianceId
            ? { ...alliance, notes: [...alliance.notes, text.trim()] }
            : alliance,
        );
        return { alliances };
      });
    },

    addPact: (type, targetAllianceId) => {
      set((state) => {
        if (!state.myAllianceId || !targetAllianceId) {
          return {};
        }
        const alliances = state.alliances.map((alliance) =>
          alliance.id === state.myAllianceId
            ? {
                ...alliance,
                pacts: [
                  ...alliance.pacts,
                  {
                    id: `pact-${alliance.id}-${Date.now()}`,
                    type,
                    targetAllianceId,
                  },
                ],
              }
            : alliance,
        );
        return { alliances };
      });
    },
  };
});
