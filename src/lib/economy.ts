import { BUILDINGS } from '@/constants';
import { ResourceType, Resources } from '@/types';

/**
 * Represents the derived energy state of the player's colony after aggregating production and consumption.
 */
export interface KesseldruckSnapshot {
  capacity: number;
  consumption: number;
  net: number;
  efficiency: number;
}

/**
 * Creates a fresh resource map with zero values for all resource types.
 */
export const createEmptyResources = (): Resources => ({
  [ResourceType.Orichalkum]: 0,
  [ResourceType.Fokuskristalle]: 0,
  [ResourceType.Vitriol]: 0,
});

/**
 * Aggregates the total kesseldruck supply and demand based on the current building levels.
 */
export const calculateKesseldruck = (
  buildingLevels: Record<string, number>
): KesseldruckSnapshot => {
  let capacity = 0;
  let consumption = 0;

  Object.values(BUILDINGS).forEach((building) => {
    const level = buildingLevels[building.id] || 0;
    if (level <= 0) {
      return;
    }

    if (building.baseEnergySupply) {
      const supplyMultiplier = building.energySupplyMultiplier ?? 1;
      const exponent = Math.max(0, level - 1);
      const supply = building.baseEnergySupply * Math.pow(supplyMultiplier, exponent);
      capacity += Math.floor(supply);
    }

    if (building.baseEnergyConsumption) {
      const consumptionMultiplier = building.energyConsumptionMultiplier ?? 1;
      const exponent = Math.max(0, level - 1);
      const demand = building.baseEnergyConsumption * Math.pow(consumptionMultiplier, exponent);
      consumption += Math.floor(demand);
    }
  });

  const net = capacity - consumption;
  const efficiency = consumption === 0 ? 1 : Math.min(1, capacity / consumption);

  return {
    capacity: Math.floor(capacity),
    consumption: Math.floor(consumption),
    net: Math.floor(net),
    efficiency,
  };
};

/**
 * Calculates the per-tick resource production while respecting the current kesseldruck efficiency.
 */
export const calculateResourceProductionPerTick = (
  buildingLevels: Record<string, number>,
  serverSpeed: number,
  efficiency: number
): Resources => {
  const income = createEmptyResources();

  Object.values(BUILDINGS).forEach((building) => {
    const level = buildingLevels[building.id] || 0;
    if (!level || !building.baseProduction) {
      return;
    }

    const productionMultiplier = building.productionMultiplier ?? 1;
    const exponent = Math.max(0, level - 1);
    const levelFactor = Math.pow(productionMultiplier, exponent);

    Object.values(ResourceType).forEach((resource) => {
      const base = building.baseProduction?.[resource] ?? 0;
      if (base <= 0) {
        return;
      }

      const productionPerHour = base * level * levelFactor;
      const productionPerSecond = (productionPerHour / 3600) * serverSpeed * efficiency;
      income[resource] += productionPerSecond;
    });
  });

  return income;
};
