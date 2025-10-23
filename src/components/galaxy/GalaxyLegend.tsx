import React from 'react';
import { PlanetBiome } from '@/types';

interface BiomeEntry {
  id: PlanetBiome;
  label: string;
  fill: string;
}

interface AllianceEntry {
  id: string;
  tag: string;
  color: string;
}

interface GalaxyLegendProps {
  biomes: BiomeEntry[];
  alliances: AllianceEntry[];
}

/**
 * Renders a combined legend for biome colors and alliance identifiers used on the map.
 */
const GalaxyLegend: React.FC<GalaxyLegendProps> = ({ biomes, alliances }) => (
  <aside className="space-y-4 rounded-xl border border-yellow-800/30 bg-black/40 p-4 text-sm text-gray-200">
    <section aria-label="Biome">
      <h3 className="text-xs font-cinzel uppercase tracking-wider text-yellow-200">Biome</h3>
      <ul className="mt-2 space-y-1">
        {biomes.map((biome) => (
          <li key={biome.id} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: biome.fill }} aria-hidden />
            <span>{biome.label}</span>
          </li>
        ))}
      </ul>
    </section>
    <section aria-label="Allianzen">
      <h3 className="text-xs font-cinzel uppercase tracking-wider text-yellow-200">Banden</h3>
      <ul className="mt-2 space-y-1">
        {alliances.map((alliance) => (
          <li key={alliance.id} className="flex items-center gap-2">
            <span className="inline-flex h-3 w-8 items-center justify-center rounded-sm text-[0.65rem]" style={{ backgroundColor: alliance.color }}>
              {alliance.tag}
            </span>
            <span className="text-xs text-gray-300">{alliance.id}</span>
          </li>
        ))}
        {alliances.length === 0 && <li className="text-xs text-gray-400">Keine Bande beigetreten.</li>}
      </ul>
    </section>
  </aside>
);

export default React.memo(GalaxyLegend);
