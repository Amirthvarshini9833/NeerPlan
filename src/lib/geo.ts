const EARTH_RADIUS_METRES = 6_371_000;
const SQ_FT_PER_SQ_M = 10.7639104167;

export type GeoPoint = { latitude: number; longitude: number };

/** Equirectangular projection is accurate enough for a small rooftop boundary. */
export function polygonAreaSqFt(points: GeoPoint[]) {
  if (points.length < 3) return 0;
  const origin = points[0];
  const latitudeScale = Math.cos((origin.latitude * Math.PI) / 180);
  const projected = points.map((point) => ({
    x: ((point.longitude - origin.longitude) * Math.PI / 180) * EARTH_RADIUS_METRES * latitudeScale,
    y: ((point.latitude - origin.latitude) * Math.PI / 180) * EARTH_RADIUS_METRES,
  }));
  const areaSqM = Math.abs(projected.reduce((total, point, index) => {
    const next = projected[(index + 1) % projected.length];
    return total + point.x * next.y - next.x * point.y;
  }, 0)) / 2;
  return areaSqM * SQ_FT_PER_SQ_M;
}

function orientation(a: GeoPoint, b: GeoPoint, c: GeoPoint) {
  const value = (b.longitude - a.longitude) * (c.latitude - a.latitude) - (b.latitude - a.latitude) * (c.longitude - a.longitude);
  return Math.abs(value) < 1e-10 ? 0 : value > 0 ? 1 : 2;
}

function onSegment(a: GeoPoint, b: GeoPoint, c: GeoPoint) {
  return Math.min(a.longitude, c.longitude) <= b.longitude && b.longitude <= Math.max(a.longitude, c.longitude) && Math.min(a.latitude, c.latitude) <= b.latitude && b.latitude <= Math.max(a.latitude, c.latitude);
}

function segmentsIntersect(a: GeoPoint, b: GeoPoint, c: GeoPoint, d: GeoPoint) {
  const first = [orientation(a, b, c), orientation(a, b, d), orientation(c, d, a), orientation(c, d, b)];
  if (first[0] !== first[1] && first[2] !== first[3]) return true;
  return (first[0] === 0 && onSegment(a, c, b)) || (first[1] === 0 && onSegment(a, d, b)) || (first[2] === 0 && onSegment(c, a, d)) || (first[3] === 0 && onSegment(c, b, d));
}

export function hasSelfIntersection(points: GeoPoint[]) {
  if (points.length < 4) return false;
  for (let index = 0; index < points.length; index += 1) {
    const next = (index + 1) % points.length;
    for (let other = index + 1; other < points.length; other += 1) {
      const otherNext = (other + 1) % points.length;
      if (index === other || next === other || index === otherNext || next === otherNext) continue;
      if (segmentsIntersect(points[index], points[next], points[other], points[otherNext])) return true;
    }
  }
  return false;
}
