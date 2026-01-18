
import * as THREE from 'three';
import { FBXLoader } from 'three-stdlib';

export const createPointCloud = () => {
  const gridSize = 70;
  const pointsCount = gridSize * gridSize;
  const scatteredGeometry = new THREE.BufferGeometry();
  const scatteredPositions = new Float32Array(pointsCount * 3);
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const index = (i * gridSize + j) * 3;
      scatteredPositions[index] = (i - gridSize/2) * 0.9;
      scatteredPositions[index + 1] = (j - gridSize/2) * 0.9;
      scatteredPositions[index + 2] = (Math.random() - 0.5) * 20;
    }
  }
  
  scatteredGeometry.setAttribute('position', new THREE.BufferAttribute(scatteredPositions, 3));
  
  const pointsMaterial = new THREE.PointsMaterial({
    color: 0xFEC6A1,
    size: 0.2,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
  });

  const points = new THREE.Points(scatteredGeometry, pointsMaterial);
  return { points, gridSize };
};

// Sculpture model paths
const SCULPTURE_PATHS = [
  '/models/sculpture1.fbx',
  '/models/sculpture2.fbx',
];

// Store loaded model vertices for each sculpture
const cachedModelVertices: Map<number, Float32Array> = new Map();
const loadPromises: Map<number, Promise<Float32Array>> = new Map();

// Load a specific sculpture model
export const loadSculptureModel = async (index: number): Promise<Float32Array> => {
  // Return cached vertices if already loaded
  if (cachedModelVertices.has(index)) {
    return cachedModelVertices.get(index)!;
  }
  
  // If already loading, wait for existing promise
  if (loadPromises.has(index)) {
    return loadPromises.get(index)!;
  }
  
  const path = SCULPTURE_PATHS[index];
  if (!path) {
    throw new Error(`No sculpture at index ${index}`);
  }
  
  const promise = new Promise<Float32Array>((resolve, reject) => {
    const loader = new FBXLoader();
    
    loader.load(
      path,
      (fbx) => {
        const allVertices: number[] = [];
        
        fbx.traverse((child) => {
          if (child instanceof THREE.Mesh && child.geometry) {
            const geometry = child.geometry;
            const positions = geometry.attributes.position;
            
            if (positions) {
              child.updateWorldMatrix(true, false);
              const worldMatrix = child.matrixWorld;
              
              for (let i = 0; i < positions.count; i++) {
                const vertex = new THREE.Vector3(
                  positions.getX(i),
                  positions.getY(i),
                  positions.getZ(i)
                );
                vertex.applyMatrix4(worldMatrix);
                allVertices.push(vertex.x, vertex.y, vertex.z);
              }
            }
          }
        });
        
        const vertices = new Float32Array(allVertices);
        cachedModelVertices.set(index, vertices);
        console.log(`Loaded sculpture ${index + 1} with ${allVertices.length / 3} vertices`);
        resolve(vertices);
      },
      (progress) => {
        if (progress.total > 0) {
          console.log(`Loading sculpture ${index + 1}: ${(progress.loaded / progress.total * 100).toFixed(1)}%`);
        }
      },
      (error) => {
        console.error(`Error loading sculpture ${index + 1}:`, error);
        reject(error);
      }
    );
  });
  
  loadPromises.set(index, promise);
  return promise;
};

// Load all sculptures
export const loadAllSculptures = async (): Promise<Float32Array[]> => {
  const promises = SCULPTURE_PATHS.map((_, index) => loadSculptureModel(index));
  return Promise.all(promises);
};

export const getSculptureCount = () => SCULPTURE_PATHS.length;

// Calculate visible height at camera distance
const getVisibleHeight = () => {
  const fov = 75;
  const cameraZ = 50;
  const fovRad = (fov * Math.PI) / 180;
  return 2 * Math.tan(fovRad / 2) * cameraZ;
};

// Pre-calculate bounding box and scale for a model
const getModelTransform = (modelVertices: Float32Array) => {
  const vertexCount = modelVertices.length / 3;
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  for (let i = 0; i < vertexCount; i++) {
    const x = modelVertices[i * 3];
    const y = modelVertices[i * 3 + 1];
    const z = modelVertices[i * 3 + 2];
    
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const sizeY = maxY - minY;
  
  const visibleHeight = getVisibleHeight();
  const targetHeight = visibleHeight * 0.8;
  const scale = targetHeight / sizeY;
  
  return { centerX, centerY, centerZ, scale };
};

// Generate positions for a specific sculpture
export const generateModelPositions = (
  modelVertices: Float32Array,
  targetCount: number,
  time: number
): Float32Array => {
  const positions = new Float32Array(targetCount * 3);
  const vertexCount = modelVertices.length / 3;
  
  if (vertexCount === 0) {
    return positions;
  }
  
  const { centerX, centerY, centerZ, scale } = getModelTransform(modelVertices);
  
  for (let i = 0; i < targetCount; i++) {
    const sampleIndex = Math.floor((i / targetCount) * vertexCount + time * 0.1) % vertexCount;
    
    let x = modelVertices[sampleIndex * 3];
    let y = modelVertices[sampleIndex * 3 + 1];
    let z = modelVertices[sampleIndex * 3 + 2];
    
    x = (x - centerX) * scale;
    y = (y - centerY) * scale;
    z = (z - centerZ) * scale;
    
    const noiseScale = 0.15;
    x += Math.sin(time * 0.5 + i * 0.1) * noiseScale;
    y += Math.cos(time * 0.5 + i * 0.15) * noiseScale;
    z += Math.sin(time * 0.7 + i * 0.12) * noiseScale;
    
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  
  return positions;
};

// Generate scattered/exploded positions for transition
export const generateScatteredPositions = (
  fromPositions: Float32Array,
  targetCount: number,
  explosionProgress: number, // 0 to 1, how exploded
  time: number
): Float32Array => {
  const positions = new Float32Array(targetCount * 3);
  
  for (let i = 0; i < targetCount; i++) {
    const idx = i * 3;
    
    // Get base position
    const baseX = fromPositions[idx] || 0;
    const baseY = fromPositions[idx + 1] || 0;
    const baseZ = fromPositions[idx + 2] || 0;
    
    // Calculate explosion direction (outward from center with some randomness)
    const angle1 = (i * 0.618033988749895) * Math.PI * 2; // Golden ratio for even distribution
    const angle2 = (i * 0.414213562373095) * Math.PI; // Another irrational for variation
    
    const explosionRadius = 40 * explosionProgress;
    const spiralFactor = Math.sin(time * 2 + i * 0.05) * 0.3;
    
    const explodeX = Math.cos(angle1) * Math.sin(angle2) * explosionRadius;
    const explodeY = Math.cos(angle2) * explosionRadius * 0.8;
    const explodeZ = Math.sin(angle1) * Math.sin(angle2) * explosionRadius;
    
    // Add swirl effect during explosion
    const swirlX = Math.sin(time * 3 + i * 0.02) * explosionProgress * 5;
    const swirlZ = Math.cos(time * 3 + i * 0.02) * explosionProgress * 5;
    
    // Blend between base position and exploded position
    positions[idx] = baseX + explodeX + swirlX + spiralFactor * 3;
    positions[idx + 1] = baseY + explodeY;
    positions[idx + 2] = baseZ + explodeZ + swirlZ + spiralFactor * 3;
  }
  
  return positions;
};

// Interpolate between two position arrays
export const interpolatePositions = (
  from: Float32Array,
  to: Float32Array,
  progress: number,
  targetCount: number
): Float32Array => {
  const positions = new Float32Array(targetCount * 3);
  
  for (let i = 0; i < targetCount * 3; i++) {
    const fromVal = from[i] || 0;
    const toVal = to[i] || 0;
    
    // Ease in-out cubic for smooth transition
    const t = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    positions[i] = fromVal + (toVal - fromVal) * t;
  }
  
  return positions;
};

// Legacy fallback - teardrop shape
export const generateTeardropPositions = (gridSize: number) => {
  const positions = new Float32Array(gridSize * gridSize * 3);
  const time = Date.now() * 0.001;
  
  const outerPoints = Math.floor(gridSize * 0.7);
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const index = (i * gridSize + j) * 3;
      const u = (i / gridSize) * Math.PI * 2;
      const v = j / gridSize;
      
      const heightParam = v;
      
      let baseRadius;
      if (heightParam < 0.15) {
        baseRadius = Math.sin(heightParam / 0.15 * Math.PI / 2) * 8;
      } else if (heightParam < 0.5) {
        const bulgeParam = (heightParam - 0.15) / 0.35;
        baseRadius = 8 + Math.sin(bulgeParam * Math.PI) * 6;
      } else {
        const taperParam = (heightParam - 0.5) / 0.5;
        baseRadius = 14 * Math.pow(1 - taperParam, 1.5);
      }
      
      const isInnerSurface = i >= outerPoints;
      const hollowStart = 0.25;
      const hollowEnd = 0.8;
      
      let radius = baseRadius;
      
      if (isInnerSurface && heightParam > hollowStart && heightParam < hollowEnd) {
        const hollowV = (heightParam - hollowStart) / (hollowEnd - hollowStart);
        const hollowDepth = Math.sin(hollowV * Math.PI) * 0.6;
        radius = baseRadius * (1 - hollowDepth * 0.7);
      } else if (!isInnerSurface) {
        radius = baseRadius;
      } else {
        radius = baseRadius * 0.95;
      }
      
      const organicNoise = Math.sin(u * 4 + heightParam * 6 + time * 0.5) * 0.4 +
                          Math.sin(u * 7 - heightParam * 3) * 0.2;
      radius += organicNoise;
      
      const x = radius * Math.cos(u);
      const y = (heightParam - 0.5) * 35;
      const z = radius * Math.sin(u);
      
      positions[index] = x;
      positions[index + 1] = y;
      positions[index + 2] = z;
    }
  }
  
  return positions;
};
