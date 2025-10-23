import React from 'react';
import AlliancePanel from '@/components/alliance/AlliancePanel';
import ChatSidebar from '@/components/messaging/ChatSidebar';
import { useDirectoryStore } from '@/store/directoryStore';

/**
 * Combined alliance management view with messaging sidebar for quick coordination.
 */
const AllianceView: React.FC = () => {
  const favoritePlanet = useDirectoryStore((state) => state.favoritePlanet);
  const defaultPlanetId = useDirectoryStore((state) => state.systems[0]?.planets[0]?.id ?? '');

  const handleShareCoordinate = (coordinate: string) => {
    navigator.clipboard?.writeText(coordinate).catch(() => undefined);
  };

  return (
    <section className="grid gap-6 pb-16 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)]">
      <AlliancePanel />
      <div className="flex flex-col gap-4">
        <ChatSidebar onShareCoordinate={handleShareCoordinate} />
        <aside className="rounded-2xl border border-yellow-800/40 bg-black/45 p-4 text-sm text-gray-200">
          <h3 className="text-sm font-cinzel text-yellow-200">Schnellzugriffe</h3>
          <button
            type="button"
            onClick={() => defaultPlanetId && favoritePlanet(defaultPlanetId)}
            className="mt-3 inline-flex items-center gap-2 rounded-md border border-yellow-800/40 bg-black/40 px-3 py-2 text-xs text-yellow-100 disabled:opacity-40"
            disabled={!defaultPlanetId}
          >
            Eigene Heimatbasis favorisieren
          </button>
        </aside>
      </div>
    </section>
  );
};

export default AllianceView;
