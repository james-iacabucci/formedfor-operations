
import * as THREE from 'three';

export const setupScene = (container: HTMLDivElement) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  container.appendChild(renderer.domElement);
  
  camera.position.z = 50;
  
  return { scene, camera, renderer };
};
