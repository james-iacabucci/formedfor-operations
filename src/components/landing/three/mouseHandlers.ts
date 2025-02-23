
import * as THREE from 'three';

export type MouseState = {
  isMouseDown: boolean;
  mouseX: number;
  mouseY: number;
  targetRotationX: number;
  targetRotationY: number;
};

export const setupMouseHandlers = (
  container: HTMLDivElement, 
  mouseState: MouseState,
  onNewPositions: () => void
) => {
  const onMouseDown = (event: MouseEvent) => {
    mouseState.isMouseDown = true;
    mouseState.mouseX = event.clientX;
    mouseState.mouseY = event.clientY;
    onNewPositions();
  };

  const onMouseMove = (event: MouseEvent) => {
    if (!mouseState.isMouseDown) return;
    
    const deltaX = event.clientX - mouseState.mouseX;
    const deltaY = event.clientY - mouseState.mouseY;
    
    mouseState.mouseX = event.clientX;
    mouseState.mouseY = event.clientY;
    
    mouseState.targetRotationY += deltaX * 0.005;
    mouseState.targetRotationX += deltaY * 0.005;
  };

  const onMouseUp = () => {
    mouseState.isMouseDown = false;
  };

  container.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  return () => {
    container.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };
};
