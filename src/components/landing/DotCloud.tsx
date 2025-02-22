
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three-stdlib';
import { TextGeometry } from 'three-stdlib';

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

    // Create initial scattered points
    const pointsCount = 5000;
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
      size: 0.15,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });

    // Create points system
    const points = new THREE.Points(scatteredGeometry, pointsMaterial);
    scene.add(points);

    // Load font and create text geometry
    const loader = new FontLoader();
    let targetPositions: Float32Array | null = null;
    
    // Load the font and create text
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      const textGeometry = new TextGeometry('Formed For', {
        font: font,
        size: 10,
        height: 0,
        curveSegments: 4,
      });

      textGeometry.center();

      // Sample points from the text geometry
      const textPoints = generatePointsFromGeometry(textGeometry, pointsCount);
      targetPositions = new Float32Array(textPoints.flat());
      
      // Update the geometry with initial positions
      points.geometry.setAttribute('position', new THREE.BufferAttribute(scatteredPositions, 3));
    });

    // Helper function to generate points from geometry
    function generatePointsFromGeometry(geometry: THREE.BufferGeometry, count: number) {
      const points: number[][] = [];
      const vertices = geometry.attributes.position.array;
      
      for (let i = 0; i < count; i++) {
        const vertexIndex = Math.floor(Math.random() * (vertices.length / 3)) * 3;
        points.push([
          vertices[vertexIndex],
          vertices[vertexIndex + 1],
          vertices[vertexIndex + 2]
        ]);
      }
      
      return points;
    }

    // Position camera
    camera.position.z = 50;

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.005;

      if (targetPositions) {
        const positions = points.geometry.attributes.position.array as Float32Array;
        
        for (let i = 0; i < positions.length; i += 3) {
          // Interpolate between current and target positions
          positions[i] += (targetPositions[i] - positions[i]) * 0.02;
          positions[i + 1] += (targetPositions[i + 1] - positions[i + 1]) * 0.02;
          positions[i + 2] += (targetPositions[i + 2] - positions[i + 2]) * 0.02;

          // Add some wave motion
          positions[i] += Math.sin(time + i) * 0.03;
          positions[i + 1] += Math.cos(time + i) * 0.03;
        }
        
        points.geometry.attributes.position.needsUpdate = true;
      }

      // Slow rotation
      points.rotation.y += 0.001;

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
