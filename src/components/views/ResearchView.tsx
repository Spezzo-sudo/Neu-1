import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { RESEARCH } from '@/constants';
import GameCard from '@/components/ui/GameCard';

const RESEARCH_CATEGORIES = {
  antrieb: [
    'aetherdynamik',
    'kolbenAntrieb',
    'dampfjet',
    'aethermotor',
  ],
  oekonomie: [
    'kesseldruckOptimierung',
    'differenzmaschinenKalkuel',
    'observatoriumsnetz',
  ],
  waffen: [
    'panzerungstechnik',
    'teslaSpulenForschung',
    'lichtbogenIngenieurwesen',
    'pulverProjektilkunde',
    'magnetfeldBarrieren',
    'aetherplasmaEntladungen',
  ],
  utility: [
    'spionagetechnologie',
    'rumpfverstaerkungsLegierungen',
  ],
} as const;

const CATEGORY_LABELS: Record<keyof typeof RESEARCH_CATEGORIES, string> = {
  antrieb: 'Antrieb',
  oekonomie: 'Ökonomie',
  waffen: 'Waffen',
  utility: 'Utility',
};

const RESEARCH_REQUIREMENTS: Record<string, string[]> = {
  aetherdynamik: ['Werft Stufe 2'],
  kolbenAntrieb: ['Werft Stufe 1', 'Dampfkraftwerk Stufe 4'],
  dampfjet: ['Kolbenantrieb Stufe 3'],
  aethermotor: ['Ätherdynamik Stufe 5', 'Forschungslabor Stufe 8'],
  kesseldruckOptimierung: ['Dampfkraftwerk Stufe 3'],
  differenzmaschinenKalkuel: ['Forschungslabor Stufe 2'],
  observatoriumsnetz: ['Spionagetechnologie Stufe 2'],
  panzerungstechnik: ['Rumpfverstärkungslegierungen Stufe 2'],
  teslaSpulenForschung: ['Dampfkraftwerk Stufe 6'],
  lichtbogenIngenieurwesen: ['Tesla-Spulen-Forschung Stufe 4'],
  pulverProjektilkunde: ['Vitriol-Destille Stufe 3'],
  magnetfeldBarrieren: ['Panzerungstechnik Stufe 4'],
  aetherplasmaEntladungen: ['Äthermotor Stufe 3'],
  spionagetechnologie: ['Observatoriumsnetz Stufe 1'],
  rumpfverstaerkungsLegierungen: ['Orichalkum-Schmelze Stufe 5'],
};

const ALL_CATEGORY_KEY = 'alle';

type CategoryKey = keyof typeof RESEARCH_CATEGORIES | typeof ALL_CATEGORY_KEY;

/**
 * Übersicht über alle Forschungsprojekte mit Filtertabs für die Informationsarchitektur.
 */
const ResearchView: React.FC = () => {
  const research = useGameStore((state) => state.research);
  const buildQueue = useGameStore((state) => state.buildQueue);
  const canAfford = useGameStore((state) => state.canAfford);
  const getUpgradeCost = useGameStore((state) => state.getUpgradeCost);
  const getBuildTime = useGameStore((state) => state.getBuildTime);
  const startUpgrade = useGameStore((state) => state.startUpgrade);
  const [activeCategory, setActiveCategory] = React.useState<CategoryKey>(ALL_CATEGORY_KEY);

  const handleCategoryChange = (category: CategoryKey) => {
    setActiveCategory(category);
  };

  const categoryEntries = Object.entries(CATEGORY_LABELS) as ([
    keyof typeof RESEARCH_CATEGORIES,
    string,
  ])[];

  const filteredResearch = Object.values(RESEARCH).filter((tech) => {
    if (activeCategory === ALL_CATEGORY_KEY) {
      return true;
    }
    return RESEARCH_CATEGORIES[activeCategory]?.includes(tech.id);
  });

  return (
    <section className="space-y-8 pb-16">
      <header className="space-y-3">
        <h2 className="text-[clamp(1.8rem,1.2vw+1.5rem,2.4rem)] font-cinzel text-yellow-300">Forschungslabor</h2>
        <p className="text-sm text-gray-300">
          Filtere deine Projekte nach Themenbereichen und plane Upgrades mit klaren Anforderungen.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleCategoryChange(ALL_CATEGORY_KEY)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
              activeCategory === ALL_CATEGORY_KEY
                ? 'bg-yellow-600/80 text-black'
                : 'bg-black/40 text-gray-200 hover:bg-yellow-800/40'
            }`}
          >
            Alle
          </button>
          {categoryEntries.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleCategoryChange(key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                activeCategory === key
                  ? 'bg-yellow-600/80 text-black'
                  : 'bg-black/40 text-gray-200 hover:bg-yellow-800/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredResearch.map((tech) => {
          const currentLevel = research[tech.id] || 0;
          const targetLevel = buildQueue
            .filter((item) => item.entityId === tech.id)
            .reduce((max, item) => Math.max(max, item.level), currentLevel);

          const nextLevel = targetLevel + 1;
          const costForNextUpgrade = getUpgradeCost(tech, nextLevel);
          const buildTime = getBuildTime(costForNextUpgrade);
          const isUpgrading = buildQueue.some((item) => item.entityId === tech.id);
          const affordable = canAfford(costForNextUpgrade);
          const requirements = RESEARCH_REQUIREMENTS[tech.id] ?? ['Forschungslabor Stufe 1'];

          return (
            <GameCard
              key={tech.id}
              name={tech.name}
              level={currentLevel}
              targetLevel={targetLevel}
              description={tech.description}
              upgradeCost={costForNextUpgrade}
              buildTime={buildTime}
              canAfford={affordable}
              onUpgrade={() => startUpgrade(tech)}
              isUpgrading={isUpgrading}
              queueLength={buildQueue.length}
              meta={(
                <ul className="flex flex-wrap gap-2 text-xs">
                  {requirements.map((req) => (
                    <li key={req} className="rounded-full bg-yellow-900/40 px-3 py-1 text-yellow-200">
                      {req}
                    </li>
                  ))}
                </ul>
              )}
            />
          );
        })}
      </div>
    </section>
  );
};

export default ResearchView;
