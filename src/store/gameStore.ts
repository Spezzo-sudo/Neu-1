import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  ResourceType,
  Resources,
  Storage,
  View,
  Building,
  Research,
  BuildQueueItem,
} from '@/types';
import {
  INITIAL_RESOURCES,
  INITIAL_STORAGE,
  BUILDINGS,
  RESEARCH,
  SERVER_SPEED,
  INITIAL_BUILDING_LEVELS,
  INITIAL_RESEARCH_LEVELS,
  MAX_BUILD_QUEUE_LENGTH,
} from '@/constants';
import { calculateKesseldruck, calculateResourceProductionPerTick } from '@/lib/economy';
import {
  calculateBuildDuration,
  calculateUpgradeCost,
  determineNextTargetLevel,
  findMissingResources,
  formatMissingResourceSummary,
} from '@/lib/progression';
import { computeQueueSlotTiming, hasQueueCapacity, partitionBuildQueue } from '@/lib/buildQueue';
import { ToastVariant, useUiStore } from '@/store/uiStore';

interface GameState {
  resources: Resources;
  storage: Storage;
  kesseldruck: {
    capacity: number;
    consumption: number;
    net: number;
    efficiency: number;
  };
  buildings: Record<string, number>;
  research: Record<string, number>;
  activeView: View;
  buildQueue: BuildQueueItem[];
}

interface GameActions {
  setView: (view: View) => void;
  gameTick: () => void;
  canAfford: (cost: Resources) => boolean;
  getUpgradeCost: (entity: Building | Research, targetLevel: number) => Resources;
  getBuildTime: (cost: Resources) => number;
  startUpgrade: (entity: Building | Research) => void;
  spendResources: (cost: Resources) => boolean;
  refundResources: (refund: Resources) => void;
}

const RESOURCE_TYPES = Object.values(ResourceType) as ResourceType[];

const createInitialKesseldruck = () => calculateKesseldruck(INITIAL_BUILDING_LEVELS);

const clampResourcesToStorage = (resources: Resources, storage: Storage) => {
  const clamped: Resources = { ...resources };
  RESOURCE_TYPES.forEach((resource) => {
    const capacity = storage[resource] ?? 0;
    clamped[resource] = Math.min(capacity, clamped[resource] ?? 0);
  });
  return clamped;
};

interface ToastPayload {
  title: string;
  description: string;
  variant: ToastVariant;
}

/**
 * Central Zustand store that manages the client-side simulation and progression state.
 */
export const useGameStore = create<GameState & GameActions>()(
  persist(
    immer((set, get) => ({
    resources: { ...INITIAL_RESOURCES },
    storage: { ...INITIAL_STORAGE },
    kesseldruck: { ...createInitialKesseldruck() },
    buildings: { ...INITIAL_BUILDING_LEVELS },
    research: { ...INITIAL_RESEARCH_LEVELS },
    activeView: View.Uebersicht,
    buildQueue: [],

    setView: (view) => set({ activeView: view }),

    canAfford: (cost) => {
      const { resources } = get();
      return (
        resources[ResourceType.Orichalkum] >= cost[ResourceType.Orichalkum] &&
        resources[ResourceType.Fokuskristalle] >= cost[ResourceType.Fokuskristalle] &&
        resources[ResourceType.Vitriol] >= cost[ResourceType.Vitriol]
      );
    },

    getUpgradeCost: (entity, targetLevel) => calculateUpgradeCost(entity, targetLevel),

    getBuildTime: (cost) => calculateBuildDuration(cost, SERVER_SPEED),

    startUpgrade: (entity) => {
      const toasts: ToastPayload[] = [];
      set((state) => {
        const isBuilding = 'baseProduction' in entity || entity.id === 'dampfkraftwerk';
        const currentLevel = isBuilding ? state.buildings[entity.id] || 0 : state.research[entity.id] || 0;

        const nextLevel = determineNextTargetLevel(state.buildQueue, entity.id, currentLevel);
        const cost = get().getUpgradeCost(entity, nextLevel);
        const queueHasCapacity = hasQueueCapacity(state.buildQueue, MAX_BUILD_QUEUE_LENGTH);

        if (!get().canAfford(cost)) {
          const missingResources = findMissingResources(state.resources, cost);
          toasts.push({
            title: 'Ressourcen fehlen',
            description: `Es fehlen ${formatMissingResourceSummary(missingResources)}.`,
            variant: ToastVariant.Warning,
          });
          return;
        }

        if (!queueHasCapacity) {
          toasts.push({
            title: 'Warteschlange voll',
            description: `Maximal ${MAX_BUILD_QUEUE_LENGTH} Aufträge erlaubt.`,
            variant: ToastVariant.Warning,
          });
          return;
        }

        state.resources[ResourceType.Orichalkum] -= cost[ResourceType.Orichalkum];
        state.resources[ResourceType.Fokuskristalle] -= cost[ResourceType.Fokuskristalle];
        state.resources[ResourceType.Vitriol] -= cost[ResourceType.Vitriol];

        const buildTime = get().getBuildTime(cost);
        const now = Date.now();
        const { startTime, endTime } = computeQueueSlotTiming(state.buildQueue, buildTime, now);

        state.buildQueue.push({ entityId: entity.id, level: nextLevel, startTime, endTime });

        toasts.push({
          title: 'Bauauftrag gestartet',
          description: `${entity.name} erreicht Stufe ${nextLevel}.`,
          variant: ToastVariant.Success,
        });
      });
      const { pushToast } = useUiStore.getState();
      toasts.forEach((toast) => pushToast(toast));
    },

    spendResources: (cost) => {
      if (!get().canAfford(cost)) {
        return false;
      }
      set((state) => {
        RESOURCE_TYPES.forEach((resource) => {
          state.resources[resource] -= cost[resource];
        });
      });
      return true;
    },

    refundResources: (refund) => {
      set((state) => {
        RESOURCE_TYPES.forEach((resource) => {
          const capacity = state.storage[resource];
          state.resources[resource] = Math.min(capacity, state.resources[resource] + refund[resource]);
        });
      });
    },

    gameTick: () => {
      const completionToasts: ToastPayload[] = [];
      set((state) => {
        const now = Date.now();
        const { completed, pending } = partitionBuildQueue(state.buildQueue, now);

        if (completed.length > 0) {
          completed.forEach((item) => {
            const entity = BUILDINGS[item.entityId] || RESEARCH[item.entityId];
            if (!entity) {
              console.error(`Could not find entity with ID: ${item.entityId} in build queue.`);
              return;
            }
            const isBuilding = 'baseProduction' in entity || entity.id === 'dampfkraftwerk';
            if (isBuilding) {
              state.buildings[item.entityId] = item.level;
            } else {
              state.research[item.entityId] = item.level;
            }
            completionToasts.push({
              title: 'Auftrag abgeschlossen',
              description: `${entity.name} ist nun Stufe ${item.level}.`,
              variant: ToastVariant.Info,
            });
          });
          state.buildQueue = pending;
        }

        const kesseldruckState = calculateKesseldruck(state.buildings);
        state.kesseldruck.capacity = kesseldruckState.capacity;
        state.kesseldruck.consumption = kesseldruckState.consumption;
        state.kesseldruck.net = kesseldruckState.net;
        state.kesseldruck.efficiency = kesseldruckState.efficiency;

        const income = calculateResourceProductionPerTick(state.buildings, SERVER_SPEED, kesseldruckState.efficiency);

        RESOURCE_TYPES.forEach((resource) => {
          const nextAmount = state.resources[resource] + income[resource];
          state.resources[resource] = Math.min(state.storage[resource], nextAmount);
        });
      });
      if (completionToasts.length > 0) {
        const { pushToast } = useUiStore.getState();
        completionToasts.forEach((toast) => pushToast(toast));
      }
    },
  })),
    {
      name: 'steam-war-raiders-game',
      version: 1,
      storage:
        typeof window === 'undefined' ? undefined : createJSONStorage(() => window.localStorage),
      partialize: (state) => ({
        resources: state.resources,
        storage: state.storage,
        buildings: state.buildings,
        research: state.research,
        buildQueue: state.buildQueue,
      }),
      merge: (persistedState, currentState) => {
        if (!persistedState) {
          return currentState;
        }
        const persisted = persistedState as Partial<GameState>;
        return {
          ...currentState,
          resources: { ...currentState.resources, ...(persisted.resources ?? {}) },
          storage: { ...currentState.storage, ...(persisted.storage ?? {}) },
          buildings: { ...currentState.buildings, ...(persisted.buildings ?? {}) },
          research: { ...currentState.research, ...(persisted.research ?? {}) },
          buildQueue: persisted.buildQueue ?? currentState.buildQueue,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Game store hydration failed', error);
          return;
        }
        if (!state) {
          return;
        }
        const kesseldruckState = calculateKesseldruck(state.buildings);
        const clampedResources = clampResourcesToStorage(state.resources, state.storage);
        useGameStore.setState({
          kesseldruck: { ...kesseldruckState },
          resources: clampedResources,
        });
      },
    },
  ),
);
