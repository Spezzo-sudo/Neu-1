
import { Building, MissionType, PlanetBiome, Research, ResourceType, Resources, ShipBlueprint } from './types';

/**
 * Starting resource amounts granted to every player at account creation.
 */
export const INITIAL_RESOURCES: Resources = {
  [ResourceType.Orichalkum]: 500,
  [ResourceType.Fokuskristalle]: 500,
  [ResourceType.Vitriol]: 100,
};

/**
 * Storage capacities for the initial colony warehouses.
 */
export const INITIAL_STORAGE: Resources = {
  [ResourceType.Orichalkum]: 10000,
  [ResourceType.Fokuskristalle]: 10000,
  [ResourceType.Vitriol]: 5000,
};

/**
 * Definitions of all constructible buildings with their economy parameters.
 */
export const BUILDINGS: Record<string, Building> = {
  /**
   * Die Orichalkum-Schmelze ersetzt die frühere Mine. Sie verarbeitet Erze zu Orichalkum, dem primären
   * Baumaterial für Gebäude und Schiffe.
   */
  orichalkumSchmelze: {
    id: 'orichalkumSchmelze',
    name: 'Orichalkum-Schmelze',
    description: 'Schmilzt Erze zu Orichalkum, dem primären Baumaterial für Gebäude und Schiffe.',
    baseCost: { [ResourceType.Orichalkum]: 60, [ResourceType.Fokuskristalle]: 15, [ResourceType.Vitriol]: 0 },
    costMultiplier: 1.5,
    baseProduction: { [ResourceType.Orichalkum]: 20, [ResourceType.Fokuskristalle]: 0, [ResourceType.Vitriol]: 0 },
    productionMultiplier: 1.12,
    baseEnergyConsumption: 10,
    energyConsumptionMultiplier: 1.1,
  },
  /**
   * Der Kristallkondensator ersetzt den Fokuskristall-Synthesizer. Er kondensiert Fokuskristalle für fortschrittliche
   * Elektronik und Forschung.
   */
  kristallKondensator: {
    id: 'kristallKondensator',
    name: 'Kristallkondensator',
    description: 'Kondensiert Fokuskristalle, die für fortschrittliche Elektronik und Forschung benötigt werden.',
    baseCost: { [ResourceType.Orichalkum]: 48, [ResourceType.Fokuskristalle]: 24, [ResourceType.Vitriol]: 0 },
    costMultiplier: 1.6,
    baseProduction: { [ResourceType.Orichalkum]: 0, [ResourceType.Fokuskristalle]: 10, [ResourceType.Vitriol]: 0 },
    productionMultiplier: 1.13,
    baseEnergyConsumption: 12,
    energyConsumptionMultiplier: 1.1,
  },
  /**
   * Die Vitriol-Destille ersetzt den Vitriol-Harvester. Sie destilliert Vitriolgas, den Treibstoff für Flotten
   * und schwere Maschinen.
   */
  vitriolDestille: {
    id: 'vitriolDestille',
    name: 'Vitriol-Destille',
    description: 'Destilliert Vitriolgas, den Treibstoff für Flotten und schwere Maschinen.',
    baseCost: { [ResourceType.Orichalkum]: 225, [ResourceType.Fokuskristalle]: 75, [ResourceType.Vitriol]: 0 },
    costMultiplier: 1.5,
    baseProduction: { [ResourceType.Orichalkum]: 0, [ResourceType.Fokuskristalle]: 0, [ResourceType.Vitriol]: 5 },
    productionMultiplier: 1.14,
    baseEnergyConsumption: 20,
    energyConsumptionMultiplier: 1.1,
  },
  /**
   * Das Dampfkraftwerk ersetzt den Kesseldruck-Regulator. Es erzeugt die notwendige Energie (Kesseldruck in bar)
   * für den Betrieb aller Anlagen auf dem Planeten.
   */
  dampfkraftwerk: {
    id: 'dampfkraftwerk',
    name: 'Dampfkraftwerk',
    description: 'Erzeugt den notwendigen Kesseldruck (Energie) in bar für den Betrieb aller Anlagen auf dem Planeten.',
    baseCost: { [ResourceType.Orichalkum]: 75, [ResourceType.Fokuskristalle]: 30, [ResourceType.Vitriol]: 0 },
    costMultiplier: 1.7,
    // Energiegebäude produzieren keine Ressourcen; stattdessen liefern sie Energie über baseEnergySupply.
    baseProduction: { [ResourceType.Orichalkum]: 0, [ResourceType.Fokuskristalle]: 0, [ResourceType.Vitriol]: 0 },
    productionMultiplier: 1.1,
    baseEnergySupply: 30,
    energySupplyMultiplier: 1.12,
  },
};

/**
 * Definitions of all research topics available in the MVP build.
 */
export const RESEARCH: Record<string, Research> = {
  aetherdynamik: {
    id: 'aetherdynamik',
    name: 'Ätherdynamik',
    description: 'Verbessert die Effizienz von Antrieben und steigert die Fluggeschwindigkeit aller Schiffe.',
    baseCost: { [ResourceType.Orichalkum]: 200, [ResourceType.Fokuskristalle]: 400, [ResourceType.Vitriol]: 100 },
    costMultiplier: 2,
  },
  panzerungstechnik: {
    id: 'panzerungstechnik',
    name: 'Panzerungstechnik',
    description: 'Verstärkt die Hüllen von Schiffen und Verteidigungsanlagen.',
    baseCost: { [ResourceType.Orichalkum]: 800, [ResourceType.Fokuskristalle]: 200, [ResourceType.Vitriol]: 0 },
    costMultiplier: 2,
  },
  spionagetechnologie: {
    id: 'spionagetechnologie',
    name: 'Spionagetechnologie',
    description: 'Ermöglicht den Bau von Spionagesonden und verbessert die Informationsgewinnung.',
    baseCost: { [ResourceType.Orichalkum]: 200, [ResourceType.Fokuskristalle]: 1000, [ResourceType.Vitriol]: 200 },
    costMultiplier: 2,
  },

  // Zusätzliche Forschungstechologien für die Steampunk-Welt
  kesseldruckOptimierung: {
    id: 'kesseldruckOptimierung',
    name: 'Kesseldruck-Optimierung',
    description: 'Steigert die Effizienz der Energieerzeugung und verringert den Energieverbrauch aller Gebäude.',
    baseCost: { [ResourceType.Orichalkum]: 200, [ResourceType.Fokuskristalle]: 200, [ResourceType.Vitriol]: 50 },
    costMultiplier: 2,
  },
  lichtbogenIngenieurwesen: {
    id: 'lichtbogenIngenieurwesen',
    name: 'Lichtbogen-Ingenieurwesen',
    description: 'Ermöglicht fortschrittliche Lichtbogenwaffen und Energieübertragung.',
    baseCost: { [ResourceType.Orichalkum]: 400, [ResourceType.Fokuskristalle]: 200, [ResourceType.Vitriol]: 100 },
    costMultiplier: 2,
  },
  teslaSpulenForschung: {
    id: 'teslaSpulenForschung',
    name: 'Tesla-Spulen-Forschung',
    description: 'Erforscht Hochspannungs-Tesla-Spulen zur Verteidigung.',
    baseCost: { [ResourceType.Orichalkum]: 800, [ResourceType.Fokuskristalle]: 600, [ResourceType.Vitriol]: 200 },
    costMultiplier: 2.5,
  },
  aetherraumTheorie: {
    id: 'aetherraumTheorie',
    name: 'Ätherraum-Theorie',
    description: 'Legt die Grundlagen für Reisen durch den Äther und interstellare Navigation.',
    baseCost: { [ResourceType.Orichalkum]: 1200, [ResourceType.Fokuskristalle]: 1200, [ResourceType.Vitriol]: 500 },
    costMultiplier: 2.5,
  },
  observatoriumsnetz: {
    id: 'observatoriumsnetz',
    name: 'Observatoriumsnetz',
    description: 'Verbessert die Spionage- und Scanreichweite durch ein Netz von Observatorien.',
    baseCost: { [ResourceType.Orichalkum]: 500, [ResourceType.Fokuskristalle]: 1000, [ResourceType.Vitriol]: 200 },
    costMultiplier: 2,
  },
  differenzmaschinenKalkuel: {
    id: 'differenzmaschinenKalkuel',
    name: 'Differenzmaschinen-Kalkül',
    description: 'Erhöht die Rechenleistung durch mechanische Differentialmaschinen für komplexe Berechnungen.',
    baseCost: { [ResourceType.Orichalkum]: 150, [ResourceType.Fokuskristalle]: 300, [ResourceType.Vitriol]: 50 },
    costMultiplier: 2,
  },
  pulverProjektilkunde: {
    id: 'pulverProjektilkunde',
    name: 'Pulver- & Projektilkunde',
    description: 'Verbessert die ballistischen Waffen und deren Munition.',
    baseCost: { [ResourceType.Orichalkum]: 300, [ResourceType.Fokuskristalle]: 100, [ResourceType.Vitriol]: 200 },
    costMultiplier: 2,
  },
  magnetfeldBarrieren: {
    id: 'magnetfeldBarrieren',
    name: 'Magnetfeldbarrieren',
    description: 'Stärkt Schilde durch magnetische Barrieren und Feldgeneratoren.',
    baseCost: { [ResourceType.Orichalkum]: 500, [ResourceType.Fokuskristalle]: 250, [ResourceType.Vitriol]: 250 },
    costMultiplier: 2.2,
  },
  rumpfverstaerkungsLegierungen: {
    id: 'rumpfverstaerkungsLegierungen',
    name: 'Rumpfverstärkungslegierungen',
    description: 'Entwickelt widerstandsfähigere Legierungen für Schiffsrümpfe.',
    baseCost: { [ResourceType.Orichalkum]: 400, [ResourceType.Fokuskristalle]: 200, [ResourceType.Vitriol]: 50 },
    costMultiplier: 2,
  },
  kolbenAntrieb: {
    id: 'kolbenAntrieb',
    name: 'Kolbenantrieb',
    description: 'Verbrennungstriebwerk; erhöht die Reisefähigkeit einfacher Schiffe.',
    baseCost: { [ResourceType.Orichalkum]: 300, [ResourceType.Fokuskristalle]: 300, [ResourceType.Vitriol]: 50 },
    costMultiplier: 2,
  },
  dampfjet: {
    id: 'dampfjet',
    name: 'Dampfjet',
    description: 'Impulstriebwerk; steigert die Geschwindigkeit mittels Dampfantrieb.',
    baseCost: { [ResourceType.Orichalkum]: 500, [ResourceType.Fokuskristalle]: 500, [ResourceType.Vitriol]: 100 },
    costMultiplier: 2,
  },
  aethermotor: {
    id: 'aethermotor',
    name: 'Äthermotor',
    description: 'Hyperantrieb basierend auf Ätherenergie.',
    baseCost: { [ResourceType.Orichalkum]: 1600, [ResourceType.Fokuskristalle]: 800, [ResourceType.Vitriol]: 300 },
    costMultiplier: 2.5,
  },
  aetherplasmaEntladungen: {
    id: 'aetherplasmaEntladungen',
    name: 'Ätherplasma-Entladungen',
    description: 'Plasmatechnologie; erforscht energiegeladene Ätherplasma-Geschosse.',
    baseCost: { [ResourceType.Orichalkum]: 2000, [ResourceType.Fokuskristalle]: 2000, [ResourceType.Vitriol]: 600 },
    costMultiplier: 3,
  },
  aethernetzVerbund: {
    id: 'aethernetzVerbund',
    name: 'Äthernetz-Verbund',
    description: 'Intergalaktisches Forschungsnetzwerk; ermöglicht den Wissensaustausch zwischen Kolonien.',
    baseCost: { [ResourceType.Orichalkum]: 4000, [ResourceType.Fokuskristalle]: 3000, [ResourceType.Vitriol]: 1500 },
    costMultiplier: 2.8,
  },
  himmelsmechanik: {
    id: 'himmelsmechanik',
    name: 'Himmelsmechanik',
    description: 'Astrophysik; verbessert die Kapazität, Planeten zu kolonisieren und zu berechnen.',
    baseCost: { [ResourceType.Orichalkum]: 2500, [ResourceType.Fokuskristalle]: 1500, [ResourceType.Vitriol]: 500 },
    costMultiplier: 2.2,
  },
  aethergravimetrie: {
    id: 'aethergravimetrie',
    name: 'Äthergravimetrie',
    description: 'Erforscht Gravitation im Äther; Grundlage für Gravitonforschung.',
    baseCost: { [ResourceType.Orichalkum]: 10000, [ResourceType.Fokuskristalle]: 2000, [ResourceType.Vitriol]: 5000 },
    costMultiplier: 2.5,
  },
};

/**
 * Duration of a simulation tick in milliseconds.
 */
export const TICK_INTERVAL = 1000; // 1 second

/**
 * Global server speed modifier applied to production and build times.
 */
export const SERVER_SPEED = 1;

/**
 * Default starting levels for all buildings on a new colony.
 */
export const INITIAL_BUILDING_LEVELS: Record<string, number> = {
  orichalkumSchmelze: 1,
  kristallKondensator: 1,
  vitriolDestille: 0,
  dampfkraftwerk: 1,
};

/**
 * Default starting levels for all unlocked research topics.
 */
export const INITIAL_RESEARCH_LEVELS: Record<string, number> = {};

/**
 * Maximum number of entries allowed in the build queue simultaneously.
 */
export const MAX_BUILD_QUEUE_LENGTH = 3;

/**
 * Visual theme tokens for alle Planetenbiome inklusive Label und Farbcodes für die Hex-Map.
 */
export const BIOME_STYLES: Record<PlanetBiome, { label: string; fill: string; stroke: string }> = {
  [PlanetBiome.Messingwueste]: {
    label: 'Messingwüste',
    fill: '#b8860b',
    stroke: '#f0d68a',
  },
  [PlanetBiome.Aethermoor]: {
    label: 'Äthermoor',
    fill: '#3a7f8c',
    stroke: '#8be0f2',
  },
  [PlanetBiome.Dampfarchipel]: {
    label: 'Dampfarchipel',
    fill: '#6c4f3d',
    stroke: '#d4b08c',
  },
  [PlanetBiome.Uhrwerksteppe]: {
    label: 'Uhrwerksteppe',
    fill: '#44663b',
    stroke: '#a5e267',
  },
  [PlanetBiome.Glimmerkluft]: {
    label: 'Glimmerkluft',
    fill: '#593f7d',
    stroke: '#c6a4ff',
  },
};

/**
 * Blueprint-Definitionen für Schiffe der Werftansicht.
 */
export const SHIP_BLUEPRINTS: ShipBlueprint[] = [
  {
    id: 'spaeherdrohne',
    name: 'Späherdrohne',
    description: 'Leichte Aufklärungseinheit mit minimalem Crewbedarf.',
    role: 'Aufklärung',
    hangarSlots: 1,
    baseCost: {
      [ResourceType.Orichalkum]: 300,
      [ResourceType.Fokuskristalle]: 120,
      [ResourceType.Vitriol]: 80,
    },
    buildTimeSeconds: 900,
    crew: 2,
    cargo: 50,
  },
  {
    id: 'kohlenfrachter',
    name: 'Kohlenfrachter',
    description: 'Massiver Transporter für Langstreckenmissionen.',
    role: 'Transport',
    hangarSlots: 3,
    baseCost: {
      [ResourceType.Orichalkum]: 1200,
      [ResourceType.Fokuskristalle]: 300,
      [ResourceType.Vitriol]: 600,
    },
    buildTimeSeconds: 3200,
    crew: 30,
    cargo: 4500,
  },
  {
    id: 'sturmfregatte',
    name: 'Sturmfregatte',
    description: 'Bewaffnete Kampffregatte mit ausgewogenem Verbrauch.',
    role: 'Angriff',
    hangarSlots: 4,
    baseCost: {
      [ResourceType.Orichalkum]: 2200,
      [ResourceType.Fokuskristalle]: 800,
      [ResourceType.Vitriol]: 900,
    },
    buildTimeSeconds: 5400,
    crew: 85,
    cargo: 800,
  },
  {
    id: 'aetherträger',
    name: 'Ätherträger',
    description: 'Unterstützungsschiff mit Reparaturdrohnen und großer Crew.',
    role: 'Unterstützung',
    hangarSlots: 5,
    baseCost: {
      [ResourceType.Orichalkum]: 3400,
      [ResourceType.Fokuskristalle]: 1400,
      [ResourceType.Vitriol]: 1200,
    },
    buildTimeSeconds: 7600,
    crew: 160,
    cargo: 1200,
  },
];

/**
 * Preparation window applied before any fleet leaves the hangar, measured in milliseconds.
 */
export const MISSION_PREPARATION_TIME = 5 * 60 * 1000;

/**
 * Lower bound for the travel portion of a mission to avoid near-instant completions.
 */
export const MISSION_MIN_TRAVEL_TIME = 8 * 60 * 1000;

/**
 * Base travel time per traversed hex for each mission type.
 */
export const MISSION_TRAVEL_TIME_PER_HEX: Record<MissionType, number> = {
  [MissionType.Angriff]: 4 * 60 * 1000,
  [MissionType.Transport]: 3 * 60 * 1000,
  [MissionType.Spionage]: 2 * 60 * 1000,
  [MissionType.Stationierung]: 150 * 1000,
  [MissionType.Kolonisierung]: 5 * 60 * 1000,
};
