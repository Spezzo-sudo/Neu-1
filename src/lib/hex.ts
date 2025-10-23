import { AxialCoordinates, GalaxyCoordinates } from '@/types';

const HEX_HEIGHT = Math.sqrt(3);

/**
 * Converts axial coordinates into pixel positions for a pointy-top hex layout.
 */
export const axialToPixel = (axial: AxialCoordinates, size: number) => ({
  x: size * (Math.sqrt(3) * axial.q + (Math.sqrt(3) / 2) * axial.r),
  y: size * ((3 / 2) * axial.r),
});

/**
 * Generates the SVG path command for a hex tile around the given pixel origin.
 */
export const buildHexPath = (x: number, y: number, size: number) => {
  const points = Array.from({ length: 6 }, (_, index) => {
    const angle = Math.PI / 6 + (index * Math.PI) / 3;
    return {
      x: x + size * Math.cos(angle),
      y: y + size * Math.sin(angle),
    };
  });
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ') + ' Z';
};

/**
 * Calculates a bounding box of visible axial coordinates based on scroll and viewport size.
 */
export const computeVisibleAxialBounds = (
  center: AxialCoordinates,
  radius: number,
): { minQ: number; maxQ: number; minR: number; maxR: number } => ({
  minQ: center.q - radius,
  maxQ: center.q + radius,
  minR: center.r - radius,
  maxR: center.r + radius,
});

/**
 * Formats a system coordinate triplet for bookmarks or clipboard sharing.
 */
export const formatSystemCoordinate = (coordinate: GalaxyCoordinates) =>
  `${coordinate.sectorQ},${coordinate.sectorR},${coordinate.sysIndex}`;

/**
 * Parses a coordinate string from the deep-link query parameter.
 */
export const parseSystemCoordinate = (value: string): GalaxyCoordinates | null => {
  const [sectorQ, sectorR, sysIndex] = value.split(',').map((part) => Number.parseInt(part, 10));
  if ([sectorQ, sectorR, sysIndex].some((part) => Number.isNaN(part))) {
    return null;
  }
  const q = sectorQ * 10 + sysIndex;
  const r = sectorR * 10 + sysIndex * -1;
  return {
    sectorQ,
    sectorR,
    sysIndex,
    axial: { q, r },
  };
};

/**
 * Ensures the provided array of systems only includes those inside the bounding box.
 */
export const filterSystemsByBounds = <T extends GalaxyCoordinates>(
  systems: T[],
  bounds: { minQ: number; maxQ: number; minR: number; maxR: number },
) =>
  systems.filter(
    (system) =>
      system.axial.q >= bounds.minQ &&
      system.axial.q <= bounds.maxQ &&
      system.axial.r >= bounds.minR &&
      system.axial.r <= bounds.maxR,
  );

/**
 * Generates an accessible label describing a galaxy coordinate.
 */
export const describeCoordinate = (coordinate: GalaxyCoordinates) =>
  `Sektor ${coordinate.sectorQ}:${coordinate.sectorR}, System ${coordinate.sysIndex}`;

/**
 * Returns an axial coordinate for the given sector and index in a simple deterministic layout.
 */
export const deriveAxialFromIndex = (sectorQ: number, sectorR: number, sysIndex: number): AxialCoordinates => ({
  q: sectorQ * 5 + sysIndex,
  r: sectorR * 5 - sysIndex,
});

/**
 * Calculates the grid distance between two axial coordinates using hex metrics.
 */
export const computeHexDistance = (a: AxialCoordinates, b: AxialCoordinates) => {
  const dq = Math.abs(a.q - b.q);
  const dr = Math.abs(a.r - b.r);
  const ds = Math.abs(-a.q - a.r + b.q + b.r);
  return (dq + dr + ds) / 2;
};

/**
 * Utility to create a coordinate object with derived axial fields for mocks.
 */
export const createGalaxyCoordinate = (
  sectorQ: number,
  sectorR: number,
  sysIndex: number,
): GalaxyCoordinates => ({
  sectorQ,
  sectorR,
  sysIndex,
  axial: deriveAxialFromIndex(sectorQ, sectorR, sysIndex),
});

/**
 * Approximates the hex height for a given radius to help define SVG viewport dimensions.
 */
export const getHexHeight = (size: number) => size * HEX_HEIGHT;
