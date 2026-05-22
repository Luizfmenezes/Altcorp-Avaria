/**
 * Damage heat-zone data for the 3D vehicle models.
 * Kept free of three.js imports so it can be bundled with the lightweight
 * modal shell — the heavy WebGL component (Bus3D) is loaded on demand.
 *
 * Area `code` values match the backend / VehicleSilhouette.
 */
export type Vehicle3DType = "bus" | "car";

export interface HeatArea3D {
  code: string;
  label: string;
  /** Center of the damage sphere, just outside the body surface. */
  pos: [number, number, number];
}

// Bus body occupies roughly X[-3.2,3.2] Y[-1.25,1.25] Z[-1.2,1.2].
export const BUS_AREAS_3D: HeatArea3D[] = [
  { code: "roof",             label: "Teto",                        pos: [0, 1.55, 0] },
  { code: "windshield",       label: "Para-brisa",                  pos: [3.42, 0.42, 0] },
  { code: "front_bumper",     label: "Para-choque dianteiro",       pos: [3.42, -0.78, 0] },
  { code: "rear_bumper",      label: "Para-choque traseiro",        pos: [-3.42, -0.7, 0] },
  { code: "left_side_front",  label: "Lateral dianteira esquerda",  pos: [1.55, 0.05, 1.4] },
  { code: "left_side_rear",   label: "Lateral traseira esquerda",   pos: [-1.55, 0.05, 1.4] },
  { code: "right_side_front", label: "Lateral dianteira direita",   pos: [1.55, 0.05, -1.4] },
  { code: "right_side_rear",  label: "Lateral traseira direita",    pos: [-1.55, 0.05, -1.4] },
];

// Car body occupies roughly X[-2.4,2.4] Y[-0.7,0.7] Z[-1.0,1.0].
export const CAR_AREAS_3D: HeatArea3D[] = [
  { code: "roof",             label: "Teto",                        pos: [-0.15, 1.0, 0] },
  { code: "windshield",       label: "Para-brisa",                  pos: [0.95, 0.7, 0] },
  { code: "front_bumper",     label: "Para-choque dianteiro",       pos: [2.5, -0.35, 0] },
  { code: "rear_bumper",      label: "Para-choque traseiro",        pos: [-2.5, -0.3, 0] },
  { code: "left_side_front",  label: "Lateral dianteira esquerda",  pos: [0.95, -0.05, 1.12] },
  { code: "left_side_rear",   label: "Lateral traseira esquerda",   pos: [-1.05, -0.05, 1.12] },
  { code: "right_side_front", label: "Lateral dianteira direita",   pos: [0.95, -0.05, -1.12] },
  { code: "right_side_rear",  label: "Lateral traseira direita",    pos: [-1.05, -0.05, -1.12] },
];

export function areas3dFor(type: Vehicle3DType): HeatArea3D[] {
  return type === "car" ? CAR_AREAS_3D : BUS_AREAS_3D;
}

// Kept as an alias for backward compatibility.
export const HEAT_AREAS_3D = BUS_AREAS_3D;

export interface HeatLevel {
  level: 0 | 1 | 2 | 3;
  color: string;
  base: number;
}

export function heat3dIntensity(count: number, max: number): HeatLevel {
  if (count <= 0) return { level: 0, color: "#b9b9b0", base: 0 };
  const r = count / Math.max(1, max);
  if (r > 0.66) return { level: 3, color: "#ff3d2e", base: 0.95 };
  if (r > 0.33) return { level: 2, color: "#ffb020", base: 0.78 };
  return { level: 1, color: "#bce416", base: 0.66 };
}

/** Sphere radius for a damage marker — scales with the damage count. */
export function heat3dRadius(count: number, max: number): number {
  if (count <= 0) return 0.16;
  const r = count / Math.max(1, max);
  return 0.32 + r * 0.6;
}
