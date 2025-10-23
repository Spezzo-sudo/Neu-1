import { BuildQueueItem, Building, Research, ResourceType, Resources } from '@/types';

/**
 * Represents a single resource deficit used for player feedback.
 */
export interface MissingResourceSummary {
  type: ResourceType;
  amount: number;
}

/**
 * Determines the next target level for an entity by inspecting queued upgrades.
 */
export const determineNextTargetLevel = (
  queue: BuildQueueItem[],
  entityId: string,
  currentLevel: number,
): number => {
  const lastQueuedLevel = queue
    .filter((item) => item.entityId === entityId)
    .reduce((highest, item) => Math.max(highest, item.level), currentLevel);
  return lastQueuedLevel + 1;
};

/**
 * Calculates the resource cost for upgrading a building or research to the desired level.
 */
export const calculateUpgradeCost = (
  entity: Building | Research,
  targetLevel: number,
): Resources => {
  const exponent = Math.max(0, targetLevel - 1);
  const multiplier = Math.pow(entity.costMultiplier, exponent);
  return {
    [ResourceType.Orichalkum]: Math.floor(entity.baseCost[ResourceType.Orichalkum] * multiplier),
    [ResourceType.Fokuskristalle]: Math.floor(entity.baseCost[ResourceType.Fokuskristalle] * multiplier),
    [ResourceType.Vitriol]: Math.floor(entity.baseCost[ResourceType.Vitriol] * multiplier),
  };
};

/**
 * Converts a resource investment into the associated build time, respecting the server speed.
 */
export const calculateBuildDuration = (cost: Resources, serverSpeed: number): number => {
  const weightedCost =
    cost[ResourceType.Orichalkum] +
    cost[ResourceType.Fokuskristalle] * 2 +
    cost[ResourceType.Vitriol] * 3;
  return Math.max(5, Math.floor(weightedCost / 10 / serverSpeed));
};

/**
 * Compares current stock with the upgrade cost and yields the missing amounts per resource.
 */
export const findMissingResources = (
  available: Resources,
  cost: Resources,
): MissingResourceSummary[] =>
  (Object.values(ResourceType) as ResourceType[])
    .map((type) => ({ type, amount: Math.max(0, cost[type] - available[type]) }))
    .filter((entry) => entry.amount > 0);

/**
 * Converts the missing resource list into a localized status string.
 */
export const formatMissingResourceSummary = (
  missing: MissingResourceSummary[],
): string =>
  missing
    .map((entry) => `${entry.type}: ${entry.amount.toLocaleString('de-DE')}`)
    .join(', ');
