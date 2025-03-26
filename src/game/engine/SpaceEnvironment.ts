import { RAPIER } from '@dimforge/rapier3d-compat';
import {
  SpaceEnvironment,
  SpaceSector,
  Vector3D,
  UniverseBoundary,
  CollisionGroup,
  GameObject,
  CelestialObject,
  SpaceHazard,
} from '@/types/space';

export class SpaceEnvironmentManager {
  private environment: SpaceEnvironment;
  private physicsWorld: RAPIER.World;
  private sectorSize: number = 25000;
  private boundaryCollider: RAPIER.Collider;

  constructor(physicsWorld: RAPIER.World) {
    this.physicsWorld = physicsWorld;
    this.environment = {
      boundary: {
        radius: 100000,
        damageRate: 10,
        pushForce: 50
      },
      sectors: new Map(),
      activeHazards: [],
      activeCelestialObjects: []
    };

    this.initializeBoundary();
    this.initializeSectors();
  }

  private initializeBoundary() {
    // Create spherical boundary using Rapier
    const boundaryDesc = RAPIER.ColliderDesc.ball(this.environment.boundary.radius)
      .setCollisionGroups(CollisionGroup.BOUNDARY)
      .setSensor(true);
    
    this.boundaryCollider = this.physicsWorld.createCollider(boundaryDesc);
  }

  private initializeSectors() {
    // Create 64 sectors in a spherical arrangement
    for (let i = 0; i < 64; i++) {
      const sector = this.createSector(i);
      this.environment.sectors.set(sector.id, sector);
    }
  }

  private createSector(index: number): SpaceSector {
    // Calculate position in spherical coordinates
    const phi = Math.acos(-1 + (2 * (index % 8)) / 8);
    const theta = Math.PI * 2 * (Math.floor(index / 8) / 8);

    const position: Vector3D = {
      x: this.sectorSize * Math.sin(phi) * Math.cos(theta),
      y: this.sectorSize * Math.sin(phi) * Math.sin(theta),
      z: this.sectorSize * Math.cos(phi)
    };

    return {
      id: `sector-${index}`,
      position,
      size: this.sectorSize,
      hazards: [],
      celestialObjects: [],
      activeObjects: []
    };
  }

  public update(deltaTime: number) {
    this.updateHazards(deltaTime);
    this.updateCelestialObjects(deltaTime);
    this.checkBoundaryCollisions();
  }

  private updateHazards(deltaTime: number) {
    this.environment.activeHazards = this.environment.activeHazards.filter(hazard => {
      if (hazard.duration) {
        hazard.duration -= deltaTime;
        return hazard.duration > 0;
      }
      return true;
    });
  }

  private updateCelestialObjects(deltaTime: number) {
    this.environment.activeCelestialObjects.forEach(object => {
      if (object.rotationSpeed) {
        // Update rotation
        const rotation = object.rotationSpeed * deltaTime;
        // Apply rotation to object's transform
      }
    });
  }

  private checkBoundaryCollisions() {
    // Use Rapier's intersection test to check for objects outside boundary
    this.physicsWorld.intersectionsWith(this.boundaryCollider, (otherCollider) => {
      const object = otherCollider.parent();
      if (object) {
        this.applyBoundaryForces(object);
      }
    });
  }

  private applyBoundaryForces(object: RAPIER.RigidBody) {
    const position = object.translation();
    const distance = Math.sqrt(
      position.x * position.x +
      position.y * position.y +
      position.z * position.z
    );

    if (distance > this.environment.boundary.radius) {
      // Calculate and apply push-back force
      const force = {
        x: -position.x / distance * this.environment.boundary.pushForce,
        y: -position.y / distance * this.environment.boundary.pushForce,
        z: -position.z / distance * this.environment.boundary.pushForce
      };
      
      object.applyImpulse(force, true);
    }
  }

  public getActiveSector(position: Vector3D): SpaceSector | undefined {
    // Find the nearest sector to the given position
    let nearestSector: SpaceSector | undefined;
    let minDistance = Infinity;

    this.environment.sectors.forEach(sector => {
      const distance = this.calculateDistance(position, sector.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestSector = sector;
      }
    });

    return nearestSector;
  }

  private calculateDistance(pos1: Vector3D, pos2: Vector3D): number {
    return Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) +
      Math.pow(pos2.y - pos1.y, 2) +
      Math.pow(pos2.z - pos1.z, 2)
    );
  }

  public addHazard(hazard: SpaceHazard) {
    this.environment.activeHazards.push(hazard);
  }

  public addCelestialObject(object: CelestialObject) {
    this.environment.activeCelestialObjects.push(object);
  }

  public getEnvironment(): SpaceEnvironment {
    return this.environment;
  }
} 