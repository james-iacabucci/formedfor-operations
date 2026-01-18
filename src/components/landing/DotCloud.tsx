
import { useEffect, useRef, useState } from 'react';
import { setupScene } from './three/setupScene';
import { 
  createPointCloud, 
  generateTeardropPositions, 
  loadSculptureModel, 
  generateModelPositions 
} from './three/generatePoints';
import { MouseState, setupMouseHandlers } from './three/mouseHandlers';

export const DotCloud = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  
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

    // Initialize with teardrop positions while model loads
    const pointsCount = gridSize * gridSize;
    let targetPositions: Float32Array = generateTeardropPositions(gridSize);
    let modelVertices: Float32Array | null = null;

    // Load the 3D model
    loadSculptureModel()
      .then((vertices) => {
        modelVertices = vertices;
        setModelLoaded(true);
        console.log('Sculpture model ready for visualization');
      })
      .catch((error) => {
        console.warn('Failed to load sculpture model, using fallback shape:', error);
      });

    // Setup mouse handlers
    const cleanup = setupMouseHandlers(
      containerRef.current, 
      mouseState, 
      () => {
        // On click, slightly vary the positions for visual interest
        if (modelVertices) {
          targetPositions = generateModelPositions(modelVertices, pointsCount, Date.now() * 0.001);
        }
      }
    );

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.003;

      // Update target positions from model if loaded
      if (modelVertices) {
        targetPositions = generateModelPositions(modelVertices, pointsCount, time);
      }

      const positions = points.geometry.attributes.position.array as Float32Array;
      
      // Smoothly interpolate to target positions
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += (targetPositions[i] - positions[i]) * 0.04;
        positions[i + 1] += (targetPositions[i + 1] - positions[i + 1]) * 0.04;
        positions[i + 2] += (targetPositions[i + 2] - positions[i + 2]) * 0.04;

        // Add subtle wave animation
        const gridX = Math.floor(i / 3) % gridSize;
        const gridY = Math.floor((i / 3) / gridSize);
        const waveOffset = Math.sin(time + gridX * 0.1) * Math.cos(time + gridY * 0.1);
        
        positions[i] += waveOffset * 0.015;
        positions[i + 1] += waveOffset * 0.015;
        positions[i + 2] += waveOffset * 0.015;
      }
      
      points.geometry.attributes.position.needsUpdate = true;

      // Rotation - slower for elegant presentation
      if (!mouseState.isMouseDown) {
        points.rotation.y += 0.002;
        points.rotation.x = Math.sin(time * 0.3) * 0.1;
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
