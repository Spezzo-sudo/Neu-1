import React, { useEffect, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { BUILDINGS, RESEARCH, SERVER_SPEED } from '@/constants';
import ProgressBar from '@/components/ui/ProgressBar';
import { BuildQueueItem, MissionStatus, MissionType, ResourceType } from '@/types';
import { useDirectoryStore } from '@/store/directoryStore';
import { CARD_MIN_HEIGHT, FOCUS_OUTLINE, SECTION_SPACING } from '@/styles/tokens';
import { useMissionStore } from '@/store/missionStore';
import { formatSystemCoordinate } from '@/lib/hex';
import { calculateResourceProductionPerTick } from '@/lib/economy';

const formatDuration = (ms: number) => {
  if (ms < 0) {
    ms = 0;
  }
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds >= 5940) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const QUEUE_ICONS: Record<'building' | 'research', string> = {
  building: '🏭',
  research: '🔬',
};

const MISSION_ICONS: Record<MissionType, string> = {
  [MissionType.Angriff]: '⚔️',
  [MissionType.Transport]: '🚚',
  [MissionType.Spionage]: '🛰️',
  [MissionType.Stationierung]: '🛡️',
  [MissionType.Kolonisierung]: '🚩',
};

const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  [MissionStatus.Geplant]: 'Vorbereitung',
  [MissionStatus.Unterwegs]: 'Unterwegs',
  [MissionStatus.Abgeschlossen]: 'Abgeschlossen',
  [MissionStatus.Rueckkehr]: 'Rückkehr',
  [MissionStatus.Abgebrochen]: 'Abgebrochen',
};

const RESOURCE_DETAILS: Record<ResourceType, { label: string; icon: string }> = {
  [ResourceType.Orichalkum]: { label: 'Orichalkum', icon: '⛏️' },
  [ResourceType.Fokuskristalle]: { label: 'Fokuskristalle', icon: '🔮' },
  [ResourceType.Vitriol]: { label: 'Vitriol', icon: '⚗️' },
};

const RESOURCE_ORDER: ResourceType[] = [ResourceType.Orichalkum, ResourceType.Fokuskristalle, ResourceType.Vitriol];

const numberFormatter = new Intl.NumberFormat('de-DE');

const formatHourlyRate = (value: number) => {
  if (Math.abs(value) < 0.05) {
    return '0.0';
  }
  const absolute = Math.abs(value);
  const base = absolute >= 100 ? Math.round(absolute).toString() : absolute.toFixed(1);
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${base}`;
};

const ResourceSummaryCard: React.FC = () => {
  const resources = useGameStore((state) => state.resources);
  const storage = useGameStore((state) => state.storage);
  const buildings = useGameStore((state) => state.buildings);
  const efficiency = useGameStore((state) => state.kesseldruck.efficiency);

  const productionPerHour = useMemo(() => {
    const perSecond = calculateResourceProductionPerTick(buildings, SERVER_SPEED, efficiency);
    return (Object.values(ResourceType) as ResourceType[]).reduce<Record<ResourceType, number>>((acc, resource) => {
      acc[resource] = perSecond[resource] * 3600;
      return acc;
    }, {} as Record<ResourceType, number>);
  }, [buildings, efficiency]);

  return (
    <div className="rounded-2xl border border-yellow-800/30 bg-black/50 p-6 shadow-xl" style={{ minHeight: CARD_MIN_HEIGHT.sm }}>
      <h3 className="text-[clamp(1.2rem,1vw+1rem,1.6rem)] font-cinzel text-yellow-200">Ressourcenbilanz</h3>
      <ul className="mt-3 space-y-3 text-sm text-gray-200">
        {RESOURCE_ORDER.map((resource) => {
          const { icon, label } = RESOURCE_DETAILS[resource];
          const amount = resources[resource];
          const capacity = storage[resource];
          const ratePerHour = productionPerHour[resource] ?? 0;
          const remaining = Math.max(0, capacity - amount);
          const secondsToFull = ratePerHour <= 0 ? null : (remaining / ratePerHour) * 3600;
          const secondsToEmpty = ratePerHour >= 0 ? null : (amount / Math.abs(ratePerHour)) * 3600;
          let statusLabel = 'Stagnation';
          if (remaining <= 0) {
            statusLabel = 'Lager voll';
          } else if (secondsToFull && Number.isFinite(secondsToFull) && secondsToFull > 0) {
            statusLabel = `Voll in ${formatDuration(secondsToFull * 1000)}`;
          } else if (secondsToEmpty && Number.isFinite(secondsToEmpty) && secondsToEmpty > 0) {
            statusLabel = `Leer in ${formatDuration(secondsToEmpty * 1000)}`;
          } else if (ratePerHour > 0) {
            statusLabel = 'Auffüllung läuft';
          } else if (ratePerHour < 0) {
            statusLabel = 'Entnahme aktiv';
          }

          return (
            <li key={resource} className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2">
              <div className="flex items-center gap-2">
                <span aria-hidden className="text-lg">
                  {icon}
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-yellow-300">{label}</p>
                  <p className="font-mono text-sm text-gray-100">
                    {numberFormatter.format(Math.floor(amount))} / {numberFormatter.format(Math.floor(capacity))}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-gray-300">
                <p className="font-semibold text-yellow-200">{formatHourlyRate(ratePerHour)} / Std</p>
                <p>{statusLabel}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

interface QueueCardProps {
  entityId: string;
  items: BuildQueueItem[];
}

const QueueCard: React.FC<QueueCardProps> = ({ entityId, items }) => {
  const now = Date.now();
  const entity = BUILDINGS[entityId] || RESEARCH[entityId];
  if (!entity) {
    return null;
  }
  const isBuilding = Boolean(BUILDINGS[entityId]);
  const icon = isBuilding ? QUEUE_ICONS.building : QUEUE_ICONS.research;
  const activeItem = items.find((item) => now >= item.startTime && now < item.endTime) ?? null;

  return (
    <li className="rounded-xl border border-yellow-800/30 bg-black/45 p-4 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-left">
          <span className="text-2xl" aria-hidden>
            {icon}
          </span>
          <div>
            <p className="font-cinzel text-sm uppercase tracking-wide text-yellow-200">{entity.name}</p>
            <p className="text-xs text-gray-300">{items.length} Auftrag{items.length > 1 ? 'e' : ''}</p>
          </div>
        </div>
        {activeItem ? (
          <span className="font-mono text-sm text-yellow-100">{formatDuration(activeItem.endTime - now)}</span>
        ) : (
          <span className="text-xs text-gray-400">Wartet</span>
        )}
      </div>
      {activeItem && (
        <div className="mt-3">
          <ProgressBar
            progress={((now - activeItem.startTime) / (activeItem.endTime - activeItem.startTime)) * 100}
          />
          <p className="mt-1 text-xs text-gray-300">
            Stufe {activeItem.level - 1} → {activeItem.level}
          </p>
        </div>
      )}
      <ul className="mt-4 space-y-2 text-xs text-gray-300">
        {items.map((item) => {
          const statusLabel = now >= item.endTime ? 'Abgeschlossen' : now >= item.startTime ? 'In Arbeit' : 'Wartet';
          return (
            <li key={`${entityId}-${item.level}`} className="flex items-center justify-between">
              <span>{statusLabel}</span>
              <span className="font-mono">{formatDuration((item.endTime - now) > 0 ? item.endTime - now : item.endTime - item.startTime)}</span>
            </li>
          );
        })}
      </ul>
    </li>
  );
};

const useBottleneck = () => {
  const resources = useGameStore((state) => state.resources);
  const storage = useGameStore((state) => state.storage);
  const kesseldruck = useGameStore((state) => state.kesseldruck);

  return useMemo(() => {
    if (kesseldruck.net < 0) {
      return `Kesseldruck fällt um ${Math.abs(Math.round(kesseldruck.net))} bar`; // no timer without server ticks
    }
    const nearingFull = (Object.values(ResourceType) as ResourceType[])
      .map((resource) => ({
        resource,
        remaining: storage[resource] - resources[resource],
      }))
      .sort((a, b) => a.remaining - b.remaining)[0];
    if (nearingFull && nearingFull.remaining <= storage[nearingFull.resource] * 0.1) {
      return `${nearingFull.resource} Lager füllt sich in Kürze`;
    }
    return 'Keine Engpässe in Sicht';
  }, [kesseldruck.net, resources, storage]);
};

/**
 * Übersicht mit Fokus auf Warteschlangen, Engpässen und Planetenstatus.
 */
const OverviewView: React.FC = () => {
  const buildQueue = useGameStore((state) => state.buildQueue);
  const buildings = useGameStore((state) => state.buildings);
  const research = useGameStore((state) => state.research);
  const bottleneck = useBottleneck();
  const favorites = useDirectoryStore((state) => state.favorites);
  const getPlanetById = useDirectoryStore((state) => state.getPlanetById);
  const getSystemById = useDirectoryStore((state) => state.getSystemById);
  const openProfile = useDirectoryStore((state) => state.openPlayerProfile);
  const favoritePlanet = useDirectoryStore((state) => state.favoritePlanet);
  const missions = useMissionStore((state) => state.missions);
  const originPlanetId = useMissionStore((state) => state.originPlanetId);
  const setOriginPlanet = useMissionStore((state) => state.setOriginPlanet);
  const cancelMission = useMissionStore((state) => state.cancelMission);
  const recallMission = useMissionStore((state) => state.recallMission);
  const systems = useDirectoryStore((state) => state.systems);
  const currentPlayerId = useDirectoryStore((state) => state.currentPlayerId);

  const groupedQueue = useMemo(() => {
    return buildQueue.reduce<Record<string, BuildQueueItem[]>>((acc, item) => {
      if (!acc[item.entityId]) {
        acc[item.entityId] = [];
      }
      acc[item.entityId].push(item);
      return acc;
    }, {});
  }, [buildQueue]);

  const favoriteEntries = useMemo(() => {
    return favorites
      .map((planetId) => {
        const planet = getPlanetById(planetId);
        if (!planet) {
          return null;
        }
        const system = getSystemById(planet.systemId);
        if (!system) {
          return null;
        }
        return {
          id: planet.id,
          name: planet.name,
          coordinates: `${system.sectorQ},${system.sectorR},${system.sysIndex}:${planet.slot}`,
          ownerId: planet.ownerId,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  }, [favorites, getPlanetById, getSystemById]);

  const missionEntries = useMemo(() => {
    const now = Date.now();
    return missions.map((mission) => {
      const targetSystem = getSystemById(mission.target.systemId);
      const coordinate = targetSystem
        ? `${formatSystemCoordinate(targetSystem)}:${mission.target.slot}`
        : `${mission.target.systemId}:${mission.target.slot}`;
      let timingLabel = 'Ziel erreicht';
      if (mission.status === MissionStatus.Geplant) {
        timingLabel = `Start in ${formatDuration(mission.launchAt - now)}`;
      } else if (mission.status === MissionStatus.Unterwegs) {
        timingLabel = `Ankunft in ${formatDuration(mission.arrivalAt - now)}`;
      } else if (mission.status === MissionStatus.Rueckkehr) {
        const eta = mission.returnArrivalAt ? mission.returnArrivalAt - now : 0;
        timingLabel = `Rückkehr in ${formatDuration(eta)}`;
      } else if (mission.status === MissionStatus.Abgebrochen) {
        timingLabel = mission.cancelledAt ? `Abbruch vor ${formatDuration(now - mission.cancelledAt)}` : 'Abgebrochen';
      }
      return {
        id: mission.id,
        coordinate,
        planetName: mission.target.planetName,
        status: mission.status,
        type: mission.type,
        timingLabel,
        canCancel: mission.status === MissionStatus.Geplant,
        canRecall: mission.status === MissionStatus.Unterwegs,
        isReturning: mission.status === MissionStatus.Rueckkehr,
        isCancelled: mission.status === MissionStatus.Abgebrochen,
      };
    });
  }, [getSystemById, missions]);

  const ownedPlanets = useMemo(() => {
    const planets: { id: string; label: string }[] = [];
    systems.forEach((system) => {
      system.planets.forEach((planet) => {
        if (planet.ownerId === currentPlayerId) {
          planets.push({
            id: planet.id,
            label: `${formatSystemCoordinate(system)}:${planet.slot} · ${planet.name}`,
          });
        }
      });
    });
    return planets;
  }, [currentPlayerId, systems]);

  useEffect(() => {
    if (ownedPlanets.length === 0) {
      return;
    }
    const hasOrigin = ownedPlanets.some((planet) => planet.id === originPlanetId);
    if (!hasOrigin) {
      setOriginPlanet(ownedPlanets[0].id);
    }
  }, [ownedPlanets, originPlanetId, setOriginPlanet]);

  const selectedOrigin = ownedPlanets.some((planet) => planet.id === originPlanetId)
    ? originPlanetId
    : ownedPlanets[0]?.id ?? '';

  return (
    <section className="space-y-8 pb-16">
      <header className="space-y-2" style={{ marginTop: SECTION_SPACING.headingTop }}>
        <h2 className="text-[clamp(1.8rem,1.2vw+1.5rem,2.4rem)] font-cinzel text-yellow-300">Planetenübersicht</h2>
        <p className="text-sm text-gray-300">Behalte Baufortschritt, Engpässe und die aktuelle Produktionslage im Blick.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div
          className="flex flex-col gap-6 rounded-2xl border border-yellow-800/30 bg-black/45 p-6 text-center shadow-xl"
          style={{ minHeight: CARD_MIN_HEIGHT.lg }}
        >
          <img
            src="https://picsum.photos/seed/steampunkplanet/500/300"
            alt="Planet Chronos Prime"
            className="mx-auto h-48 w-48 rounded-full border-4 border-yellow-600/50 object-cover shadow-lg"
          />
          <div className="space-y-1">
            <h3 className="text-[clamp(1.3rem,1vw+1.1rem,1.8rem)] font-cinzel">Heimatplanet &quot;Chronos Prime&quot;</h3>
            <p className="text-sm text-gray-400">Koordinaten: [1:1:1]</p>
            <p className="text-xs uppercase tracking-wide text-yellow-200">{bottleneck}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div
            className="rounded-2xl border border-yellow-800/30 bg-black/50 p-6 shadow-xl"
            style={{ minHeight: CARD_MIN_HEIGHT.md }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[clamp(1.2rem,1vw+1rem,1.6rem)] font-cinzel text-yellow-200">Bauschleife</h3>
              <span className="text-xs text-gray-400">{buildQueue.length} aktive Aufträge</span>
            </div>
            {buildQueue.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {Object.entries(groupedQueue).map(([entityId, items]) => (
                  <QueueCard key={entityId} entityId={entityId} items={items} />
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-center text-sm text-gray-400">Keine Aufträge in der Warteschlange.</p>
            )}
          </div>
          <div
            className="rounded-2xl border border-yellow-800/30 bg-black/50 p-6 shadow-xl"
            style={{ minHeight: CARD_MIN_HEIGHT.sm }}
          >
            <h3 className="text-[clamp(1.2rem,1vw+1rem,1.6rem)] font-cinzel text-yellow-200">Status</h3>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-sm text-gray-200 sm:grid-cols-2">
              <div className="rounded-lg bg-black/40 p-3">
                <dt className="text-xs uppercase tracking-wide text-yellow-300">Aktive Gebäude</dt>
                <dd>{Object.keys(buildings).length} Strukturen</dd>
              </div>
              <div className="rounded-lg bg-black/40 p-3">
                <dt className="text-xs uppercase tracking-wide text-yellow-300">Forschungsstufen</dt>
                <dd>{Object.keys(research).length} Projekte</dd>
              </div>
            </dl>
          </div>
          <ResourceSummaryCard />
          <div className="rounded-2xl border border-yellow-800/30 bg-black/50 p-6 shadow-xl" style={{ minHeight: CARD_MIN_HEIGHT.sm }}>
            <h3 className="text-[clamp(1.2rem,1vw+1rem,1.6rem)] font-cinzel text-yellow-200">Favoriten &amp; Einsätze</h3>
            {favoriteEntries.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm text-gray-200">
                {favoriteEntries.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-yellow-300">{entry.coordinates}</p>
                      <p>{entry.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.ownerId && (
                        <button
                          type="button"
                          onClick={() => openProfile(entry.ownerId!)}
                          className={`rounded-md border border-yellow-800/40 px-2 py-1 text-[0.7rem] text-yellow-100 ${FOCUS_OUTLINE.className}`}
                        >
                          Profil
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => favoritePlanet(entry.id)}
                        className={`rounded-md border border-yellow-800/40 px-2 py-1 text-[0.7rem] text-yellow-100 ${FOCUS_OUTLINE.className}`}
                      >
                        Entfernen
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-gray-400">
                Noch keine Favoriten gesetzt. Markiere Ziele direkt in der Galaxieansicht, um hier schnell zu springen.
              </p>
            )}
            <div className="mt-5 border-t border-yellow-800/40 pt-4">
              <h4 className="font-cinzel text-sm uppercase tracking-wide text-yellow-300">Aktive Missionen</h4>
              {ownedPlanets.length > 0 && (
                <div className="mt-3 flex flex-col gap-2 text-xs text-gray-300 sm:flex-row sm:items-center sm:justify-between">
                  <label htmlFor="originPlanet" className="font-semibold text-yellow-200">
                    Startplanet auswählen
                  </label>
                  <select
                    id="originPlanet"
                    value={selectedOrigin}
                    onChange={(event) => setOriginPlanet(event.target.value)}
                    className={`w-full rounded-md border border-yellow-800/40 bg-black/60 px-3 py-2 text-sm text-gray-100 sm:w-auto ${FOCUS_OUTLINE.className}`}
                    aria-label="Startplanet für Missionen"
                  >
                    {ownedPlanets.map((planet) => (
                      <option key={planet.id} value={planet.id}>
                        {planet.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {missionEntries.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm text-gray-200">
                  {missionEntries.map((mission) => (
                    <li key={mission.id} className="rounded-lg bg-black/40 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span aria-hidden className="text-lg">
                            {MISSION_ICONS[mission.type]}
                          </span>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-yellow-300">{mission.coordinate}</p>
                            <p>{mission.planetName}</p>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-300">
                          <p
                            className={`font-semibold ${
                              mission.isCancelled
                                ? 'text-red-300'
                                : mission.isReturning
                                ? 'text-yellow-300'
                                : 'text-yellow-200'
                            }`}
                          >
                            {MISSION_STATUS_LABELS[mission.status]}
                          </p>
                          <p>{mission.timingLabel}</p>
                        </div>
                      </div>
                      {(mission.canCancel || mission.canRecall) && (
                        <div className="mt-3 flex flex-wrap justify-end gap-2 text-xs">
                          {mission.canCancel && (
                            <button
                              type="button"
                              onClick={() => cancelMission(mission.id)}
                              className={`rounded-md border border-yellow-800/40 px-3 py-1 text-yellow-100 transition hover:bg-yellow-800/30 ${FOCUS_OUTLINE.className}`}
                            >
                              Abbrechen
                            </button>
                          )}
                          {mission.canRecall && (
                            <button
                              type="button"
                              onClick={() => recallMission(mission.id)}
                              className={`rounded-md border border-yellow-800/40 px-3 py-1 text-yellow-100 transition hover:bg-yellow-800/30 ${FOCUS_OUTLINE.className}`}
                            >
                              Rückruf
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-gray-400">Noch keine Flotten unterwegs.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverviewView;
