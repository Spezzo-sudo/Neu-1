import React, { useEffect, useMemo, useState } from 'react';
import { BIOME_STYLES } from '@/constants';
import { Alliance, GalaxyPlanet, GalaxySystem, MissionType, PlanetBiome, Player } from '@/types';
import { useDirectoryStore } from '@/store/directoryStore';
import { useAllianceStore } from '@/store/allianceStore';
import HexMap from '@/components/galaxy/HexMap';
import SystemModal from '@/components/galaxy/SystemModal';
import GalaxyLegend from '@/components/galaxy/GalaxyLegend';
import VirtualList from '@/lib/virtualList';
import { formatSystemCoordinate, parseSystemCoordinate } from '@/lib/hex';
import OwnerChips, { OwnerChipEntry } from '@/components/galaxy/OwnerChips';
import ChatSidebar from '@/components/messaging/ChatSidebar';
import { FOCUS_OUTLINE } from '@/styles/tokens';
import { useMissionStore } from '@/store/missionStore';

const ROW_HEIGHT = 76;

interface TableRow {
  id: string;
  coordinate: string;
  systemName: string;
  freeSlots: number;
  owners: OwnerChipEntry[];
  extraOwnerCount: number;
  systemIndex: number;
}

const buildOwnerSummary = (
  systemId: string,
  planets: GalaxyPlanet[],
  players: Player[],
  alliances: Alliance[],
) => {
  const ownerMap = new Map<string, { label: string; color: string; count: number }>();
  planets.forEach((planet) => {
    if (!planet.ownerId) {
      return;
    }
    const player = players.find((entry) => entry.id === planet.ownerId);
    const alliance = alliances.find((entry) => entry.id === planet.allianceId);
    const key = planet.ownerId;
    const label = alliance ? alliance.tag : player?.name ?? 'Unbekannt';
    const color = alliance?.color ?? player?.color ?? '#facc15';
    const entry = ownerMap.get(key);
    if (entry) {
      entry.count += 1;
    } else {
      ownerMap.set(key, { label, color, count: 1 });
    }
  });
  const owners = Array.from(ownerMap.values())
    .sort((a, b) => b.count - a.count)
    .map((entry, index) => ({ id: `${systemId}-owner-${index}`, label: entry.label, color: entry.color }));
  return {
    owners: owners.slice(0, 3),
    extra: owners.length > 3 ? owners.length - 3 : 0,
  };
};

/**
 * Galaxy v3 view combining virtualised table, large map and lightweight communication tools.
 */
const GalaxyView: React.FC = () => {
  const systems = useDirectoryStore((state) => state.systems);
  const players = useDirectoryStore((state) => state.players);
  const currentPlayerId = useDirectoryStore((state) => state.currentPlayerId);
  const openProfile = useDirectoryStore((state) => state.openPlayerProfile);
  const favoritePlanet = useDirectoryStore((state) => state.favoritePlanet);
  const favorites = useDirectoryStore((state) => state.favorites);
  const alliances = useAllianceStore((state) => state.alliances);
  const planMission = useMissionStore((state) => state.planMission);

  const [searchTerm, setSearchTerm] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [onlyFree, setOnlyFree] = useState(false);
  const [biomeFilter, setBiomeFilter] = useState<PlanetBiome | 'all'>('all');
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [modalSystemId, setModalSystemId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.1);

  const selectedSystem = useMemo(
    () => systems.find((system) => system.id === selectedSystemId) ?? null,
    [selectedSystemId, systems],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sysParam = params.get('sys');
    if (!sysParam) {
      return;
    }
    const coordinate = parseSystemCoordinate(sysParam);
    if (!coordinate) {
      return;
    }
    const system = systems.find(
      (entry) =>
        entry.sectorQ === coordinate.sectorQ &&
        entry.sectorR === coordinate.sectorR &&
        entry.sysIndex === coordinate.sysIndex,
    );
    if (system) {
      setSelectedSystemId(system.id);
      setModalSystemId(system.id);
    }
  }, [systems]);

  useEffect(() => {
    if (!selectedSystem) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set('sys', formatSystemCoordinate(selectedSystem));
    window.history.replaceState(null, '', `?${params.toString()}`);
  }, [selectedSystem]);

  const biomeOptions = useMemo(() => Object.entries(BIOME_STYLES) as [PlanetBiome, { label: string; fill: string; stroke: string }][], []);

  const tableRows = useMemo<TableRow[]>(() => {
    const term = searchTerm.trim().toLowerCase();
    return systems
      .map((system, index) => {
        const coordinate = formatSystemCoordinate(system);
        const freeSlots = system.planets.filter((planet) => !planet.ownerId).length;
        const ownerSummary = buildOwnerSummary(system.id, system.planets, players, alliances);
        const haystack = [
          coordinate,
          system.displayName,
          ...system.planets.map((planet) => planet.name.toLowerCase()),
          ...system.planets.map((planet) => {
            const player = players.find((entry) => entry.id === planet.ownerId);
            return player?.name.toLowerCase() ?? '';
          }),
          ...system.planets.map((planet) => {
            const alliance = alliances.find((entry) => entry.id === planet.allianceId);
            return alliance?.tag.toLowerCase() ?? '';
          }),
        ]
          .join(' ')
          .toLowerCase();

        const passesSearch = term.length === 0 || haystack.includes(term);
        const passesBiome =
          biomeFilter === 'all' || system.planets.some((planet) => planet.biome === biomeFilter);
        const passesMine = !onlyMine || system.planets.some((planet) => planet.ownerId === currentPlayerId);
        const passesFree = !onlyFree || freeSlots > 0;

        if (!(passesSearch && passesBiome && passesMine && passesFree)) {
          return null;
        }

        return {
          id: system.id,
          coordinate,
          systemName: system.displayName,
          freeSlots,
          owners: ownerSummary.owners,
          extraOwnerCount: ownerSummary.extra,
          systemIndex: index,
        };
      })
      .filter((entry): entry is TableRow => Boolean(entry));
  }, [alliances, biomeFilter, currentPlayerId, onlyFree, onlyMine, players, searchTerm, systems]);

  const selectedIndex = tableRows.findIndex((row) => row.id === selectedSystemId);

  const handleRowSelect = (row: TableRow) => {
    setSelectedSystemId(row.id);
    setModalSystemId(row.id);
  };

  const handleMapSelect = (system: GalaxySystem) => {
    setSelectedSystemId(system.id);
    setModalSystemId(system.id);
  };

  const currentPlayer = players.find((player) => player.id === currentPlayerId) ?? null;
  const currentAllianceId = currentPlayer?.allianceId;
  const getPlayerName = (playerId?: string) => players.find((player) => player.id === playerId)?.name ?? 'Frei';
  const getAllianceTag = (allianceId?: string) => alliances.find((alliance) => alliance.id === allianceId)?.tag;

  const legendBiomes = biomeOptions.map(([id, style]) => ({ id, label: style.label, fill: style.fill }));
  const legendAlliances = alliances.map((alliance) => ({ id: alliance.id, tag: alliance.tag, color: alliance.color }));
  const shareCoordinate = (coordinate: string) => navigator.clipboard?.writeText(coordinate).catch(() => undefined);

  const handlePlanMission = (planetId: string, type: MissionType) => {
    const planet = selectedSystem?.planets.find((entry) => entry.id === planetId);
    if (!planet || !selectedSystem) {
      return;
    }
    planMission({ targetPlanetId: planet.id, missionType: type });
  };

  return (
    <section className="space-y-6 pb-16">
      <header className="space-y-1">
        <h2 className="text-[clamp(1.8rem,1.2vw+1.5rem,2.4rem)] font-cinzel text-yellow-300">Galaxie v3</h2>
        <p className="text-sm text-gray-300">
          Filtere Systeme für 100+ Kommandanten, nutze Deep-Links und plane Einsätze direkt auf der Karte.
        </p>
      </header>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-yellow-800/30 bg-black/45 p-5 shadow-xl">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Koordinaten, Spieler oder Allianz"
                className={`w-full rounded-md border border-yellow-800/40 bg-black/40 px-3 py-2 text-sm text-yellow-100 placeholder:text-gray-500 ${FOCUS_OUTLINE.className}`}
              />
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={onlyMine}
                    onChange={(event) => setOnlyMine(event.target.checked)}
                    className="h-4 w-4 rounded border-yellow-800/40 bg-black/40"
                  />
                  Nur meine
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={onlyFree}
                    onChange={(event) => setOnlyFree(event.target.checked)}
                    className="h-4 w-4 rounded border-yellow-800/40 bg-black/40"
                  />
                  Freie Slots
                </label>
                <select
                  value={biomeFilter}
                  onChange={(event) => setBiomeFilter(event.target.value as PlanetBiome | 'all')}
                  className={`rounded-md border border-yellow-800/40 bg-black/40 px-2 py-1 ${FOCUS_OUTLINE.className}`}
                >
                  <option value="all">Alle Biome</option>
                  {biomeOptions.map(([id, style]) => (
                    <option key={id} value={id}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {tableRows.length} von {systems.length} Systemen sichtbar
            </p>
          </div>
          <div className="rounded-2xl border border-yellow-800/30 bg-black/45 p-2 shadow-xl">
            <VirtualList
              rowCount={tableRows.length}
              rowHeight={ROW_HEIGHT}
              height={520}
              renderRow={(index) => {
                const row = tableRows[index];
                if (!row) {
                  return null;
                }
                const isSelected = row.id === selectedSystemId;
                return (
                  <button
                    type="button"
                    onClick={() => handleRowSelect(row)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border border-yellow-800/30 bg-black/40 px-4 py-3 text-left text-sm transition-colors ${
                      isSelected ? 'bg-yellow-900/30 text-yellow-100' : 'hover:bg-yellow-800/20 text-gray-200'
                    }`}
                  >
                    <div>
                      <p className="font-cinzel text-yellow-200">{row.coordinate}</p>
                      <p className="text-xs text-gray-400">{row.systemName}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <OwnerChips owners={row.owners} extraCount={row.extraOwnerCount} />
                      <span className="rounded-md bg-black/40 px-2 py-1 text-xs text-yellow-200">Frei: {row.freeSlots}</span>
                    </div>
                  </button>
                );
              }}
              scrollToIndex={selectedIndex >= 0 ? selectedIndex : null}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <HexMap
              systems={systems}
              players={players}
              alliances={alliances}
              selectedSystemId={selectedSystemId}
              onSelect={handleMapSelect}
              zoom={zoom}
              onZoomChange={setZoom}
            />
            <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-4">
              <div className="pointer-events-auto inline-flex flex-col gap-2 rounded-xl border border-yellow-800/30 bg-black/60 p-2 shadow-lg">
                <button
                  type="button"
                  onClick={() => setZoom((value) => Math.min(2.5, Number((value + 0.2).toFixed(2))))}
                  className={`rounded-md border border-yellow-800/40 px-2 py-1 text-sm text-yellow-100 ${FOCUS_OUTLINE.className}`}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((value) => Math.max(0.6, Number((value - 0.2).toFixed(2))))}
                  className={`rounded-md border border-yellow-800/40 px-2 py-1 text-sm text-yellow-100 ${FOCUS_OUTLINE.className}`}
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className={`rounded-md border border-yellow-800/40 px-2 py-1 text-xs text-yellow-100 ${FOCUS_OUTLINE.className}`}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          <GalaxyLegend biomes={legendBiomes} alliances={legendAlliances} />
          <ChatSidebar
            coordinate={selectedSystem ? formatSystemCoordinate(selectedSystem) : undefined}
            onShareCoordinate={shareCoordinate}
          />
        </div>
      </div>
      {modalSystemId && selectedSystem && (
        <SystemModal
          system={selectedSystem}
          onClose={() => setModalSystemId(null)}
          onJumpToPlanet={(_planetId) => {
            setModalSystemId(null);
          }}
          onPlanMission={handlePlanMission}
          onFavorite={(planetId) => favoritePlanet(planetId)}
          getPlayerName={getPlayerName}
          getAllianceTag={getAllianceTag}
          onInspectPlayer={openProfile}
          favorites={favorites}
          currentPlayerId={currentPlayerId}
          currentAllianceId={currentAllianceId}
        />
      )}
    </section>
  );
};

export default GalaxyView;
