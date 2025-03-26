import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RigidBodyApi } from '@react-three/rapier';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

// Constants from main.js, adapted for space
const MAX_PITCH = Math.PI / 3; // 60 degrees
const MAX_YAW = Math.PI / 3;   // 60 degrees
const MAX_SPEED = 50;          // Increased for space
const ACCELERATION = 0.2;      // Adjusted for space physics
const ROTATION_SPEED = 0.05;   // From main.js

interface Controls {
  throttle: number;
  pitch: number;
  roll: number;
  yaw: number;
}

export const Spacecraft: React.FC = () => {
  const rigidBody = useRef<RigidBodyApi>(null);
  const controls = useRef<Controls>({
    throttle: 0,
    pitch: 0,
    roll: 0,
    yaw: 0
  });
  const speed = useRef(0);
  const { updatePlayerPosition } = useGameStore();

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch(event.key) {
        case 'w': controls.current.throttle = 1; break;
        case 's': controls.current.throttle = -1; break;
        case 'ArrowUp': controls.current.pitch = 1; break;
        case 'ArrowDown': controls.current.pitch = -1; break;
        case 'ArrowLeft': controls.current.roll = 1; break;
        case 'ArrowRight': controls.current.roll = -1; break;
        case 'a': controls.current.yaw = 1; break;
        case 'd': controls.current.yaw = -1; break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch(event.key) {
        case 'w':
        case 's': controls.current.throttle = 0; break;
        case 'ArrowUp':
        case 'ArrowDown': controls.current.pitch = 0; break;
        case 'ArrowLeft':
        case 'ArrowRight': controls.current.roll = 0; break;
        case 'a':
        case 'd': controls.current.yaw = 0; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!rigidBody.current) return;

    // Update speed (with inertia)
    speed.current += controls.current.throttle * ACCELERATION;
    speed.current = THREE.MathUtils.clamp(speed.current, 0, MAX_SPEED);

    // Get current rotation
    const rotation = rigidBody.current.rotation();
    const euler = new THREE.Euler().setFromQuaternion(rotation);

    // Update rotation with limits
    euler.x = THREE.MathUtils.clamp(
      euler.x - controls.current.pitch * ROTATION_SPEED,
      -MAX_PITCH,
      MAX_PITCH
    );
    euler.y += controls.current.roll * ROTATION_SPEED;
    euler.z = THREE.MathUtils.clamp(
      euler.z + controls.current.yaw * ROTATION_SPEED,
      -MAX_YAW,
      MAX_YAW
    );

    // Apply rotation
    rigidBody.current.setRotation(new THREE.Quaternion().setFromEuler(euler));

    // Calculate movement direction
    const direction = new THREE.Vector3(0, 0, -1)
      .applyEuler(euler)
      .multiplyScalar(speed.current * delta);

    // Apply movement
    const currentVel = rigidBody.current.linvel();
    rigidBody.current.setLinvel({
      x: currentVel.x + direction.x,
      y: currentVel.y + direction.y,
      z: currentVel.z + direction.z,
    });

    // Update position in store
    const position = rigidBody.current.translation();
    updatePlayerPosition({ x: position.x, y: position.y, z: position.z });
  });

  return (
    <RigidBody ref={rigidBody} colliders="hull">
      <group>
        {/* Main body */}
        <mesh castShadow>
          <boxGeometry args={[4, 1, 2]} />
          <meshPhongMaterial color={0x808080} />
        </mesh>

        {/* Wings */}
        <mesh castShadow position={[0, 0.2, 0]}>
          <boxGeometry args={[8, 0.2, 1.5]} />
          <meshPhongMaterial color={0x404040} />
        </mesh>

        {/* Tail */}
        <mesh castShadow position={[0, 0.5, -1]}>
          <boxGeometry args={[1.5, 1, 0.2]} />
          <meshPhongMaterial color={0x808080} />
        </mesh>

        {/* Stabilizers */}
        <mesh castShadow position={[0, 0.5, -1]}>
          <boxGeometry args={[2, 0.2, 0.5]} />
          <meshPhongMaterial color={0x404040} />
        </mesh>
      </group>
    </RigidBody>
  );
}; 