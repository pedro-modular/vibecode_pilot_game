import * as THREE from 'three';

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue
scene.fog = new THREE.Fog(0x87CEEB, 500, 2000); // Increased fog distance

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 50, 100);

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Create terrain
const terrainSize = 1000;
const terrainSegments = 200;
const terrainGeometry = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
const terrainMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x228B22,
    side: THREE.DoubleSide,
    flatShading: true,
    shininess: 0,
    specular: 0x000000,
    wireframe: true // Enable wireframe to see the mesh structure
});

// Improved terrain variation (mountains)
const vertices = terrainGeometry.attributes.position.array;
for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const z = vertices[i + 2];
    // Create more varied mountain peaks using multiple sine waves and noise
    vertices[i + 1] = 
        Math.sin(x/200) * Math.cos(z/200) * 100 +  // Large mountains
        Math.sin(x/100) * Math.cos(z/100) * 50 +    // Medium mountains
        Math.sin(x/50) * Math.cos(z/50) * 25 +      // Small hills
        Math.sin(x/25) * Math.cos(z/25) * 10 +      // Bumps
        Math.sin(x/10) * Math.cos(z/10) * 5 +       // Fine detail
        (Math.random() - 0.5) * 2;                  // Random noise
}
terrainGeometry.computeVertexNormals();

// Create terrain mesh
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;
terrain.position.y = -20; // Move terrain down
terrain.receiveShadow = true;
scene.add(terrain);

// Add a second terrain mesh with solid color for better visibility
const terrainSolid = new THREE.Mesh(
    terrainGeometry.clone(),
    new THREE.MeshPhongMaterial({
        color: 0x228B22,
        side: THREE.DoubleSide,
        flatShading: true,
        shininess: 0,
        specular: 0x000000,
        wireframe: false,
        transparent: true,
        opacity: 0.5
    })
);
terrainSolid.rotation.x = -Math.PI / 2;
terrainSolid.position.y = -19.9; // Slightly above the wireframe
terrainSolid.receiveShadow = true;
scene.add(terrainSolid);

// Create a simple ground plane for better visibility
const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
const groundMaterial = new THREE.MeshPhongMaterial({
    color: 0x1a472a,
    side: THREE.DoubleSide,
    shininess: 0,
    specular: 0x000000
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -20.1;
ground.receiveShadow = true;
scene.add(ground);

// Create plane
const planeBody = new THREE.Group();

// Main body
const bodyGeometry = new THREE.BoxGeometry(4, 1, 2);
const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.castShadow = true;
planeBody.add(body);

// Wings
const wingGeometry = new THREE.BoxGeometry(8, 0.2, 1.5);
const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
const wings = new THREE.Mesh(wingGeometry, wingMaterial);
wings.position.y = 0.2;
wings.castShadow = true;
planeBody.add(wings);

// Tail
const tailGeometry = new THREE.BoxGeometry(1.5, 1, 0.2);
const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
tail.position.z = -1;
tail.position.y = 0.5;
tail.castShadow = true;
planeBody.add(tail);

// Horizontal stabilizers
const stabilizerGeometry = new THREE.BoxGeometry(2, 0.2, 0.5);
const stabilizer = new THREE.Mesh(stabilizerGeometry, wingMaterial);
stabilizer.position.z = -1;
stabilizer.position.y = 0.5;
stabilizer.castShadow = true;
planeBody.add(stabilizer);

scene.add(planeBody);
const plane = planeBody;
plane.position.y = 10;

// Add trees
function createTree(size) {
    const tree = new THREE.Group();
    
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(size/4, size/3, size*2, 8);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x4b3621 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    
    // Tree top (cone)
    const topGeometry = new THREE.ConeGeometry(size*2, size*4, 8);
    const topMaterial = new THREE.MeshPhongMaterial({ color: 0x0f5c0f });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = size*3;
    top.castShadow = true;
    top.receiveShadow = true;
    
    tree.add(trunk);
    tree.add(top);
    return tree;
}

// Improved tree placement function
function getTerrainHeight(x, z) {
    return Math.sin(x/200) * Math.cos(z/200) * 100 +
           Math.sin(x/100) * Math.cos(z/100) * 50 +
           Math.sin(x/50) * Math.cos(z/50) * 25 +
           Math.sin(x/25) * Math.cos(z/25) * 10 +
           Math.sin(x/10) * Math.cos(z/10) * 5;
}

// Add trees randomly across the terrain
for (let i = 0; i < 200; i++) {
    const tree = createTree(2);
    const x = Math.random() * terrainSize - terrainSize/2;
    const z = Math.random() * terrainSize - terrainSize/2;
    const y = getTerrainHeight(x, z);
    tree.position.set(x, y, z);
    scene.add(tree);
}

// Create rings
const ringGeometry = new THREE.TorusGeometry(5, 0.3, 16, 32);
const ringMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });

// Create rings in a more organized pattern
const numRings = 15; // Increased number of rings
const ringSpacing = 40; // Distance between rings
const patternWidth = 100; // Width of the pattern
const patternHeight = 50; // Height variation

for (let i = 0; i < numRings; i++) {
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    
    // Create a zigzag pattern
    const xOffset = Math.sin(i * Math.PI / 2) * patternWidth / 2;
    const yOffset = Math.cos(i * Math.PI / 2) * patternHeight / 2;
    
    ring.position.set(
        xOffset,
        yOffset + 20, // Base height
        -100 - i * ringSpacing // Space rings out in front
    );
    
    // Make rings vertical (rotate 90 degrees around X axis)
    ring.rotation.x = Math.PI / 2;
    ring.castShadow = true;
    scene.add(ring);
}

// Update lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 1000;
directionalLight.shadow.camera.left = -500;
directionalLight.shadow.camera.right = 500;
directionalLight.shadow.camera.top = 500;
directionalLight.shadow.camera.bottom = -500;
scene.add(directionalLight);

// Add hemisphere light for better ambient lighting
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x228B22, 0.3);
scene.add(hemisphereLight);

// Game state
let speed = 0;
let score = 0;
const MAX_PITCH = Math.PI / 4; // Maximum pitch angle (45 degrees)
const MAX_YAW = Math.PI / 6;   // Maximum yaw angle (30 degrees)

// Controls
const controls = {
    throttle: 0,
    pitch: 0,
    roll: 0,
    yaw: 0
};

// Event listeners
window.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'w': controls.throttle = 1; break;
        case 's': controls.throttle = -1; break;
        case 'ArrowUp': controls.pitch = 1; break;
        case 'ArrowDown': controls.pitch = -1; break;
        case 'ArrowLeft': controls.roll = 1; break;
        case 'ArrowRight': controls.roll = -1; break;
        case 'a': controls.yaw = 1; break;
        case 'd': controls.yaw = -1; break;
    }
});

window.addEventListener('keyup', (event) => {
    switch(event.key) {
        case 'w':
        case 's': controls.throttle = 0; break;
        case 'ArrowUp':
        case 'ArrowDown': controls.pitch = 0; break;
        case 'ArrowLeft':
        case 'ArrowRight': controls.roll = 0; break;
        case 'a':
        case 'd': controls.yaw = 0; break;
    }
});

// Update function
function update() {
    // Update speed
    speed += controls.throttle * 0.1;
    speed = Math.max(0, Math.min(20, speed));

    // Update plane position and rotation with limits
    // Pitch (up/down)
    plane.rotation.x -= controls.pitch * 0.05;
    plane.rotation.x = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, plane.rotation.x));

    // Roll (left/right) - no limits for full rotation
    plane.rotation.y += controls.roll * 0.05;

    // Yaw (rudder control)
    plane.rotation.z += controls.yaw * 0.05;
    plane.rotation.z = Math.max(-MAX_YAW, Math.min(MAX_YAW, plane.rotation.z));

    // Calculate movement direction based on plane's rotation
    const moveX = Math.sin(plane.rotation.y) * Math.cos(plane.rotation.z);
    const moveZ = Math.cos(plane.rotation.y) * Math.cos(plane.rotation.z);
    const moveY = Math.sin(plane.rotation.x) * Math.cos(plane.rotation.z);

    // Update position
    plane.position.x -= moveX * speed;
    plane.position.z -= moveZ * speed;
    plane.position.y += moveY * speed;

    // Keep plane within terrain bounds
    const halfSize = terrainSize / 2;
    if (Math.abs(plane.position.x) > halfSize) {
        plane.position.x = halfSize * Math.sign(plane.position.x);
    }
    if (Math.abs(plane.position.z) > halfSize) {
        plane.position.z = halfSize * Math.sign(plane.position.z);
    }

    // Keep plane above terrain
    const terrainHeight = getTerrainHeight(plane.position.x, plane.position.z);
    if (plane.position.y < terrainHeight) {
        plane.position.y = terrainHeight;
    }

    // Update camera to follow plane
    const cameraDistance = 30; // Increased distance
    const cameraHeight = 10;   // Increased height
    const cameraSmoothness = 0.1;
    
    const idealCameraPos = new THREE.Vector3(
        plane.position.x + Math.sin(plane.rotation.y) * cameraDistance,
        plane.position.y + cameraHeight,
        plane.position.z + Math.cos(plane.rotation.y) * cameraDistance
    );
    
    camera.position.lerp(idealCameraPos, cameraSmoothness);
    camera.lookAt(plane.position);

    // Update HUD
    document.getElementById('speed').textContent = Math.round(speed * 10);
    document.getElementById('score').textContent = score;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

animate(); 