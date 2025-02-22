
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

    // Create particles
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsCount = 5000; // Increased number of points for better effect
    const positions = new Float32Array(pointsCount * 3);
    
    for (let i = 0; i < pointsCount; i++) {
      // Create a more focused cloud shape
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      const r = Math.random() * 20;

      positions[i * 3] = r * Math.sin(theta) * Math.cos(phi);     // X
      positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi); // Y
      positions[i * 3 + 2] = r * Math.cos(theta);                 // Z
    }

    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create particles with improved visual style
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });

    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);

    // Position camera for better view
    camera.position.z = 30;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate the entire cloud
      points.rotation.y += 0.001;
      points.rotation.x += 0.0005;
      
      // Breathing effect
      const time = Date.now() * 0.001;
      const positions = points.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const initialX = positions[i];
        const initialY = positions[i + 1];
        const initialZ = positions[i + 2];
        
        // Add subtle wave motion
        positions[i] = initialX + Math.sin(time + i * 0.1) * 0.1;
        positions[i + 1] = initialY + Math.cos(time + i * 0.1) * 0.1;
        positions[i + 2] = initialZ + Math.sin(time + i * 0.05) * 0.1;
      }
      
      points.geometry.attributes.position.needsUpdate = true;

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
      containerRef.current?.removeChild(renderer.domElement);
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
};
