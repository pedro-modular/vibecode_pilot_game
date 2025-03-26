import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { random } from 'three/src/math/MathUtils';

interface SpaceBackgroundProps {
  count?: number;
  radius?: number;
}

export const SpaceBackground: React.FC<SpaceBackgroundProps> = ({
  count = 5000,
  radius = 100000
}) => {
  const points = useRef<THREE.Points>(null);
  
  // Generate random star positions
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // Random spherical distribution
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * Math.cbrt(Math.random()); // Cube root for uniform volume distribution
    
    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);
    
    // Random star colors (mostly white/blue with some variation)
    colors[i3] = THREE.MathUtils.randFloat(0.8, 1.0);     // R
    colors[i3 + 1] = THREE.MathUtils.randFloat(0.8, 1.0); // G
    colors[i3 + 2] = THREE.MathUtils.randFloat(0.9, 1.0); // B (slightly more blue)
  }

  useFrame((state) => {
    if (points.current) {
      // Subtle rotation of the entire starfield
      points.current.rotation.y = state.clock.getElapsedTime() * 0.02;
      points.current.rotation.z = state.clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <Points
      ref={points}
      positions={positions}
      colors={colors}
      stride={3}
    >
      <PointMaterial
        transparent
        vertexColors
        size={150}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

export default SpaceBackground; 