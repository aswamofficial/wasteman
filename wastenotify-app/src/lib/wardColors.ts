/**
 * Colours for the boundary layers.
 *
 * 300 wards across two corporations, 20 zones and 37 districts is far more than
 * any hand-picked palette covers, so hues are spaced by the golden angle
 * (137.5°). Consecutive numbers — which are usually geographic neighbours —
 * land far apart on the colour wheel, so adjacent polygons contrast instead of
 * blending into one another.
 *
 * Saturation and lightness are held in a narrow band so no area reads as more
 * important than another, and every fill stays light enough for the dark report
 * pins and road labels on top to remain legible.
 */

const GOLDEN_ANGLE = 137.508;

/**
 * Ward numbers restart at 1 in every corporation, so hue is offset per town.
 * Without this, Chennai's Ward 7 and Coimbatore's Ward 7 would be the same
 * colour — which reads as "the same thing" on a map showing both.
 */
const TOWN_OFFSET: Record<string, number> = {
  Coimbatore: 0,
  Chennai: 47,
};

export function wardHue(wardNo: number, town?: string): number {
  const offset = town ? (TOWN_OFFSET[town] ?? 0) : 0;
  return (wardNo * GOLDEN_ANGLE + offset) % 360;
}

export function wardFill(wardNo: number, town?: string): string {
  return `hsl(${wardHue(wardNo, town).toFixed(1)}, 62%, 62%)`;
}

export function wardStroke(wardNo: number, town?: string): string {
  // Same hue, darker — an outline that reads as "the same ward", not a border
  // between two unrelated things.
  return `hsl(${wardHue(wardNo, town).toFixed(1)}, 55%, 38%)`;
}

/**
 * Zones are a real administrative grouping, so they get stable colours.
 *
 * Coimbatore's five compass zones keep their brand colours. Chennai's fifteen
 * are named after places rather than directions and there is no meaningful
 * ordering between them, so they're spread evenly around the wheel by index —
 * derived from the list below, which is the published zone order (I–XV).
 */
const CHENNAI_ZONES = [
  'Thiruvottiyur',
  'Manali',
  'Madhavaram',
  'Tondiarpet',
  'Royapuram',
  'Thiru-Vi-Ka-Nagar',
  'Ambattur',
  'Annanagar',
  'Teynampet',
  'Kodambakkam',
  'Valasaravakkam',
  'Alandur',
  'Adyar',
  'Perungudi',
  'Sozhinganallur',
];

export const ZONE_COLORS: Record<string, string> = {
  'North Zone': '#1A73E8',
  'South Zone': '#34A853',
  'East Zone': '#F59E0B',
  'West Zone': '#5B6ADA',
  'Central Zone': '#00897B',
  ...Object.fromEntries(
    CHENNAI_ZONES.map((zone, i) => [
      zone,
      `hsl(${((i * 360) / CHENNAI_ZONES.length + 18).toFixed(1)}, 58%, 58%)`,
    ]),
  ),
};

export function zoneFill(zone: string | null): string {
  return (zone && ZONE_COLORS[zone]) || '#8A99AE';
}

/** Every zone that has a colour, in the order the legend should list them. */
export const ZONE_LEGEND: { town: string; zones: string[] }[] = [
  {
    town: 'Coimbatore',
    zones: ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'],
  },
  { town: 'Chennai', zones: CHENNAI_ZONES },
];

/**
 * Districts are a separate layer drawn under the wards, so they use the same
 * golden-angle spacing keyed on the name — stable across reloads without
 * needing a stored colour, and independent of ward hues since the two layers
 * are never the same shade of "selected".
 */
export function districtHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 100000;
  }
  return (hash * GOLDEN_ANGLE) % 360;
}

export function districtFill(name: string): string {
  return `hsl(${districtHue(name).toFixed(1)}, 45%, 55%)`;
}

export function districtStroke(name: string): string {
  return `hsl(${districtHue(name).toFixed(1)}, 40%, 34%)`;
}

export type WardColorMode = 'ward' | 'zone';
