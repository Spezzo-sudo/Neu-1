import { describe, expect, it } from 'vitest';
import {
  calculateBuildDuration,
  calculateUpgradeCost,
  determineNextTargetLevel,
  findMissingResources,
  formatMissingResourceSummary,
} from '@/lib/progression';
import { Building, BuildQueueItem, ResourceType, Resources } from '@/types';

const mockBuilding: Building = {
  id: 'testwerk',
  name: 'Testwerk',
  description: 'Erzeugt Testressourcen.',
  baseCost: {
    [ResourceType.Orichalkum]: 100,
    [ResourceType.Fokuskristalle]: 50,
    [ResourceType.Vitriol]: 25,
  },
  costMultiplier: 1.5,
  baseProduction: {
    [ResourceType.Orichalkum]: 0,
    [ResourceType.Fokuskristalle]: 0,
    [ResourceType.Vitriol]: 0,
  },
};

const createResources = (values: Partial<Resources>): Resources => ({
  [ResourceType.Orichalkum]: 0,
  [ResourceType.Fokuskristalle]: 0,
  [ResourceType.Vitriol]: 0,
  ...values,
});

describe('determineNextTargetLevel', () => {
  it('returns the next level when nothing is queued', () => {
    const queue: BuildQueueItem[] = [];
    expect(determineNextTargetLevel(queue, mockBuilding.id, 3)).toBe(4);
  });

  it('respects queued upgrades and stacks levels sequentially', () => {
    const queue: BuildQueueItem[] = [
      { entityId: mockBuilding.id, level: 4, startTime: 0, endTime: 5 },
      { entityId: mockBuilding.id, level: 5, startTime: 5, endTime: 10 },
    ];
    expect(determineNextTargetLevel(queue, mockBuilding.id, 3)).toBe(6);
  });
});

describe('calculateUpgradeCost', () => {
  it('scales the cost with the configured multiplier', () => {
    const cost = calculateUpgradeCost(mockBuilding, 3);
    expect(cost[ResourceType.Orichalkum]).toBe(225);
    expect(cost[ResourceType.Fokuskristalle]).toBe(112);
    expect(cost[ResourceType.Vitriol]).toBe(56);
  });
});

describe('calculateBuildDuration', () => {
  it('uses weighted resource values and enforces a minimum duration', () => {
    const cost = createResources({
      [ResourceType.Orichalkum]: 20,
      [ResourceType.Fokuskristalle]: 10,
      [ResourceType.Vitriol]: 5,
    });
    expect(calculateBuildDuration(cost, 2)).toBe(5);
  });

  it('accelerates with higher server speed values', () => {
    const cost = createResources({
      [ResourceType.Orichalkum]: 1000,
      [ResourceType.Fokuskristalle]: 500,
      [ResourceType.Vitriol]: 100,
    });
    expect(calculateBuildDuration(cost, 4)).toBe(57);
  });
});

describe('findMissingResources', () => {
  it('returns the deficits compared to the available stock', () => {
    const available = createResources({
      [ResourceType.Orichalkum]: 80,
      [ResourceType.Fokuskristalle]: 20,
      [ResourceType.Vitriol]: 90,
    });
    const cost = createResources({
      [ResourceType.Orichalkum]: 100,
      [ResourceType.Fokuskristalle]: 50,
      [ResourceType.Vitriol]: 60,
    });

    const missing = findMissingResources(available, cost);
    expect(missing).toEqual([
      { type: ResourceType.Orichalkum, amount: 20 },
      { type: ResourceType.Fokuskristalle, amount: 30 },
    ]);
  });
});

describe('formatMissingResourceSummary', () => {
  it('produces a localized comma-separated list', () => {
    const summary = formatMissingResourceSummary([
      { type: ResourceType.Orichalkum, amount: 1200 },
      { type: ResourceType.Fokuskristalle, amount: 30 },
    ]);
    expect(summary).toBe('Orichalkum: 1.200, Fokuskristalle: 30');
  });
});
