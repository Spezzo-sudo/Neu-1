import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alliance, GalaxySystem, Player } from '@/types';
import {
  axialToPixel,
  buildHexPath,
  computeVisibleAxialBounds,
  describeCoordinate,
  filterSystemsByBounds,
  formatSystemCoordinate,
  getHexHeight,
} from '@/lib/hex';
import OwnerChips from '@/components/galaxy/OwnerChips';

interface HexMapProps {
  systems: GalaxySystem[];
  players: Player[];
  alliances: Alliance[];
  selectedSystemId?: string | null;
  onSelect: (system: GalaxySystem) => void;
  zoom: number;
  onZoomChange: (value: number) => void;
}

const HEX_SIZE = 42;
const findPlayer = (players: Player[], id?: string) => players.find((player) => player.id === id);
const findAlliance = (alliances: Alliance[], id?: string) => alliances.find((alliance) => alliance.id === id);

const aggregateOwners = (system: GalaxySystem, players: Player[], alliances: Alliance[]) => {
  const ownerMap = new Map<string, { label: string; color: string; count: number }>();
  system.planets.forEach((planet) => {
    if (!planet.ownerId) {
      return;
    }
    const player = findPlayer(players, planet.ownerId);
    const alliance = findAlliance(alliances, planet.allianceId);
    const key = planet.ownerId;
    const label = alliance ? `${alliance.tag}` : player?.name ?? 'Unbekannt';
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
    .map((entry, index) => ({ id: `${system.id}-owner-${index}`, label: entry.label, color: entry.color }));
  const extraCount = owners.length > 3 ? owners.length - 3 : 0;
  return {
    owners: owners.slice(0, 3),
    extraCount,
  };
};

/**
 * Interactive hex map with aggregated owner chips for each rendered system.
 */
const HexMap: React.FC<HexMapProps> = ({ systems, players, alliances, selectedSystemId, onSelect, zoom, onZoomChange }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [center, setCenter] = useState({ q: 0, r: 0 });

  useEffect(() => {
    const selected = systems.find((system) => system.id === selectedSystemId);
    if (selected) {
      setCenter(selected.axial);
    }
  }, [selectedSystemId, systems]);

  const bounds = useMemo(() => computeVisibleAxialBounds(center, Math.max(6, Math.round(14 / zoom))), [center, zoom]);
  const visibleSystems = useMemo(() => filterSystemsByBounds(systems, bounds), [systems, bounds]);

  const positioned = useMemo(
    () =>
      visibleSystems.map((system) => {
        const { x, y } = axialToPixel(system.axial, HEX_SIZE);
        return { system, x, y, chips: aggregateOwners(system, players, alliances) };
      }),
    [visibleSystems, players, alliances],
  );

  if (positioned.length === 0) {
    const fallbackHeight = getHexHeight(HEX_SIZE) * 6;
    const fallbackWidth = HEX_SIZE * 12;
    return (
      <div className="steampunk-glass steampunk-border rounded-lg p-4">
        <svg viewBox={`0 0 ${fallbackWidth} ${fallbackHeight}`} className="h-[420px] w-full" role="presentation">
          <title>Keine Systeme sichtbar</title>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            className="font-cinzel fill-yellow-200 text-[0.85rem]"
          >
            Keine Systeme sichtbar
          </text>
        </svg>
      </div>
    );
  }

  const [first, ...rest] = positioned;
  const bounds = rest.reduce(
    (acc, entry) => ({
      minX: Math.min(acc.minX, entry.x),
      maxX: Math.max(acc.maxX, entry.x),
      minY: Math.min(acc.minY, entry.y),
      maxY: Math.max(acc.maxY, entry.y),
    }),
    { minX: first.x, maxX: first.x, minY: first.y, maxY: first.y },
  );
  const padding = HEX_SIZE * 2.5;
  const width = bounds.maxX - bounds.minX + padding * 2;
  const height = bounds.maxY - bounds.minY + padding * 2;

  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.1 : -0.1;
    const next = Math.min(2.5, Math.max(0.6, zoom + delta));
    onZoomChange(Number(next.toFixed(2)));
  };

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    dragStart.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!dragStart.current) {
      return;
    }
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    dragStart.current = { x: event.clientX, y: event.clientY };
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleMouseUp = () => {
    dragStart.current = null;
  };

  return (
    <div className="steampunk-glass steampunk-border rounded-lg p-4">
      <svg
        viewBox={`0 0 ${width} ${Math.max(height, getHexHeight(HEX_SIZE) * 6)}`}
        className="h-[420px] w-full"
        role="presentation"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <radialGradient id="hex-glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
          {positioned.map(({ system, x, y, chips }) => {
            const translatedX = x - bounds.minX + padding;
            const translatedY = y - bounds.minY + padding;
            const isSelected = selectedSystemId === system.id;
            return (
              <g
                key={system.id}
                transform={`translate(${translatedX}, ${translatedY})`}
                onClick={() => onSelect(system)}
                className="cursor-pointer focus:outline-none"
                tabIndex={0}
                aria-label={describeCoordinate(system)}
              >
                <polygon
                  points={buildHexPath(0, 0, HEX_SIZE)}
                  fill="rgba(248, 181, 0, 0.12)"
                  stroke={isSelected ? '#facc15' : 'rgba(140, 84, 18, 0.6)'}
                  strokeWidth={isSelected ? 4 : 2}
                />
                <polygon points={buildHexPath(0, 0, HEX_SIZE)} fill="url(#hex-glow)" opacity={isSelected ? 0.65 : 0.3} />
                <text x={0} y={-HEX_SIZE * 0.1} textAnchor="middle" className="font-cinzel fill-yellow-200 text-[0.8rem]">
                  {formatSystemCoordinate(system)}
                </text>
                <foreignObject x={-HEX_SIZE} y={HEX_SIZE * 0.2} width={HEX_SIZE * 2} height={42} pointerEvents="none">
                  <div className="flex justify-center">
                    <OwnerChips owners={chips.owners} extraCount={chips.extraCount} />
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default React.memo(HexMap);
