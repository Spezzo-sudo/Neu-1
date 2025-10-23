import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { MISSION_PREPARATION_TIME } from '@/constants';
import { buildMissionReturnSchedule, buildMissionSchedule, getMissionTypeLabel } from '@/lib/missions';
import { computeHexDistance, formatSystemCoordinate } from '@/lib/hex';
import { Mission, MissionStatus, MissionType } from '@/types';
import { ToastVariant, useUiStore } from '@/store/uiStore';
import { useDirectoryStore } from '@/store/directoryStore';

interface MissionState {
  missions: Mission[];
  originPlanetId: string;
  originSystemId: string;
}

interface PlanMissionPayload {
  targetPlanetId: string;
  missionType: MissionType;
}

interface MissionActions {
  planMission: (payload: PlanMissionPayload) => void;
  setOriginPlanet: (planetId: string) => void;
  advanceMissions: (timestamp: number) => void;
  cancelMission: (missionId: string) => void;
  recallMission: (missionId: string) => void;
}

const resolvePlanet = (planetId: string) => {
  const directory = useDirectoryStore.getState();
  const planet = directory.getPlanetById(planetId);
  if (!planet) {
    return null;
  }
  const system = directory.getSystemById(planet.systemId);
  if (!system) {
    return null;
  }
  return { planet, system };
};

const deriveInitialOrigin = () => {
  const directory = useDirectoryStore.getState();
  for (const system of directory.systems) {
    for (const planet of system.planets) {
      if (planet.ownerId === directory.currentPlayerId) {
        return { planetId: planet.id, systemId: system.id };
      }
    }
  }
  const fallbackSystem = directory.systems[0];
  const fallbackPlanet = fallbackSystem?.planets[0];
  if (fallbackSystem && fallbackPlanet) {
    return { planetId: fallbackPlanet.id, systemId: fallbackSystem.id };
  }
  return { planetId: '', systemId: '' };
};

const initialOrigin = deriveInitialOrigin();

/**
 * Zustand store that tracks client-side mission planning and resolves fleet travel timelines.
 */
export const useMissionStore = create<MissionState & MissionActions>()(
  immer((set, get) => ({
    missions: [],
    originPlanetId: initialOrigin.planetId,
    originSystemId: initialOrigin.systemId,

    planMission: ({ targetPlanetId, missionType }) => {
      const directory = useDirectoryStore.getState();
      const originContext = resolvePlanet(get().originPlanetId);
      const targetContext = resolvePlanet(targetPlanetId);
      if (!originContext || !targetContext) {
        const { pushToast } = useUiStore.getState();
        pushToast({
          title: 'Mission konnte nicht geplant werden',
          description: 'Quelle oder Zielplanet konnten nicht ermittelt werden.',
          variant: ToastVariant.Warning,
        });
        return;
      }

      const distance = computeHexDistance(originContext.system.axial, targetContext.system.axial);
      const { plannedAt, launchAt, arrivalAt, travelDuration } = buildMissionSchedule(
        missionType,
        distance,
        Date.now(),
      );

      const mission: Mission = {
        id: `mission-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: missionType,
        commanderId: directory.currentPlayerId,
        origin: {
          systemId: originContext.system.id,
          planetId: originContext.planet.id,
          slot: originContext.planet.slot,
          planetName: originContext.planet.name,
          ownerId: originContext.planet.ownerId,
          allianceId: originContext.planet.allianceId,
        },
        target: {
          systemId: targetContext.system.id,
          planetId: targetContext.planet.id,
          slot: targetContext.planet.slot,
          planetName: targetContext.planet.name,
          ownerId: targetContext.planet.ownerId,
          allianceId: targetContext.planet.allianceId,
        },
        status: MissionStatus.Geplant,
        plannedAt,
        launchAt,
        arrivalAt,
        travelDuration,
      };

      set((state) => {
        state.missions.unshift(mission);
      });

      const coordinate = formatSystemCoordinate(targetContext.system);
      const { pushToast } = useUiStore.getState();
      const preparationMinutes = Math.round(MISSION_PREPARATION_TIME / 60000);
      pushToast({
        title: `${getMissionTypeLabel(missionType)} vorbereitet`,
        description: `Start in ${preparationMinutes} Min. zu ${coordinate}:${targetContext.planet.slot}`,
        variant: ToastVariant.Info,
      });
    },

    setOriginPlanet: (planetId) => {
      const context = resolvePlanet(planetId);
      if (!context) {
        return;
      }
      set({ originPlanetId: planetId, originSystemId: context.system.id });
    },

    cancelMission: (missionId) => {
      const { pushToast } = useUiStore.getState();
      set((state) => {
        const mission = state.missions.find((entry) => entry.id === missionId);
        if (!mission || mission.status !== MissionStatus.Geplant) {
          return;
        }
        mission.status = MissionStatus.Abgebrochen;
        mission.cancelledAt = Date.now();
      });
      const mission = get().missions.find((entry) => entry.id === missionId);
      if (mission) {
        pushToast({
          title: `${getMissionTypeLabel(mission.type)} abgebrochen`,
          description: 'Die Flotte verbleibt im Hangar.',
          variant: ToastVariant.Warning,
        });
      }
    },

    recallMission: (missionId) => {
      const { pushToast } = useUiStore.getState();
      set((state) => {
        const mission = state.missions.find((entry) => entry.id === missionId);
        if (!mission || mission.status !== MissionStatus.Unterwegs) {
          return;
        }
        const { returnArrivalAt } = buildMissionReturnSchedule(mission, Date.now());
        mission.status = MissionStatus.Rueckkehr;
        mission.recalledAt = Date.now();
        mission.returnArrivalAt = returnArrivalAt;
      });
      const mission = get().missions.find((entry) => entry.id === missionId);
      if (mission && mission.status === MissionStatus.Rueckkehr) {
        const originSystem = resolvePlanet(mission.origin.planetId)?.system;
        const coordinate = originSystem ? formatSystemCoordinate(originSystem) : mission.origin.systemId;
        pushToast({
          title: `${getMissionTypeLabel(mission.type)} zurückgerufen`,
          description: `Ankunft in ${Math.round(((mission.returnArrivalAt ?? Date.now()) - Date.now()) / 60000)} Min. bei ${coordinate}:${mission.origin.slot}`,
          variant: ToastVariant.Info,
        });
      }
    },

    advanceMissions: (timestamp) => {
      const directory = useDirectoryStore.getState();
      const { pushToast } = useUiStore.getState();
      const currentAllianceId = directory.players.find((player) => player.id === directory.currentPlayerId)?.allianceId;
      const completed: Mission[] = [];

      set((state) => {
        state.missions.forEach((mission) => {
          const previousStatus = mission.status;
          let captured = false;
          if (mission.status === MissionStatus.Geplant && timestamp >= mission.launchAt) {
            mission.status = MissionStatus.Unterwegs;
          }
          if (mission.status === MissionStatus.Unterwegs && timestamp >= mission.arrivalAt) {
            mission.status = MissionStatus.Abgeschlossen;
            if (mission.type === MissionType.Angriff || mission.type === MissionType.Kolonisierung) {
              mission.target.ownerId = directory.currentPlayerId;
              mission.target.allianceId = currentAllianceId;
              captured = true;
            }
          }
          if (
            mission.status === MissionStatus.Rueckkehr &&
            mission.returnArrivalAt !== undefined &&
            timestamp >= mission.returnArrivalAt
          ) {
            mission.status = MissionStatus.Abgeschlossen;
          }
          if (previousStatus !== mission.status) {
            const targetSystem = resolvePlanet(mission.target.planetId)?.system;
            const coordinate = targetSystem ? formatSystemCoordinate(targetSystem) : mission.target.systemId;
            const label = getMissionTypeLabel(mission.type);
            if (mission.status === MissionStatus.Unterwegs) {
              pushToast({
                title: `${label} gestartet`,
                description: `Flotte unterwegs nach ${coordinate}:${mission.target.slot}`,
                variant: ToastVariant.Info,
              });
            }
            if (mission.status === MissionStatus.Abgeschlossen) {
              const returning = mission.returnArrivalAt !== undefined && mission.recalledAt !== undefined;
              pushToast({
                title: returning ? `${label} zurück im Hangar` : `${label} abgeschlossen`,
                description: returning
                  ? 'Die Flotte hat den Rückflug beendet.'
                  : `${mission.target.planetName} erreicht.`,
                variant: returning ? ToastVariant.Info : ToastVariant.Success,
              });
              if (!returning && captured) {
                completed.push({ ...mission });
              }
            }
          }
        });
      });

      if (completed.length > 0 && directory.setPlanetOwner) {
        completed.forEach((mission) => {
          if (mission.type === MissionType.Angriff || mission.type === MissionType.Kolonisierung) {
            directory.setPlanetOwner(mission.target.planetId, directory.currentPlayerId, currentAllianceId);
          }
        });
      }
    },
  })),
);
