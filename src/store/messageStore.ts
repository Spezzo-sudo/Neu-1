import { create } from 'zustand';
import { Message, MessageRoom } from '@/types';
import { CURRENT_PLAYER_ID, PLAYER_DIRECTORY } from '@/lib/mockFactory';

interface MessageState {
  rooms: MessageRoom[];
  activeRoomId: string;
  messages: Record<string, Message[]>;
  currentPlayerId: string;
}

interface MessageActions {
  openRoom: (roomId: string) => void;
  sendMessage: (roomId: string, body: string) => void;
  ensureDirectRoom: (playerId: string) => string;
}

const buildInitialRooms = (): MessageRoom[] => {
  const currentPlayer = PLAYER_DIRECTORY.find((player) => player.id === CURRENT_PLAYER_ID);
  const ally = PLAYER_DIRECTORY.find((player) => player.id !== CURRENT_PLAYER_ID);
  return [
    {
      id: 'alliance-room',
      type: 'alliance',
      title: 'Bandenfunk',
      participantIds: [CURRENT_PLAYER_ID, ...(currentPlayer?.allianceId ? [currentPlayer.allianceId] : [])],
    },
    {
      id: `direct-${ally?.id ?? 'ally'}`,
      type: 'direct',
      title: ally?.name ?? 'Verbündeter',
      participantIds: [CURRENT_PLAYER_ID, ally?.id ?? 'ally'],
    },
  ];
};

const buildInitialMessages = (rooms: MessageRoom[]): Record<string, Message[]> => {
  const ally = PLAYER_DIRECTORY.find((player) => player.id !== CURRENT_PLAYER_ID);
  return rooms.reduce<Record<string, Message[]>>((acc, room) => {
    if (room.type === 'alliance') {
      acc[room.id] = [
        {
          id: `${room.id}-1`,
          roomId: room.id,
          authorId: CURRENT_PLAYER_ID,
          body: 'Einsatzbesprechung in 10 Minuten – bitte Systeme 12,12,2 sichern.',
          createdAt: Date.now() - 5 * 60 * 1000,
        },
      ];
    } else {
      acc[room.id] = [
        {
          id: `${room.id}-1`,
          roomId: room.id,
          authorId: ally?.id ?? 'ally',
          body: 'Sammle Flotte bei 14,18,3. Teile Koordinaten im Bande-Channel!',
          createdAt: Date.now() - 2 * 60 * 1000,
        },
      ];
    }
    return acc;
  }, {});
};

/**
 * Ephemeral session message store for chat experiments without a backend.
 */
export const useMessageStore = create<MessageState & MessageActions>((set, get) => {
  const rooms = buildInitialRooms();
  return {
    rooms,
    activeRoomId: rooms[0]?.id ?? 'alliance-room',
    messages: buildInitialMessages(rooms),
    currentPlayerId: CURRENT_PLAYER_ID,

    openRoom: (roomId) => set({ activeRoomId: roomId }),

    sendMessage: (roomId, body) => {
      if (!body.trim()) {
        return;
      }
      set((state) => ({
        messages: {
          ...state.messages,
          [roomId]: [
            ...(state.messages[roomId] ?? []),
            {
              id: `${roomId}-${Date.now()}`,
              roomId,
              authorId: state.currentPlayerId,
              body: body.trim(),
              createdAt: Date.now(),
            },
          ],
        },
      }));
    },

    ensureDirectRoom: (playerId) => {
      const { rooms: currentRooms } = get();
      const existing = currentRooms.find((room) => room.type === 'direct' && room.participantIds.includes(playerId));
      if (existing) {
        return existing.id;
      }
      const player = PLAYER_DIRECTORY.find((entry) => entry.id === playerId);
      const roomId = `direct-${playerId}`;
      const newRoom: MessageRoom = {
        id: roomId,
        type: 'direct',
        title: player?.name ?? 'Unbekannt',
        participantIds: [CURRENT_PLAYER_ID, playerId],
      };
      set((state) => ({
        rooms: [...state.rooms, newRoom],
        messages: {
          ...state.messages,
          [roomId]: [],
        },
      }));
      return roomId;
    },
  };
});
