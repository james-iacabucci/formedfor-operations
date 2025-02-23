
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

    // Create initial scattered points
    const pointsCount = 15000;
    const scatteredGeometry = new THREE.BufferGeometry();
    const scatteredPositions = new Float32Array(pointsCount * 3);
    
    for (let i = 0; i < pointsCount; i++) {
      scatteredPositions[i * 3] = (Math.random() - 0.5) * 100;
      scatteredPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      scatteredPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    
    scatteredGeometry.setAttribute('position', new THREE.BufferAttribute(scatteredPositions, 3));
    
    // Create points material
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });

    // Create points system
    const points = new THREE.Points(scatteredGeometry, pointsMaterial);
    scene.add(points);

    // Generate organic target positions
    const generateOrganicPositions = () => {
      const positions = new Float32Array(pointsCount * 3);
      const scale = 15;
      const frequency = 0.05;
      const time = Date.now() * 0.001;
      
      for (let i = 0; i < pointsCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 10 + Math.random() * 5;
        
        const distortion = Math.sin(theta * 4 + time) * Math.cos(phi * 3) * 2;
        const finalRadius = r + distortion;
        
        positions[i * 3] = finalRadius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = finalRadius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = finalRadius * Math.cos(phi);
        
        positions[i * 3] += Math.sin(positions[i * 3 + 1] * frequency) * scale;
        positions[i * 3 + 1] += Math.sin(positions[i * 3 + 2] * frequency) * scale;
        positions[i * 3 + 2] += Math.sin(positions[i * 3] * frequency) * scale;
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

        // Add flowing motion
        positions[i] += Math.sin(time + i * 0.1) * 0.03;
        positions[i + 1] += Math.cos(time + i * 0.1) * 0.03;
        positions[i + 2] += Math.sin(time + i * 0.05) * 0.03;
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
