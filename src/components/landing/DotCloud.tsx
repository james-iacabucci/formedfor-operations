
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
    const pointsCount = 12000; // Increased for better detail
    const scatteredGeometry = new THREE.BufferGeometry();
    const scatteredPositions = new Float32Array(pointsCount * 3);
    
    for (let i = 0; i < pointsCount; i++) {
      scatteredPositions[i * 3] = (Math.random() - 0.5) * 100;
      scatteredPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      scatteredPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    
    scatteredGeometry.setAttribute('position', new THREE.BufferAttribute(scatteredPositions, 3));
    
    // Create points material with a warm copper color
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xcd7f32, // Copper color
      size: 0.08, // Smaller points for better detail
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });

    // Create points system
    const points = new THREE.Points(scatteredGeometry, pointsMaterial);
    scene.add(points);

    // Create the sculpture shape using curves
    const curve1 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-10, -15, 0),
      new THREE.Vector3(-15, 0, 10),
      new THREE.Vector3(-5, 15, -10),
      new THREE.Vector3(0, 15, 0)
    );

    const curve2 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(10, -15, 0),
      new THREE.Vector3(15, 0, -10),
      new THREE.Vector3(5, 15, 10),
      new THREE.Vector3(0, 15, 0)
    );

    // Generate points along the curves
    const positions: number[] = [];
    const curvePoints1 = curve1.getPoints(200);
    const curvePoints2 = curve2.getPoints(200);

    // Function to generate points around a curve point
    const generatePointsAroundCurve = (point: THREE.Vector3, radius: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;

        positions.push(
          point.x + r * Math.sin(theta) * Math.cos(phi),
          point.y + r * Math.sin(theta) * Math.sin(phi),
          point.z + r * Math.cos(theta)
        );
      }
    };

    // Generate points for both curves
    curvePoints1.forEach((point) => {
      generatePointsAroundCurve(point, 3, 30);
    });

    curvePoints2.forEach((point) => {
      generatePointsAroundCurve(point, 3, 30);
    });

    const targetPositions = new Float32Array(positions);

    // Position camera
    camera.position.set(0, 0, 60);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.003;

      const positions = points.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Interpolate between current and target positions
        if (i < targetPositions.length) {
          positions[i] += (targetPositions[i] - positions[i]) * 0.02;
          positions[i + 1] += (targetPositions[i + 1] - positions[i + 1]) * 0.02;
          positions[i + 2] += (targetPositions[i + 2] - positions[i + 2]) * 0.02;
        }

        // Add subtle wave motion
        positions[i] += Math.sin(time + i * 0.1) * 0.03;
        positions[i + 1] += Math.cos(time + i * 0.1) * 0.03;
        positions[i + 2] += Math.sin(time + i * 0.05) * 0.03;
      }
      
      points.geometry.attributes.position.needsUpdate = true;

      // Slow rotation
      points.rotation.y += 0.002;

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
