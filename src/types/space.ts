export enum GravityField {
  NONE = 0x0000,
  WEAK = 0x0001,
  MEDIUM = 0x0002,
  STRONG = 0x0003,
}

export enum CollisionGroup {
  SPACECRAFT = 0x0001,
  PROJECTILE = 0x0002,
  ASTEROID = 0x0004,
  EFFECT = 0x0008,
  BOUNDARY = 0x0010,
  CELESTIAL = 0x0020,
}

export interface SpaceSector {
  id: string;
  position: Vector3D;
  size: number;
  hazards: SpaceHazard[];
  celestialObjects: CelestialObject[];
  activeObjects: GameObject[];
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface GameObject {
  id: string;
  type: 'spacecraft' | 'projectile' | 'asteroid' | 'effect' | 'celestial';
  position: Vector3D;
  rotation: Vector3D;
  velocity: Vector3D;
  collisionGroup: CollisionGroup;
  isActive: boolean;
}

export interface SpaceHazard {
  type: 'radiation' | 'asteroidField' | 'solarFlare';
  position: Vector3D;
  radius: number;
  intensity: number;
  duration?: number;
}

export interface CelestialObject {
  type: 'star' | 'planet' | 'asteroid';
  position: Vector3D;
  radius: number;
  gravityField: GravityField;
  rotationSpeed?: number;
  texture?: string;
}

export interface UniverseBoundary {
  radius: number;
  damageRate: number;
  pushForce: number;
}

export interface SpaceEnvironment {
  boundary: UniverseBoundary;
  sectors: Map<string, SpaceSector>;
  activeHazards: SpaceHazard[];
  activeCelestialObjects: CelestialObject[];
} 