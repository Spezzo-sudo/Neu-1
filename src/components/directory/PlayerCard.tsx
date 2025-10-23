import React from 'react';
import { Player } from '@/types';
import { FOCUS_OUTLINE } from '@/styles/tokens';

interface PlayerCardProps {
  player: Player;
  onInspect: (playerId: string) => void;
  onMessage: (playerId: string) => void;
}

/**
 * Compact card element for a player within the directory listing.
 */
const PlayerCard: React.FC<PlayerCardProps> = ({ player, onInspect, onMessage }) => (
  <article className="flex items-center justify-between gap-3 rounded-xl border border-yellow-800/30 bg-black/45 p-3 text-sm text-gray-100">
    <div className="flex items-center gap-3">
      <span
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-yellow-800/50 text-lg"
        style={{ color: player.color }}
        aria-hidden
      >
        {player.name.slice(0, 2).toUpperCase()}
      </span>
      <div>
        <p className="font-cinzel text-yellow-200">{player.name}</p>
        {player.allianceId ? (
          <p className="text-xs text-gray-400">Bande: {player.allianceId}</p>
        ) : (
          <p className="text-xs text-gray-500">Keine Bande</p>
        )}
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onInspect(player.id)}
        className={`rounded-md border border-yellow-800/40 px-3 py-1 text-xs text-yellow-100 ${FOCUS_OUTLINE.className}`}
      >
        Profil
      </button>
      <button
        type="button"
        onClick={() => onMessage(player.id)}
        className={`rounded-md border border-yellow-800/40 px-3 py-1 text-xs text-yellow-100 ${FOCUS_OUTLINE.className}`}
      >
        Nachricht
      </button>
    </div>
  </article>
);

export default React.memo(PlayerCard);
