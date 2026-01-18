
import { useEffect, useRef } from 'react';
import { setupScene } from './three/setupScene';
import { createPointCloud, generateTeardropPositions } from './three/generatePoints';
import { MouseState, setupMouseHandlers } from './three/mouseHandlers';

export const DotCloud = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const { scene, camera, renderer } = setupScene(containerRef.current);

    // Create point cloud
    const { points, gridSize } = createPointCloud();
    scene.add(points);

    // Setup mouse interaction state
    const mouseState: MouseState = {
      isMouseDown: false,
      mouseX: 0,
      mouseY: 0,
      targetRotationX: 0,
      targetRotationY: 0
    };

    // Initialize target positions
    let targetPositions = generateTeardropPositions(gridSize);

    // Setup mouse handlers
    const cleanup = setupMouseHandlers(
      containerRef.current, 
      mouseState, 
      () => { targetPositions = generateTeardropPositions(gridSize); }
    );

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.003;

      const positions = points.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += (targetPositions[i] - positions[i]) * 0.04;
        positions[i + 1] += (targetPositions[i + 1] - positions[i + 1]) * 0.04;
        positions[i + 2] += (targetPositions[i + 2] - positions[i + 2]) * 0.04;

        const gridX = Math.floor(i / 3) % gridSize;
        const gridY = Math.floor((i / 3) / gridSize);
        const waveOffset = Math.sin(time + gridX * 0.1) * Math.cos(time + gridY * 0.1);
        
        positions[i] += waveOffset * 0.02;
        positions[i + 1] += waveOffset * 0.02;
        positions[i + 2] += waveOffset * 0.02;
      }
      
      points.geometry.attributes.position.needsUpdate = true;

      if (!mouseState.isMouseDown) {
        points.rotation.y += 0.003;
        points.rotation.x = Math.sin(time * 0.5) * 0.2;
      } else {
        points.rotation.y += (mouseState.targetRotationY - points.rotation.y) * 0.1;
        points.rotation.x += (mouseState.targetRotationX - points.rotation.x) * 0.1;
      }

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
      cleanup();
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
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
