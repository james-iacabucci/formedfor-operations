
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
    const pointsCount = 20000; // Increased for better detail
    const scatteredGeometry = new THREE.BufferGeometry();
    const scatteredPositions = new Float32Array(pointsCount * 3);
    
    for (let i = 0; i < pointsCount; i++) {
      scatteredPositions[i * 3] = (Math.random() - 0.5) * 100;
      scatteredPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      scatteredPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    
    scatteredGeometry.setAttribute('position', new THREE.BufferAttribute(scatteredPositions, 3));
    
    // Create points material with bright white color for clarity
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05, // Smaller points for sharper detail
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
    });

    // Create points system
    const points = new THREE.Points(scatteredGeometry, pointsMaterial);
    scene.add(points);

    // Load font and create text geometry
    const loader = new FontLoader();
    let targetPositions: Float32Array | null = null;
    
    // Load the font and create text
    loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
      // Create "FORMED" text
      const textGeometry1 = new TextGeometry('FORMED', {
        font: font,
        size: 8,
        height: 2, // Increased depth for 3D effect
        curveSegments: 12, // Increased for smoother curves
        bevelEnabled: true,
        bevelThickness: 0.3,
        bevelSize: 0.2,
        bevelOffset: 0,
        bevelSegments: 5
      });

      // Create "FOR" text
      const textGeometry2 = new TextGeometry('FOR', {
        font: font,
        size: 8,
        height: 2, // Increased depth for 3D effect
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.3,
        bevelSize: 0.2,
        bevelOffset: 0,
        bevelSegments: 5
      });

      // Center and position the text geometries
      textGeometry1.center();
      textGeometry2.center();
      textGeometry1.translate(-12, 4, 0); // Move "FORMED" up and left
      textGeometry2.translate(8, -4, 0);  // Move "FOR" down and right

      // Sample points from both text geometries
      const points1 = generatePointsFromGeometry(textGeometry1, pointsCount * 0.6);
      const points2 = generatePointsFromGeometry(textGeometry2, pointsCount * 0.4);
      
      // Combine the points
      targetPositions = new Float32Array([...points1, ...points2]);
    });

    // Helper function to generate points from geometry
    function generatePointsFromGeometry(geometry: THREE.BufferGeometry, count: number) {
      const positions: number[] = [];
      const positionAttribute = geometry.attributes.position;
      
      for (let i = 0; i < count; i++) {
        // Get random vertex from geometry
        const vertexIndex = Math.floor(Math.random() * (positionAttribute.count));
        const x = positionAttribute.getX(vertexIndex);
        const y = positionAttribute.getY(vertexIndex);
        const z = positionAttribute.getZ(vertexIndex);
        
        // Add some randomness within the volume of the text
        positions.push(
          x + (Math.random() - 0.5) * 0.1, // Small random offset for volume
          y + (Math.random() - 0.5) * 0.1,
          z + (Math.random() - 0.5) * 0.1
        );
      }
      
      return positions;
    }

    // Position camera
    camera.position.z = 50;

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.003;

      if (targetPositions) {
        const positions = points.geometry.attributes.position.array as Float32Array;
        
        for (let i = 0; i < positions.length; i += 3) {
          // Interpolate between current and target positions
          if (i < targetPositions.length) {
            positions[i] += (targetPositions[i] - positions[i]) * 0.02;
            positions[i + 1] += (targetPositions[i + 1] - positions[i + 1]) * 0.02;
            positions[i + 2] += (targetPositions[i + 2] - positions[i + 2]) * 0.02;
          }

          // Add very subtle wave motion
          positions[i] += Math.sin(time + i * 0.1) * 0.01;
          positions[i + 1] += Math.cos(time + i * 0.1) * 0.01;
          positions[i + 2] += Math.sin(time + i * 0.05) * 0.01;
        }
        
        points.geometry.attributes.position.needsUpdate = true;
      }

      // Very slow rotation for depth perception
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
