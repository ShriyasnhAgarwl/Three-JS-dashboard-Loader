import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { adjustCameraToFitObject } from './cameraUtil';

export const loadModel = (scene, modelPath, onLoadCallback) => {
  const loader = new GLTFLoader();
  loader.load(modelPath, gltf => {
    const model = gltf.scene;
    scene.add(model);
    if (onLoadCallback) onLoadCallback(model);
  }, undefined, error => {
    console.error('An error happened', error);
  });
};

export const loadModelFromFile = (file,camera, scene, controls) => {
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = (event) => {
    const loader = new GLTFLoader();
    loader.parse(event.target.result, '', (gltf) => {
      const model = gltf.scene;
      scene.add(model);
      // Additional setup like adjusting the camera can go here
      adjustCameraToFitObject(scene, camera, model, controls);
    });
  };
};
