
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
      scatteredPositions[index + 2] = (Math.random() - 0.5) * 50;
    }
  }
  
  scatteredGeometry.setAttribute('position', new THREE.BufferAttribute(scatteredPositions, 3));
  
  const pointsMaterial = new THREE.PointsMaterial({
    color: 0xFEC6A1, // Changed to soft orange
    size: 0.2,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
  });

  const points = new THREE.Points(scatteredGeometry, pointsMaterial);
  return { points, gridSize };
};

export const generateOrganicPositions = (gridSize: number) => {
  const pointsCount = gridSize * gridSize;
  const positions = new Float32Array(pointsCount * 3);
  const time = Date.now() * 0.001;
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const index = (i * gridSize + j) * 3;
      
      const phi = (i / gridSize) * Math.PI;
      const theta = (j / gridSize) * Math.PI * 2;
      
      const radius = 15 + Math.cos(phi * 5 + time) * 4;
      const distortion = Math.sin(theta * 6 + phi * 6 + time) * 2;
      
      positions[index] = (radius + distortion) * Math.sin(phi) * Math.cos(theta);
      positions[index + 1] = (radius + distortion) * Math.sin(phi) * Math.sin(theta);
      positions[index + 2] = (radius + distortion) * Math.cos(phi);
      
      positions[index] += Math.sin(phi * 10) * 0.8;
      positions[index + 1] += Math.sin(theta * 10) * 0.8;
      positions[index + 2] += Math.cos((phi + theta) * 6) * 0.8;
      
      const bulge = Math.sin(phi * 3) * Math.cos(theta * 3) * 2;
      positions[index] *= 1 + bulge * 0.1;
      positions[index + 1] *= 1 + bulge * 0.1;
      positions[index + 2] *= 1 + bulge * 0.1;
    }
  }
  
  return positions;
};
