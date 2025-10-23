import React from 'react';
import { SHIP_BLUEPRINTS } from '@/constants';
import { ResourceType } from '@/types';

const formatCost = (value: number) => value.toLocaleString('de-DE');

/**
 * UI-Skelett für die Werft mit Blueprint-Übersicht und Platzhaltern für zukünftige Logik.
 */
const WerftView: React.FC = () => {
  return (
    <section className="space-y-8 pb-20">
      <header className="space-y-2">
        <h2 className="text-[clamp(1.8rem,1.2vw+1.5rem,2.4rem)] font-cinzel text-yellow-300">Werft</h2>
        <p className="text-sm text-gray-300">
          Plane Flottenprojekte, sieh verfügbare Hangar-Slots und bereite die nächsten Missionen vor.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-yellow-800/30 bg-black/45 p-6 shadow-xl">
          <h3 className="text-[clamp(1.2rem,1vw+1rem,1.6rem)] font-cinzel text-yellow-200">Blueprints</h3>
          <p className="text-xs text-gray-400">Jedes Schiff beansprucht Hangar-Slots. Der Bau wird in einem späteren Sprint aktiviert.</p>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {SHIP_BLUEPRINTS.map((ship) => (
              <article key={ship.id} className="flex h-full flex-col justify-between rounded-xl border border-yellow-800/30 bg-black/40 p-4">
                <header className="space-y-1">
                  <h4 className="text-lg font-cinzel text-yellow-200">{ship.name}</h4>
                  <p className="text-xs uppercase tracking-wide text-gray-400">{ship.role}</p>
                </header>
                <p className="mt-2 text-sm text-gray-300">{ship.description}</p>
                <dl className="mt-4 space-y-2 text-xs text-gray-200">
                  <div className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2">
                    <dt className="uppercase tracking-wide text-yellow-300">Hangar</dt>
                    <dd>{ship.hangarSlots} Slots</dd>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2">
                    <dt className="uppercase tracking-wide text-yellow-300">Crew</dt>
                    <dd>{ship.crew} Personen</dd>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2">
                    <dt className="uppercase tracking-wide text-yellow-300">Laderaum</dt>
                    <dd>{formatCost(ship.cargo)} Einheiten</dd>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2">
                    <dt className="uppercase tracking-wide text-yellow-300">Bauzeit</dt>
                    <dd>{(ship.buildTimeSeconds / 60).toFixed(0)} Minuten</dd>
                  </div>
                </dl>
                <div className="mt-4 space-y-1 text-xs text-gray-400">
                  <p className="font-semibold text-yellow-200">Kosten:</p>
                  <ul className="space-y-1">
                    <li>Orichalkum: {formatCost(ship.baseCost[ResourceType.Orichalkum])}</li>
                    <li>Fokuskristalle: {formatCost(ship.baseCost[ResourceType.Fokuskristalle])}</li>
                    <li>Vitriol: {formatCost(ship.baseCost[ResourceType.Vitriol])}</li>
                  </ul>
                </div>
                <button
                  type="button"
                  disabled
                  className="mt-5 w-full cursor-not-allowed rounded-md bg-gray-700/60 py-2 text-sm font-cinzel uppercase tracking-wide text-gray-400"
                >
                  In Planung
                </button>
              </article>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-yellow-800/30 bg-black/50 p-6 shadow-xl">
            <h3 className="text-[clamp(1.2rem,1vw+1rem,1.6rem)] font-cinzel text-yellow-200">Werftstatus</h3>
            <dl className="mt-3 space-y-3 text-sm text-gray-200">
              <div className="rounded-lg bg-black/40 p-3">
                <dt className="text-xs uppercase tracking-wide text-yellow-300">Verfügbare Slots</dt>
                <dd>12 von 16 Slots frei</dd>
              </div>
              <div className="rounded-lg bg-black/40 p-3">
                <dt className="text-xs uppercase tracking-wide text-yellow-300">Aktive Bauaufträge</dt>
                <dd>Noch keine – hier erscheint später die Queue.</dd>
              </div>
              <div className="rounded-lg bg-black/40 p-3">
                <dt className="text-xs uppercase tracking-wide text-yellow-300">Nächste Mission</dt>
                <dd>Konvoi nach &quot;Nimbus Reach&quot; (ETA TBA)</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl border border-yellow-800/30 bg-black/45 p-6 shadow-xl">
            <h3 className="text-[clamp(1.1rem,1vw+0.9rem,1.5rem)] font-cinzel text-yellow-200">Checkliste</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-300">
              <li>✔ Ressourcenpuffer prüfen</li>
              <li>✔ Hangar-Slots reservieren</li>
              <li>⏳ Crewzuteilung automatisieren</li>
              <li>⏳ Missionsplanung ans Backend anbinden</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WerftView;
