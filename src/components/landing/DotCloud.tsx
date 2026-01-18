
import { useEffect, useRef, useState, useCallback } from 'react';
import { setupScene } from './three/setupScene';
import { 
  createPointCloud, 
  generateTeardropPositions, 
  loadAllSculptures, 
  generateModelPositions,
  generateScatteredPositions,
  interpolatePositions,
  getSculptureCount
} from './three/generatePoints';
import { MouseState, setupMouseHandlers } from './three/mouseHandlers';

// Transition states
type TransitionPhase = 'showing' | 'exploding' | 'reforming';

const SHOW_DURATION = 5000; // 5 seconds per sculpture
const TRANSITION_DURATION = 1500; // 1.5 seconds for transition

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

    // State for sculpture cycling
    const pointsCount = gridSize * gridSize;
    let targetPositions: Float32Array = generateTeardropPositions(gridSize);
    let currentPositions: Float32Array = new Float32Array(pointsCount * 3);
    let sculptureModels: Float32Array[] = [];
    let currentSculptureIndex = 0;
    let transitionPhase: TransitionPhase = 'showing';
    let phaseStartTime = Date.now();
    let lastPositionsBeforeTransition: Float32Array = targetPositions;

    // Load all sculptures
    loadAllSculptures()
      .then((models) => {
        sculptureModels = models;
        console.log(`Loaded ${models.length} sculpture models`);
        // Start with first sculpture
        if (models.length > 0) {
          targetPositions = generateModelPositions(models[0], pointsCount, 0);
          currentPositions = new Float32Array(targetPositions);
        }
      })
      .catch((error) => {
        console.warn('Failed to load sculptures, using fallback:', error);
      });

    // Setup mouse handlers
    const cleanup = setupMouseHandlers(
      containerRef.current, 
      mouseState, 
      () => {
        // On click, trigger immediate transition to next sculpture
        if (sculptureModels.length > 0 && transitionPhase === 'showing') {
          lastPositionsBeforeTransition = new Float32Array(currentPositions);
          transitionPhase = 'exploding';
          phaseStartTime = Date.now();
        }
      }
    );

    // Animation
    let animTime = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      animTime += 0.003;
      
      const now = Date.now();
      const phaseElapsed = now - phaseStartTime;

      // Handle sculpture cycling and transitions
      if (sculptureModels.length > 0) {
        switch (transitionPhase) {
          case 'showing':
            // Show current sculpture
            targetPositions = generateModelPositions(
              sculptureModels[currentSculptureIndex], 
              pointsCount, 
              animTime
            );
            
            // Check if it's time to transition
            if (phaseElapsed >= SHOW_DURATION) {
              lastPositionsBeforeTransition = new Float32Array(currentPositions);
              transitionPhase = 'exploding';
              phaseStartTime = now;
            }
            break;
            
          case 'exploding':
            // Explode outward
            const explodeProgress = Math.min(phaseElapsed / (TRANSITION_DURATION / 2), 1);
            targetPositions = generateScatteredPositions(
              lastPositionsBeforeTransition,
              pointsCount,
              explodeProgress,
              animTime
            );
            
            if (explodeProgress >= 1) {
              // Switch to next sculpture
              currentSculptureIndex = (currentSculptureIndex + 1) % sculptureModels.length;
              transitionPhase = 'reforming';
              phaseStartTime = now;
            }
            break;
            
          case 'reforming':
            // Reform into new sculpture
            const reformProgress = Math.min(phaseElapsed / (TRANSITION_DURATION / 2), 1);
            
            // Get scattered positions (at max explosion)
            const scatteredPos = generateScatteredPositions(
              lastPositionsBeforeTransition,
              pointsCount,
              1,
              animTime
            );
            
            // Get target sculpture positions
            const newSculpturePos = generateModelPositions(
              sculptureModels[currentSculptureIndex],
              pointsCount,
              animTime
            );
            
            // Interpolate from scattered to new sculpture
            targetPositions = interpolatePositions(
              scatteredPos,
              newSculpturePos,
              reformProgress,
              pointsCount
            );
            
            if (reformProgress >= 1) {
              transitionPhase = 'showing';
              phaseStartTime = now;
            }
            break;
        }
      }

      const positions = points.geometry.attributes.position.array as Float32Array;
      
      // Smoothly interpolate to target positions
      // Use faster interpolation during transitions for more dramatic effect
      const lerpSpeed = transitionPhase === 'showing' ? 0.04 : 0.08;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += (targetPositions[i] - positions[i]) * lerpSpeed;
        positions[i + 1] += (targetPositions[i + 1] - positions[i + 1]) * lerpSpeed;
        positions[i + 2] += (targetPositions[i + 2] - positions[i + 2]) * lerpSpeed;
        
        // Store current positions for transition reference
        currentPositions[i] = positions[i];
        currentPositions[i + 1] = positions[i + 1];
        currentPositions[i + 2] = positions[i + 2];

        // Add subtle wave animation only when showing
        if (transitionPhase === 'showing') {
          const gridX = Math.floor(i / 3) % gridSize;
          const gridY = Math.floor((i / 3) / gridSize);
          const waveOffset = Math.sin(animTime + gridX * 0.1) * Math.cos(animTime + gridY * 0.1);
          
          positions[i] += waveOffset * 0.015;
          positions[i + 1] += waveOffset * 0.015;
          positions[i + 2] += waveOffset * 0.015;
        }
      }
      
      points.geometry.attributes.position.needsUpdate = true;

      // Rotation
      if (!mouseState.isMouseDown) {
        points.rotation.y += 0.002;
        points.rotation.x = Math.sin(animTime * 0.3) * 0.1;
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
