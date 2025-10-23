import React, { useEffect, useMemo, useState } from 'react';
import { PlayerProfile } from '@/types';
import { FOCUS_OUTLINE } from '@/styles/tokens';

interface PlayerModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onFavorite: (planetId: string) => void;
  onMessage: (playerId: string) => void;
  onInvite: (playerId: string) => void;
}

const PAGE_SIZE = 6;

/**
 * Modal overlay summarising a player profile including colonised planets.
 */
const PlayerModal: React.FC<PlayerModalProps> = ({ profile, onClose, onFavorite, onMessage, onInvite }) => {
  const [page, setPage] = useState(0);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    setPage(0);
  }, [profile.id]);

  const paginatedPlanets = useMemo(() => {
    const start = page * PAGE_SIZE;
    return profile.planets.slice(start, start + PAGE_SIZE);
  }, [page, profile.planets]);

  const totalPages = Math.max(1, Math.ceil(profile.planets.length / PAGE_SIZE));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Profil ${profile.id}`}
    >
      <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-yellow-800/40 bg-black/85 p-6 text-sm text-gray-200 shadow-2xl">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-yellow-800/30 pb-4">
          <div>
            <h2 className="text-[clamp(1.4rem,1vw+1.1rem,1.9rem)] font-cinzel text-yellow-200">{profile.tagline}</h2>
            <p className="text-xs text-gray-400">Zuletzt aktiv: vor {Math.round((Date.now() - profile.lastActiveAt) / (60 * 60 * 1000))} Stunden</p>
            {profile.allianceId ? (
              <p className="text-xs text-amber-200">Bande: {profile.allianceId}</p>
            ) : (
              <p className="text-xs text-gray-500">Keine Bande</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onInvite(profile.id)}
              className={`rounded-md border border-emerald-700/40 bg-emerald-900/30 px-3 py-1 text-xs text-emerald-200 ${FOCUS_OUTLINE.className}`}
            >
              In Bande einladen
            </button>
            <button
              type="button"
              onClick={() => onMessage(profile.id)}
              className={`rounded-md border border-yellow-800/40 bg-yellow-800/20 px-3 py-1 text-xs text-yellow-100 ${FOCUS_OUTLINE.className}`}
            >
              Nachricht senden
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
        <section className="mt-4">
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-cinzel text-yellow-200">Kolonien</h3>
            <span className="text-xs text-gray-400">
              {profile.planets.length} Planeten · Seite {page + 1} / {totalPages}
            </span>
          </header>
          <ul className="mt-3 space-y-2">
            {paginatedPlanets.map((planet) => (
              <li
                key={planet.planetId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-yellow-800/30 bg-black/45 px-3 py-2"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-yellow-300">{planet.coordinates}</p>
                  <p className="text-xs text-gray-300">Slot {planet.slot} · {planet.biome}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onFavorite(planet.planetId)}
                    className={`rounded-md border border-yellow-800/40 px-2 py-1 text-[0.7rem] ${
                      planet.isFavorite ? 'bg-yellow-700/30 text-yellow-200' : 'text-yellow-100'
                    } ${FOCUS_OUTLINE.className}`}
                  >
                    {planet.isFavorite ? 'Favorit ✓' : 'Favorisieren'}
                  </button>
                </div>
              </li>
            ))}
            {paginatedPlanets.length === 0 && <li className="text-xs text-gray-500">Keine Planeten verzeichnet.</li>}
          </ul>
          <footer className="mt-4 flex items-center justify-between text-xs text-gray-400">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              disabled={page === 0}
              className={`rounded-md border border-yellow-800/40 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_OUTLINE.className}`}
            >
              Zurück
            </button>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
              disabled={page >= totalPages - 1}
              className={`rounded-md border border-yellow-800/40 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_OUTLINE.className}`}
            >
              Weiter
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
};

export default PlayerModal;
