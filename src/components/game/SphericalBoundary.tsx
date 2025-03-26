import { useEffect, useMemo } from 'react';
import { Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SphericalBoundaryProps {
  radius: number;
  color: number;
  opacity: number;
}

export const SphericalBoundary: React.FC<SphericalBoundaryProps> = ({
  radius,
  color,
  opacity
}) => {
  const materialRef = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(color) },
        opacity: { value: opacity }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float opacity;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          float pulse = sin(time * 2.0) * 0.5 + 0.5;
          float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 glowColor = color * (fresnel + 0.2) * (pulse * 0.3 + 0.7);
          gl_FragColor = vec4(glowColor, opacity * fresnel);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [color, opacity]);

  useFrame((state) => {
    materialRef.uniforms.time.value = state.clock.getElapsedTime();
  });

  return (
    <Sphere args={[radius, 64, 64]}>
      <primitive object={materialRef} attach="material" />
    </Sphere>
  );
};

export default SphericalBoundary; 