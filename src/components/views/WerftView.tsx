import React, { useMemo, useState } from 'react';
import { SHIP_BLUEPRINTS } from '@/constants';
import { ResourceType, ShipBuildOrder } from '@/types';
import { useShipyardStore } from '@/store/shipyardStore';
import { FOCUS_OUTLINE } from '@/styles/tokens';

const formatCost = (value: number) => value.toLocaleString('de-DE');

const formatDuration = (ms: number) => {
  if (ms <= 0) {
    return 'fertig';
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${remainingMinutes}:${seconds}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds}`;
};

const ORDER_STATUS_LABELS: Record<ShipBuildOrder['status'], string> = {
  queued: 'Wartet',
  building: 'Im Bau',
  completed: 'Bereit',
  cancelled: 'Gestoppt',
};

/**
 * Voll funktionsfähige Werftübersicht mit Hangar-Überwachung, Queue-Verwaltung und Auftragssteuerung.
 */
const WerftView: React.FC = () => {
  const queue = useShipyardStore((state) => state.queue);
  const inventory = useShipyardStore((state) => state.inventory);
  const hangarCapacity = useShipyardStore((state) => state.hangarCapacity);
  const startOrder = useShipyardStore((state) => state.startOrder);
  const cancelOrder = useShipyardStore((state) => state.cancelOrder);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const hangarUsage = useMemo(() => {
    const used = Object.entries(inventory).reduce((acc, [blueprintId, amount]) => {
      const blueprint = SHIP_BLUEPRINTS.find((entry) => entry.id === blueprintId);
      if (!blueprint) {
        return acc;
      }
      return acc + blueprint.hangarSlots * amount;
    }, 0);
    const reserved = queue.reduce((acc, order) => {
      if (order.status === 'completed') {
        return acc;
      }
      const blueprint = SHIP_BLUEPRINTS.find((entry) => entry.id === order.blueprintId);
      if (!blueprint) {
        return acc;
      }
      return acc + blueprint.hangarSlots * order.quantity;
    }, 0);
    return {
      used,
      reserved,
      free: Math.max(hangarCapacity - used - reserved, 0),
    };
  }, [hangarCapacity, inventory, queue]);

  const queueEntries = useMemo(() => {
    const now = Date.now();
    return [...queue]
      .sort((a, b) => a.startTime - b.startTime)
      .map((order) => {
        const blueprint = SHIP_BLUEPRINTS.find((entry) => entry.id === order.blueprintId);
        const remaining = order.status === 'completed' ? 0 : Math.max(order.endTime - now, 0);
        return {
          ...order,
          blueprintName: blueprint?.name ?? order.blueprintId,
          remaining,
          hangarSlots: blueprint?.hangarSlots ?? 0,
        };
      });
  }, [queue]);

  const inventoryEntries = useMemo(
    () =>
      Object.entries(inventory)
        .filter(([, amount]) => amount > 0)
        .map(([blueprintId, amount]) => {
          const blueprint = SHIP_BLUEPRINTS.find((entry) => entry.id === blueprintId);
          return {
            id: blueprintId,
            name: blueprint?.name ?? blueprintId,
            amount,
            slots: (blueprint?.hangarSlots ?? 0) * amount,
          };
        }),
    [inventory],
  );

  const handleQuantityChange = (blueprintId: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [blueprintId]: Math.max(1, Math.min(10, value)) }));
  };

  const renderOrderActions = (order: ShipBuildOrder) => {
    if (order.status !== 'queued') {
      return null;
    }
    return (
      <button
        type="button"
        onClick={() => cancelOrder(order.id)}
        className={`rounded-md border border-yellow-800/40 px-2 py-1 text-xs text-yellow-100 transition hover:bg-yellow-800/30 ${FOCUS_OUTLINE.className}`}
      >
        Auftrag abbrechen
      </button>
    );
  };

  return (
    <section className="space-y-8 pb-20">
      <header className="space-y-2">
        <h2 className="text-[clamp(1.8rem,1.2vw+1.5rem,2.4rem)] font-cinzel text-yellow-300">Werft</h2>
        <p className="text-sm text-gray-300">
          Plane Flottenprojekte, überwache Hangar-Slots und halte neue Schiffe für kommende Missionen bereit.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-yellow-800/30 bg-black/45 p-6 shadow-xl">
          <h3 className="text-[clamp(1.2rem,1vw+1rem,1.6rem)] font-cinzel text-yellow-200">Blueprints</h3>
          <p className="text-xs text-gray-400">Wähle eine Konfiguration und starte den Bauauftrag direkt in der Werft.</p>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {SHIP_BLUEPRINTS.map((ship) => {
              const quantity = quantities[ship.id] ?? 1;
              return (
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
                      <dt className="uppercase tracking-wide text-yellow-300">Bauzeit</dt>
                      <dd>{(ship.buildTimeSeconds / 60).toFixed(0)} Minuten</dd>
                    </div>
                  </dl>
                  <div className="mt-4 space-y-1 text-xs text-gray-400">
                    <p className="font-semibold text-yellow-200">Kosten pro Einheit:</p>
                    <ul className="space-y-1">
                      <li>Orichalkum: {formatCost(ship.baseCost[ResourceType.Orichalkum])}</li>
                      <li>Fokuskristalle: {formatCost(ship.baseCost[ResourceType.Fokuskristalle])}</li>
                      <li>Vitriol: {formatCost(ship.baseCost[ResourceType.Vitriol])}</li>
                    </ul>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-xs text-gray-300" htmlFor={`quantity-${ship.id}`}>
                      Anzahl
                      <input
                        id={`quantity-${ship.id}`}
                        type="number"
                        min={1}
                        max={10}
                        value={quantity}
                        onChange={(event) => handleQuantityChange(ship.id, Number(event.target.value))}
                        className={`w-16 rounded-md border border-yellow-800/40 bg-black/60 px-2 py-1 text-right text-sm text-yellow-100 ${FOCUS_OUTLINE.className}`}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => startOrder(ship.id, quantity)}
                      className={`rounded-md border border-yellow-800/40 px-3 py-2 text-sm font-cinzel uppercase tracking-wide text-yellow-100 transition hover:bg-yellow-800/30 ${FOCUS_OUTLINE.className}`}
                    >
                      Bau starten
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-yellow-800/30 bg-black/50 p-6 shadow-xl">
            <h3 className="text-[clamp(1.2rem,1vw+1rem,1.6rem)] font-cinzel text-yellow-200">Werftstatus</h3>
            <dl className="mt-3 space-y-3 text-sm text-gray-200">
              <div className="rounded-lg bg-black/40 p-3">
                <dt className="text-xs uppercase tracking-wide text-yellow-300">Belegte Slots</dt>
                <dd>
                  {hangarUsage.used} / {hangarCapacity}
                </dd>
              </div>
              <div className="rounded-lg bg-black/40 p-3">
                <dt className="text-xs uppercase tracking-wide text-yellow-300">Reservierte Slots</dt>
                <dd>{hangarUsage.reserved}</dd>
              </div>
              <div className="rounded-lg bg-black/40 p-3">
                <dt className="text-xs uppercase tracking-wide text-yellow-300">Freie Slots</dt>
                <dd>{hangarUsage.free}</dd>
              </div>
            </dl>
            <div className="mt-4 border-t border-yellow-800/40 pt-4">
              <h4 className="font-cinzel text-sm uppercase tracking-wide text-yellow-300">Flotte im Hangar</h4>
              {inventoryEntries.length > 0 ? (
                <ul className="mt-3 space-y-2 text-xs text-gray-200">
                  {inventoryEntries.map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2">
                      <span>{entry.name}</span>
                      <span>{entry.amount} Schiffe · {entry.slots} Slots</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-gray-400">Noch keine Schiffe im Hangar stationiert.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-800/30 bg-black/45 p-6 shadow-xl">
            <h3 className="text-[clamp(1.1rem,1vw+0.9rem,1.5rem)] font-cinzel text-yellow-200">Bauaufträge</h3>
            {queueEntries.length > 0 ? (
              <ul className="mt-3 space-y-3 text-sm text-gray-200">
                {queueEntries.map((order) => (
                  <li key={order.id} className="rounded-lg bg-black/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-cinzel text-sm text-yellow-200">{order.blueprintName}</p>
                        <p className="text-xs text-gray-400">{order.quantity} Stück · {order.hangarSlots * order.quantity} Slots</p>
                      </div>
                      <div className="text-right text-xs text-gray-300">
                        <p className="font-semibold text-yellow-200">{ORDER_STATUS_LABELS[order.status]}</p>
                        <p>{formatDuration(order.remaining)}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">{renderOrderActions(order)}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-gray-400">Keine offenen Bauaufträge – starte neue Projekte über die Blueprint-Liste.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WerftView;
