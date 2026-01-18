
import * as THREE from 'three';

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
      scatteredPositions[index + 2] = (Math.random() - 0.5) * 20; // Reduced from 50 to 20 for less depth
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

export const generateTeardropPositions = (gridSize: number) => {
  const positions = new Float32Array(gridSize * gridSize * 3);
  const time = Date.now() * 0.001;
  
  // Split points between outer surface and inner hollow surface
  const outerPoints = Math.floor(gridSize * 0.7);
  const innerPoints = gridSize - outerPoints;
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const index = (i * gridSize + j) * 3;
      const u = (i / gridSize) * Math.PI * 2;  // Around (0 to 2π)
      const v = j / gridSize;                   // Up (0 to 1)
      
      // Teardrop profile: wide at bottom, pointed at top
      // Using a combination of sine and power functions for the shape
      const heightParam = v;
      
      // Main teardrop profile - wide at bottom (v=0.3), tapers to point at top (v=1)
      let baseRadius;
      if (heightParam < 0.15) {
        // Bottom tip - rounded
        baseRadius = Math.sin(heightParam / 0.15 * Math.PI / 2) * 8;
      } else if (heightParam < 0.5) {
        // Lower bulge - widest part
        const bulgeParam = (heightParam - 0.15) / 0.35;
        baseRadius = 8 + Math.sin(bulgeParam * Math.PI) * 6;
      } else {
        // Upper taper to point
        const taperParam = (heightParam - 0.5) / 0.5;
        baseRadius = 14 * Math.pow(1 - taperParam, 1.5);
      }
      
      // Determine if this point is on outer or inner surface
      const isInnerSurface = i >= outerPoints;
      
      // Define hollow region (elliptical void in the middle)
      const hollowStart = 0.25;
      const hollowEnd = 0.8;
      
      let radius = baseRadius;
      
      if (isInnerSurface && heightParam > hollowStart && heightParam < hollowEnd) {
        // Inner surface of the hollow
        const hollowV = (heightParam - hollowStart) / (hollowEnd - hollowStart);
        const hollowDepth = Math.sin(hollowV * Math.PI) * 0.6; // How deep the hollow goes
        radius = baseRadius * (1 - hollowDepth * 0.7);
      } else if (!isInnerSurface) {
        // Outer surface - keep as is
        radius = baseRadius;
      } else {
        // Inner points outside hollow region - place on outer surface with slight offset
        radius = baseRadius * 0.95;
      }
      
      // Add subtle organic variation for natural look
      const organicNoise = Math.sin(u * 4 + heightParam * 6 + time * 0.5) * 0.4 +
                          Math.sin(u * 7 - heightParam * 3) * 0.2;
      radius += organicNoise;
      
      // Convert to 3D coordinates
      const x = radius * Math.cos(u);
      const y = (heightParam - 0.5) * 35;  // Centered vertically, scaled height
      const z = radius * Math.sin(u);
      
      positions[index] = x;
      positions[index + 1] = y;
      positions[index + 2] = z;
    }
  }
  
  return positions;
};
