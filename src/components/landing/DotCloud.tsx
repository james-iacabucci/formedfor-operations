
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

    // Create text geometry
    const loader = new THREE.FontLoader();
    const particles: THREE.Points[] = [];
    
    loader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
      const textGeometry = new THREE.TextGeometry('Formed For', {
        font,
        size: 3,
        height: 0.2,
        curveSegments: 12,
      });

      textGeometry.center();

      // Sample points from text geometry
      const pointsGeometry = new THREE.BufferGeometry();
      const pointsCount = 2000;
      const positions = new Float32Array(pointsCount * 3);
      
      for (let i = 0; i < pointsCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50;     // Scattered X
        positions[i * 3 + 1] = (Math.random() - 0.5) * 50; // Scattered Y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50; // Scattered Z
      }

      pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Create particles
      const pointsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(pointsGeometry, pointsMaterial);
      particles.push(points);
      scene.add(points);
    });

    // Position camera
    camera.position.z = 15;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      particles.forEach(points => {
        points.rotation.y += 0.001; // Slow rotation
        
        // Breathing effect
        const positions = points.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.001;
          positions[i + 1] += Math.cos(Date.now() * 0.001 + i) * 0.001;
        }
        points.geometry.attributes.position.needsUpdate = true;
      });

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
