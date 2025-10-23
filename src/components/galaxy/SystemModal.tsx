import React, { useEffect } from 'react';
import { GalaxySystem, MissionType } from '@/types';
import { formatSystemCoordinate } from '@/lib/hex';
import { FOCUS_OUTLINE } from '@/styles/tokens';

interface SystemModalProps {
  system: GalaxySystem;
  onClose: () => void;
  onJumpToPlanet: (planetId: string) => void;
  onPlanMission: (planetId: string, type: MissionType) => void;
  onFavorite: (planetId: string) => void;
  getPlayerName: (playerId?: string) => string;
  getAllianceTag: (allianceId?: string) => string | undefined;
  onInspectPlayer: (playerId: string) => void;
  favorites: string[];
  currentPlayerId: string;
  currentAllianceId?: string;
}

/**
 * Detailed modal for a galaxy system, listing every slot and contextual actions.
 */
const SystemModal: React.FC<SystemModalProps> = ({
  system,
  onClose,
  onJumpToPlanet,
  onPlanMission,
  onFavorite,
  getPlayerName,
  getAllianceTag,
  onInspectPlayer,
  favorites,
  currentPlayerId,
  currentAllianceId,
}) => {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const coordinate = formatSystemCoordinate(system);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={`System ${coordinate}`}
    >
      <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-yellow-800/40 bg-black/85 p-6 text-sm shadow-2xl">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-yellow-800/40 pb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-yellow-300">Sektor {system.sectorQ}:{system.sectorR}</p>
            <h2 className="text-[clamp(1.5rem,1vw+1.2rem,2.1rem)] font-cinzel text-yellow-200">System {system.displayName}</h2>
            <p className="text-xs text-gray-400">Koordinate {coordinate}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className={`rounded-md border border-yellow-700/40 bg-yellow-800/20 px-3 py-1 text-xs uppercase tracking-wide text-yellow-100 ${FOCUS_OUTLINE.className}`}
              onClick={() => navigator.clipboard?.writeText(coordinate).catch(() => undefined)}
            >
              Koordinate kopieren
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`rounded-md border border-yellow-800/40 bg-black/40 px-3 py-1 text-xs text-gray-300 hover:text-white ${FOCUS_OUTLINE.className}`}
            >
              Schließen
            </button>
          </div>
        </header>
        <ul className="mt-4 space-y-3">
          {system.planets.map((planet) => {
            const playerName = getPlayerName(planet.ownerId);
            const allianceTag = getAllianceTag(planet.allianceId);
            const isOwned = Boolean(planet.ownerId);
            const isFavorite = favorites.includes(planet.id);
            const isCurrentPlayerOwner = planet.ownerId === currentPlayerId;
            const isAllianceMate =
              Boolean(planet.allianceId) && Boolean(currentAllianceId) && planet.allianceId === currentAllianceId;
            const isEnemy = isOwned && !isCurrentPlayerOwner && !isAllianceMate;
            return (
              <li
                key={planet.id}
                className="rounded-xl border border-yellow-800/30 bg-black/50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-yellow-300">Slot {planet.slot}</p>
                    <h3 className="text-lg font-cinzel text-yellow-100">{planet.name}</h3>
                    <p className="text-xs text-gray-400">{planet.biome}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right text-xs">
                    <div className="flex items-center gap-2">
                      <span className="rounded-sm bg-yellow-800/30 px-2 py-1 text-[0.65rem] text-yellow-100">
                        {isOwned ? playerName : 'Frei'}
                      </span>
                      {allianceTag && (
                        <span className="rounded-sm bg-yellow-900/40 px-2 py-1 text-[0.65rem] text-amber-200">{allianceTag}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {isOwned && planet.ownerId && (
                        <button
                          type="button"
                          onClick={() => onInspectPlayer(planet.ownerId!)}
                          className={`rounded-md border border-yellow-800/40 px-2 py-1 text-[0.7rem] text-yellow-100 ${FOCUS_OUTLINE.className}`}
                        >
                          Profil öffnen
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onJumpToPlanet(planet.id)}
                        className={`rounded-md border border-yellow-800/40 px-2 py-1 text-[0.7rem] text-gray-200 hover:text-white ${FOCUS_OUTLINE.className}`}
                      >
                        Zu Planet springen
                      </button>
                      {isOwned ? (
                        <>
                          {isEnemy && (
                            <>
                              <button
                                type="button"
                                onClick={() => onPlanMission(planet.id, MissionType.Angriff)}
                                className={`rounded-md border border-red-800/40 bg-red-900/30 px-2 py-1 text-[0.7rem] text-red-200 ${FOCUS_OUTLINE.className}`}
                              >
                                Angriff planen
                              </button>
                              <button
                                type="button"
                                onClick={() => onPlanMission(planet.id, MissionType.Spionage)}
                                className={`rounded-md border border-purple-800/40 bg-purple-900/30 px-2 py-1 text-[0.7rem] text-purple-200 ${FOCUS_OUTLINE.className}`}
                              >
                                Spionage senden
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => onPlanMission(planet.id, MissionType.Transport)}
                            className={`rounded-md border border-sky-800/40 bg-sky-900/30 px-2 py-1 text-[0.7rem] text-sky-200 ${FOCUS_OUTLINE.className}`}
                          >
                            Transport planen
                          </button>
                          {(isCurrentPlayerOwner || isAllianceMate) && (
                            <button
                              type="button"
                              onClick={() => onPlanMission(planet.id, MissionType.Stationierung)}
                              className={`rounded-md border border-amber-800/40 bg-amber-900/30 px-2 py-1 text-[0.7rem] text-amber-200 ${FOCUS_OUTLINE.className}`}
                            >
                              Stationierung
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onPlanMission(planet.id, MissionType.Kolonisierung)}
                          className={`rounded-md border border-emerald-700/40 bg-emerald-900/30 px-2 py-1 text-[0.7rem] text-emerald-200 ${FOCUS_OUTLINE.className}`}
                        >
                          Kolonisieren vormerken
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onFavorite(planet.id)}
                        className={`rounded-md border border-yellow-800/40 px-2 py-1 text-[0.7rem] ${
                          isFavorite ? 'bg-yellow-700/30 text-yellow-200' : 'text-yellow-100'
                        } ${FOCUS_OUTLINE.className}`}
                        aria-pressed={isFavorite}
                        aria-label={isFavorite ? 'Favorit entfernen' : 'Als Favorit speichern'}
                      >
                        {isFavorite ? 'Favorit ✓' : 'Favorisieren'}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SystemModal;
