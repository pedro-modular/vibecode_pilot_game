import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

export const CameraController: React.FC = () => {
  const { camera } = useThree();
  const { playerPosition } = useGameStore();
  const cameraPosition = useRef(new THREE.Vector3(0, 10, 30));

  useFrame(() => {
    // Camera settings from main.js, adapted for space
    const cameraDistance = 30;
    const cameraHeight = 10;
    const cameraSmoothness = 0.1;

    // Calculate ideal camera position
    const idealPosition = new THREE.Vector3(
      playerPosition.x,
      playerPosition.y + cameraHeight,
      playerPosition.z + cameraDistance
    );

    // Smoothly interpolate camera position
    cameraPosition.current.lerp(idealPosition, cameraSmoothness);
    camera.position.copy(cameraPosition.current);

    // Look at player
    camera.lookAt(
      playerPosition.x,
      playerPosition.y,
      playerPosition.z
    );
  });

  return null;
}; 