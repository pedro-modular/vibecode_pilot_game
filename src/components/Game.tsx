import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { HUD } from './HUD';

export default function Game() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const shipRef = useRef<THREE.Group | null>(null);
  const [speed, setSpeed] = useState(0);

  // Game state
  const gameState = useRef({
    speed: 0,
    maxSpeed: 2,
    acceleration: 0.05,
    rotationSpeed: 0.03,
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    controls: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
    }
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x000000);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    cameraRef.current = camera;
    camera.position.set(0, 5, 10);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create spaceship
    const ship = new THREE.Group();
    shipRef.current = ship;
    ship.position.set(0, 0, 0);

    // Ship body
    const bodyGeometry = new THREE.ConeGeometry(1, 4, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x444444,
      emissive: 0x222222,
      shininess: 30
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    ship.add(body);

    // Ship wings
    const wingGeometry = new THREE.BoxGeometry(4, 0.2, 1);
    const wingMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x666666,
      emissive: 0x222222,
      shininess: 30
    });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.y = -0.5;
    ship.add(wings);

    // Add engine glow
    const engineGlow = new THREE.PointLight(0x00ffff, 2, 3);
    engineGlow.position.z = 2;
    ship.add(engineGlow);

    scene.add(ship);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const starVertices = [];
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starVertices, 3)
    );

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Handle keyboard controls
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault(); // Prevent default browser actions
      switch (event.code) {
        case 'KeyW': gameState.current.controls.forward = true; break;
        case 'KeyS': gameState.current.controls.backward = true; break;
        case 'KeyA': gameState.current.controls.left = true; break;
        case 'KeyD': gameState.current.controls.right = true; break;
        case 'Space': gameState.current.controls.up = true; break;
        case 'ShiftLeft':
        case 'ShiftRight': 
          gameState.current.controls.down = true; 
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW': gameState.current.controls.forward = false; break;
        case 'KeyS': gameState.current.controls.backward = false; break;
        case 'KeyA': gameState.current.controls.left = false; break;
        case 'KeyD': gameState.current.controls.right = false; break;
        case 'Space': gameState.current.controls.up = false; break;
        case 'ShiftLeft':
        case 'ShiftRight':
          gameState.current.controls.down = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Animation loop
    let lastTime = 0;
    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      if (shipRef.current) {
        const ship = shipRef.current;
        const state = gameState.current;

        // Update speed with smoother acceleration
        if (state.controls.forward) {
          state.speed = Math.min(state.speed + state.acceleration, state.maxSpeed);
        } else if (state.controls.backward) {
          state.speed = Math.max(state.speed - state.acceleration, -state.maxSpeed);
        } else {
          state.speed *= 0.98; // Gradual slowdown
        }

        setSpeed(state.speed);

        // Calculate movement direction based on ship's rotation
        const moveDirection = new THREE.Vector3(0, 0, -1);
        moveDirection.applyEuler(ship.rotation);
        moveDirection.multiplyScalar(state.speed);

        // Update ship position
        ship.position.add(moveDirection);

        // Handle rotation
        if (state.controls.left) {
          ship.rotation.y += state.rotationSpeed;
        }
        if (state.controls.right) {
          ship.rotation.y -= state.rotationSpeed;
        }

        // Handle vertical movement
        const upVector = new THREE.Vector3(0, 1, 0);
        if (state.controls.up) {
          ship.position.add(upVector.multiplyScalar(state.rotationSpeed * 2));
        }
        if (state.controls.down) {
          ship.position.sub(upVector.multiplyScalar(state.rotationSpeed * 2));
        }

        // Update camera position to follow ship
        if (cameraRef.current) {
          const camera = cameraRef.current;
          
          // Calculate camera position behind the ship
          const cameraOffset = new THREE.Vector3(0, 3, 15);
          const cameraPosition = ship.position.clone();
          
          // Apply ship's rotation to camera offset
          cameraOffset.applyEuler(ship.rotation);
          cameraPosition.add(cameraOffset);
          
          // Smooth camera movement
          camera.position.lerp(cameraPosition, 0.1);
          
          // Look at ship with slight offset for better view
          const lookAtPos = ship.position.clone();
          lookAtPos.y += 1; // Look slightly above the ship
          camera.lookAt(lookAtPos);
        }
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate(0);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <HUD speed={speed} />
    </>
  );
} 