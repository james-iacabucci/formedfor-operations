
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const DotCloud = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    containerRef.current.appendChild(renderer.domElement);

    // Mouse interaction state
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    // Create points in a uniform grid pattern
    const gridSize = 100; // Number of points along each axis
    const pointsCount = gridSize * gridSize;
    const scatteredGeometry = new THREE.BufferGeometry();
    const scatteredPositions = new Float32Array(pointsCount * 3);
    
    // Create initial grid positions
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = (i * gridSize + j) * 3;
        scatteredPositions[index] = (i - gridSize/2) * 0.5;
        scatteredPositions[index + 1] = (j - gridSize/2) * 0.5;
        scatteredPositions[index + 2] = 0;
      }
    }
    
    scatteredGeometry.setAttribute('position', new THREE.BufferAttribute(scatteredPositions, 3));
    
    // Create points material with smaller, denser points
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05, // Smaller point size for more precise look
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });

    // Create points system
    const points = new THREE.Points(scatteredGeometry, pointsMaterial);
    scene.add(points);

    // Generate organic target positions while maintaining grid structure
    const generateOrganicPositions = () => {
      const positions = new Float32Array(pointsCount * 3);
      const time = Date.now() * 0.001;
      
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const index = (i * gridSize + j) * 3;
          
          // Create base sphere coordinates
          const phi = (i / gridSize) * Math.PI;
          const theta = (j / gridSize) * Math.PI * 2;
          
          // Add organized variation
          const radius = 15 + Math.cos(phi * 3 + time) * 2;
          const distortion = Math.sin(theta * 4 + phi * 4 + time) * 0.5;
          
          // Convert to Cartesian coordinates while maintaining grid structure
          positions[index] = (radius + distortion) * Math.sin(phi) * Math.cos(theta);
          positions[index + 1] = (radius + distortion) * Math.sin(phi) * Math.sin(theta);
          positions[index + 2] = (radius + distortion) * Math.cos(phi);
          
          // Add subtle grid-preserving displacement
          positions[index] += Math.sin(phi * 8) * 0.2;
          positions[index + 1] += Math.sin(theta * 8) * 0.2;
          positions[index + 2] += Math.cos((phi + theta) * 4) * 0.2;
        }
      }
      
      return positions;
    };

    let targetPositions = generateOrganicPositions();

    // Mouse event handlers
    const onMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
      // Generate new organic shape when clicked
      targetPositions = generateOrganicPositions();
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      mouseX = event.clientX;
      mouseY = event.clientY;
      
      targetRotationY += deltaX * 0.005;
      targetRotationX += deltaY * 0.005;
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    // Add event listeners
    containerRef.current.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Position camera
    camera.position.z = 50;

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.003;

      const positions = points.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Interpolate between current and target positions
        positions[i] += (targetPositions[i] - positions[i]) * 0.02;
        positions[i + 1] += (targetPositions[i + 1] - positions[i + 1]) * 0.02;
        positions[i + 2] += (targetPositions[i + 2] - positions[i + 2]) * 0.02;

        // Add very subtle flowing motion while preserving grid structure
        const gridX = Math.floor(i / 3) % gridSize;
        const gridY = Math.floor((i / 3) / gridSize);
        const waveOffset = Math.sin(time + gridX * 0.1) * Math.cos(time + gridY * 0.1);
        
        positions[i] += waveOffset * 0.01;
        positions[i + 1] += waveOffset * 0.01;
        positions[i + 2] += waveOffset * 0.01;
      }
      
      points.geometry.attributes.position.needsUpdate = true;

      // Smooth rotation based on mouse interaction
      points.rotation.y += (targetRotationY - points.rotation.y) * 0.1;
      points.rotation.x += (targetRotationX - points.rotation.x) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousedown', onMouseDown);
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    />
  );
};
