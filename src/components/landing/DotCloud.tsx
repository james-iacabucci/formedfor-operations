
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

    // Create initial scattered points
    const pointsCount = 8000; // Increased for better detail
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
      size: 0.12, // Smaller points for better detail
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });

    // Create points system
    const points = new THREE.Points(scatteredGeometry, pointsMaterial);
    scene.add(points);

    // Define logo paths
    const shape = new THREE.Shape();
    
    // Outer rounded rectangle (border)
    const width = 20;
    const height = 30;
    const radius = 5;
    
    shape.moveTo(-width/2, -height/2 + radius);
    shape.lineTo(-width/2, height/2 - radius);
    shape.quadraticCurveTo(-width/2, height/2, -width/2 + radius, height/2);
    shape.lineTo(width/2 - radius, height/2);
    shape.quadraticCurveTo(width/2, height/2, width/2, height/2 - radius);
    shape.lineTo(width/2, -height/2 + radius);
    shape.quadraticCurveTo(width/2, -height/2, width/2 - radius, -height/2);
    shape.lineTo(-width/2 + radius, -height/2);
    shape.quadraticCurveTo(-width/2, -height/2, -width/2, -height/2 + radius);

    // Add the F shapes and horizontal line
    const fShape = new THREE.Shape();
    // Top F
    fShape.moveTo(-5, 5);
    fShape.lineTo(-5, 12);
    fShape.lineTo(5, 12);
    fShape.lineTo(5, 10);
    fShape.lineTo(-3, 10);
    fShape.lineTo(-3, 8);
    fShape.lineTo(4, 8);
    fShape.lineTo(4, 6);
    fShape.lineTo(-3, 6);
    fShape.lineTo(-3, 5);
    fShape.lineTo(-5, 5);

    // Bottom F (inverted)
    fShape.moveTo(-5, -5);
    fShape.lineTo(-5, -12);
    fShape.lineTo(5, -12);
    fShape.lineTo(5, -10);
    fShape.lineTo(-3, -10);
    fShape.lineTo(-3, -8);
    fShape.lineTo(4, -8);
    fShape.lineTo(4, -6);
    fShape.lineTo(-3, -6);
    fShape.lineTo(-3, -5);
    fShape.lineTo(-5, -5);

    // Horizontal line
    fShape.moveTo(-8, 0.75);
    fShape.lineTo(8, 0.75);
    fShape.lineTo(8, -0.75);
    fShape.lineTo(-8, -0.75);
    fShape.lineTo(-8, 0.75);

    // Generate geometry from shapes
    const geometry = new THREE.ShapeGeometry(shape);
    const fGeometry = new THREE.ShapeGeometry(fShape);

    // Combine geometries
    const combinedGeometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    
    // Sample points from both geometries
    const sampleGeometry = (geo: THREE.BufferGeometry, count: number) => {
      const vertices = geo.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const vertexIndex = Math.floor(Math.random() * (vertices.length / 3)) * 3;
        positions.push(
          vertices[vertexIndex],
          vertices[vertexIndex + 1],
          vertices[vertexIndex + 2]
        );
      }
    };

    sampleGeometry(geometry, pointsCount / 3);
    sampleGeometry(fGeometry, (pointsCount * 2) / 3);

    const targetPositions = new Float32Array(positions);

    // Position camera
    camera.position.z = 50;

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.005;

      const positions = points.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Interpolate between current and target positions
        positions[i] += (targetPositions[i % targetPositions.length] - positions[i]) * 0.02;
        positions[i + 1] += (targetPositions[(i + 1) % targetPositions.length] - positions[i + 1]) * 0.02;
        positions[i + 2] += (targetPositions[(i + 2) % targetPositions.length] - positions[i + 2]) * 0.02;

        // Add subtle wave motion
        positions[i] += Math.sin(time + i) * 0.02;
        positions[i + 1] += Math.cos(time + i) * 0.02;
      }
      
      points.geometry.attributes.position.needsUpdate = true;

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
