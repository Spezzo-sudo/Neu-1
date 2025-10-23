import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { BUILDINGS } from '@/constants';
import GameCard from '@/components/ui/GameCard';

/**
 * Übersicht aller ausbaubaren Gebäude inklusive Upgrade-Kosten und Bauzeit.
 */
const BuildingsView: React.FC = () => {
  const buildings = useGameStore((state) => state.buildings);
  const buildQueue = useGameStore((state) => state.buildQueue);
  const canAfford = useGameStore((state) => state.canAfford);
  const getUpgradeCost = useGameStore((state) => state.getUpgradeCost);
  const getBuildTime = useGameStore((state) => state.getBuildTime);
  const startUpgrade = useGameStore((state) => state.startUpgrade);

  return (
    <section className="space-y-8 pb-16">
      <header className="space-y-2">
        <h2 className="text-[clamp(1.8rem,1.2vw+1.5rem,2.4rem)] font-cinzel text-yellow-300">Gebäudeausbau</h2>
        <p className="text-sm text-gray-300">Organisiere deine Industriekapazitäten in einem responsiven Grid.</p>
      </header>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Object.values(BUILDINGS).map((building) => {
          const currentLevel = buildings[building.id] || 0;
          const targetLevel = buildQueue
            .filter((item) => item.entityId === building.id)
            .reduce((max, item) => Math.max(max, item.level), currentLevel);

          const nextLevel = targetLevel + 1;
          const costForNextUpgrade = getUpgradeCost(building, nextLevel);
          const buildTime = getBuildTime(costForNextUpgrade);
          const isUpgrading = buildQueue.some((item) => item.entityId === building.id);
          const affordable = canAfford(costForNextUpgrade);

          return (
            <GameCard
              key={building.id}
              name={building.name}
              level={currentLevel}
              targetLevel={targetLevel}
              description={building.description}
              upgradeCost={costForNextUpgrade}
              buildTime={buildTime}
              canAfford={affordable}
              onUpgrade={() => startUpgrade(building)}
              isUpgrading={isUpgrading}
              queueLength={buildQueue.length}
            />
          );
        })}
      </div>
    </section>
  );
};

export default BuildingsView;
