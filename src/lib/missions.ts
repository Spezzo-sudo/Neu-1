import { MISSION_MIN_TRAVEL_TIME, MISSION_PREPARATION_TIME, MISSION_TRAVEL_TIME_PER_HEX } from '@/constants';
import { MissionType } from '@/types';

/**
 * Human readable labels for the different mission archetypes.
 */
const MISSION_LABELS: Record<MissionType, string> = {
  [MissionType.Angriff]: 'Angriff',
  [MissionType.Transport]: 'Transport',
  [MissionType.Spionage]: 'Spionage',
  [MissionType.Stationierung]: 'Stationierung',
  [MissionType.Kolonisierung]: 'Kolonisierung',
};

/**
 * Returns the localized label for a mission type.
 */
export const getMissionTypeLabel = (type: MissionType) => MISSION_LABELS[type];

/**
 * Calculates the travel duration for a mission based on the traversed hex distance.
 */
export const calculateMissionTravelDuration = (distance: number, type: MissionType) => {
  const perHex = MISSION_TRAVEL_TIME_PER_HEX[type] ?? MISSION_TRAVEL_TIME_PER_HEX[MissionType.Transport];
  const scaled = Math.round(distance * perHex);
  return Math.max(MISSION_MIN_TRAVEL_TIME, scaled);
};

/**
 * Derives mission scheduling timestamps from the mission type and computed distance.
 */
export const buildMissionSchedule = (type: MissionType, distance: number, now: number) => {
  const travelDuration = calculateMissionTravelDuration(distance, type);
  const launchAt = now + MISSION_PREPARATION_TIME;
  return {
    plannedAt: now,
    launchAt,
    arrivalAt: launchAt + travelDuration,
    travelDuration,
  };
};
