import React from 'react';
import { Resources, ResourceType } from '@/types';
import { MAX_BUILD_QUEUE_LENGTH } from '@/constants';

interface GameCardProps {
  name: string;
  level: number;
  targetLevel: number;
  description: string;
  upgradeCost: Resources;
  buildTime: number;
  canAfford: boolean;
  onUpgrade: () => void;
  isUpgrading: boolean;
  queueLength: number;
  meta?: React.ReactNode;
}

const formatTime = (seconds: number) => {
  if (seconds < 0) {
    seconds = 0;
  }
  if (seconds >= 5940) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
  }
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${secs}`;
};

const CostDisplay: React.FC<{ cost: Resources }> = ({ cost }) => (
  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-200">
    {cost[ResourceType.Orichalkum] > 0 && (
      <span>Or: {cost[ResourceType.Orichalkum].toLocaleString('de-DE')}</span>
    )}
    {cost[ResourceType.Fokuskristalle] > 0 && (
      <span>Kr: {cost[ResourceType.Fokuskristalle].toLocaleString('de-DE')}</span>
    )}
    {cost[ResourceType.Vitriol] > 0 && (
      <span>Vt: {cost[ResourceType.Vitriol].toLocaleString('de-DE')}</span>
    )}
  </div>
);

const GameCard: React.FC<GameCardProps> = ({
  name,
  level,
  targetLevel,
  description,
  upgradeCost,
  buildTime,
  canAfford,
  onUpgrade,
  isUpgrading,
  queueLength,
  meta,
}) => {
  const queueIsFull = queueLength >= MAX_BUILD_QUEUE_LENGTH;
  const showResourceWarning = !canAfford;

  let buttonLabel = 'Ausbauen';
  if (isUpgrading) {
    buttonLabel = 'Weiter ausbauen';
  }
  if (queueIsFull) {
    buttonLabel = `Warteschlange voll (${MAX_BUILD_QUEUE_LENGTH})`;
  }

  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-yellow-800/30 bg-black/50 p-5 shadow-lg backdrop-blur">
      <header className="mb-3 border-b border-yellow-800/30 pb-3">
        <h3 className="text-[clamp(1.2rem,1vw+1rem,1.6rem)] font-cinzel font-semibold text-yellow-300">{name}</h3>
        <p className="mt-1 text-sm text-gray-300">
          Stufe {level}
          {isUpgrading && targetLevel > level && (
            <span className="text-emerald-300"> → {targetLevel}</span>
          )}
        </p>
      </header>
      <div className="flex-1 space-y-3">
        <p className="text-sm leading-relaxed text-gray-300">{description}</p>
        {meta}
      </div>
      <footer className="mt-4 space-y-3 text-center">
        <div>
          <p className="text-sm font-cinzel text-gray-200">Kosten für Stufe {targetLevel + 1}</p>
          <CostDisplay cost={upgradeCost} />
          <p className="text-xs text-gray-400">Bauzeit: {formatTime(buildTime)}</p>
          {showResourceWarning && (
            <p className="text-xs text-red-300">Nicht genug Ressourcen verfügbar.</p>
          )}
        </div>
        <button
          type="button"
          onClick={onUpgrade}
          disabled={queueIsFull}
          className={`w-full rounded-md px-4 py-2 font-cinzel text-sm uppercase tracking-wide transition-colors ${
            queueIsFull
              ? 'cursor-not-allowed bg-gray-700 text-gray-400'
              : 'steampunk-button'
          }`}
        >
          {buttonLabel}
        </button>
      </footer>
    </article>
  );
};

export default GameCard;
