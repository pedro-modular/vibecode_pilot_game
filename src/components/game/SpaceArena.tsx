import { Canvas } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import { SphericalBoundary } from './SphericalBoundary';
import { SpaceBackground } from './SpaceBackground';
import { Spacecraft } from './Spacecraft';
import { CameraController } from './CameraController';
import { useGameStore } from '@/store/gameStore';

export const SpaceArena: React.FC = () => {
  const { isInitialized } = useGameStore();

  return (
    <Canvas>
      <Suspense fallback={null}>
        <Physics debug={process.env.NODE_ENV === 'development'}>
          {/* Space environment */}
          <SpaceBackground />
          <Stars 
            radius={90000} 
            depth={50} 
            count={5000} 
            factor={4} 
            saturation={0} 
          />
          
          {/* Game boundary */}
          <SphericalBoundary 
            radius={100000}
            color={0x00ff00}
            opacity={0.1}
          />

          {/* Player spacecraft */}
          <Spacecraft />

          {/* Camera */}
          <CameraController />

          {/* Lighting */}
          <ambientLight intensity={0.1} />
          <pointLight position={[100, 100, 100]} intensity={0.5} />
          <pointLight position={[-100, -100, -100]} intensity={0.5} />
        </Physics>
      </Suspense>
    </Canvas>
  );
};

export default SpaceArena; 