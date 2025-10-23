export enum ResourceType {
  Orichalkum = 'Orichalkum',
  Fokuskristalle = 'Fokuskristalle',
  Vitriol = 'Vitriol',
}

export type Resources = Record<ResourceType, number>;
export type Storage = Resources;

export interface Building {
  id: string;
  name: string;
  description: string;
  baseCost: Resources;
  costMultiplier: number;
  baseProduction: Resources;
  productionMultiplier?: number;
  baseEnergyConsumption?: number;
  energyConsumptionMultiplier?: number;
  baseEnergySupply?: number;
  energySupplyMultiplier?: number;
}

export interface Research {
  id: string;
  name: string;
  description: string;
  baseCost: Resources;
  costMultiplier: number;
}

export interface ShipBlueprint {
  id: string;
  name: string;
  description: string;
  role: 'Aufklärung' | 'Transport' | 'Angriff' | 'Unterstützung';
  hangarSlots: number;
  baseCost: Resources;
  buildTimeSeconds: number;
  crew: number;
  cargo: number;
}

export enum View {
  Uebersicht = 'Uebersicht',
  Gebaeude = 'Gebaeude',
  Forschung = 'Forschung',
  Werft = 'Werft',
  Galaxie = 'Galaxie',
  Bande = 'Bande',
}

export interface BuildQueueItem {
  entityId: string;
  level: number;
  startTime: number;
  endTime: number;
}

export enum PlanetBiome {
  Messingwueste = 'Messingwueste',
  Aethermoor = 'Aethermoor',
  Dampfarchipel = 'Dampfarchipel',
  Uhrwerksteppe = 'Uhrwerksteppe',
  Glimmerkluft = 'Glimmerkluft',
}

export interface AxialCoordinates {
  q: number;
  r: number;
}

export interface GalaxyCoordinates {
  sectorQ: number;
  sectorR: number;
  sysIndex: number;
  axial: AxialCoordinates;
}

export interface GalaxyPlanet {
  id: string;
  systemId: string;
  slot: number;
  name: string;
  biome: PlanetBiome;
  ownerId?: string;
  allianceId?: string;
}

export interface GalaxySystem extends GalaxyCoordinates {
  id: string;
  displayName: string;
  planets: GalaxyPlanet[];
}

export interface Player {
  id: string;
  name: string;
  color: string;
  allianceId?: string;
}

export interface PlayerPlanetSummary {
  planetId: string;
  systemId: string;
  slot: number;
  biome: PlanetBiome;
  coordinates: string;
  isFavorite: boolean;
}

export interface PlayerProfile {
  id: string;
  tagline: string;
  lastActiveAt: number;
  allianceId?: string;
  planets: PlayerPlanetSummary[];
}

export interface AllianceRankPermissions {
  invite: boolean;
  remove: boolean;
  editNotes: boolean;
  managePacts: boolean;
}

export interface AllianceRank {
  id: string;
  name: string;
  permissions: AllianceRankPermissions;
}

export interface AlliancePact {
  id: string;
  type: 'nap' | 'ally';
  targetAllianceId: string;
}

export interface Alliance {
  id: string;
  tag: string;
  name: string;
  color: string;
  members: string[];
  ranks: AllianceRank[];
  pacts: AlliancePact[];
  notes: string[];
}

export interface MessageRoom {
  id: string;
  type: 'alliance' | 'direct';
  title: string;
  participantIds: string[];
}

export interface Message {
  id: string;
  roomId: string;
  authorId: string;
  body: string;
  createdAt: number;
}

/**
 * Supported mission archetypes for fleet actions planned in the galaxy view.
 */
export enum MissionType {
  Angriff = 'attack',
  Transport = 'transport',
  Spionage = 'spy',
  Stationierung = 'station',
  Kolonisierung = 'colonize',
}

/**
 * Lifecycle states that every mission transitions through while progressing over time.
 */
export enum MissionStatus {
  Geplant = 'planned',
  Unterwegs = 'enroute',
  Abgeschlossen = 'completed',
  Rueckkehr = 'returning',
  Abgebrochen = 'cancelled',
}

/**
 * Descriptor for a mission waypoint, capturing ownership and slot metadata.
 */
export interface MissionLocation {
  systemId: string;
  planetId: string;
  slot: number;
  planetName: string;
  ownerId?: string;
  allianceId?: string;
}

/**
 * Mission entity tracked on the client to simulate travel and resolution of fleet orders.
 */
export interface Mission {
  id: string;
  type: MissionType;
  commanderId: string;
  origin: MissionLocation;
  target: MissionLocation;
  status: MissionStatus;
  plannedAt: number;
  launchAt: number;
  arrivalAt: number;
  travelDuration: number;
  returnArrivalAt?: number;
  recalledAt?: number;
  cancelledAt?: number;
}

/**
 * Represents a single build contract tracked by the shipyard.
 */
export interface ShipBuildOrder {
  id: string;
  blueprintId: string;
  quantity: number;
  startTime: number;
  endTime: number;
  status: 'queued' | 'building' | 'completed' | 'cancelled';
}

/**
 * Summarises the amount of completed ships per blueprint currently occupying the hangar.
 */
export interface FleetInventoryEntry {
  blueprintId: string;
  quantity: number;
}
