import * as THREE from 'three';

const MIN_ZOOM_RATIO = 1; // Closest zoom (half the size of the object)
const MAX_ZOOM_RATIO = 300; // Farthest zoom (twice the size of the object)
let OBJ_SIZE = null;
let OBJ_CENTER = null;
let Camera = null;
let Controls = null;


export const adjustCameraToFitObject = (scene, camera, object, controls) => {
    Camera = camera;
    Controls = controls;
    const {center, size, boundingBox } = createBoundingBox(object, scene);
    OBJ_SIZE = size;
    OBJ_CENTER = center; 
    model = object;
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180); //camera.fov = 60 ;
    // console.log('fov :',camera.fov);
    let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));

    // This factor will depend on the initial position of the camera relative to the object
    const cameraToCenterDistance = cameraZ * 2;
    cameraZ += center.z; // Adjust camera Z considering the object's position

    // console.log(cameraZ);
    camera.position.z = cameraZ; //cameraZ
    const minZ = boundingBox.min.z;
    const cameraToFarEdgeDistance = (minZ < 0) ? -minZ + cameraToCenterDistance : cameraToCenterDistance - minZ;

    camera.far = cameraToFarEdgeDistance * 10;
    
    camera.near = 0.01; //camera.far / 100
    // console.log('far val: ', camera.far,'Near val: ', camera.near);
    camera.updateProjectionMatrix();

    if (controls) {

        // Update controls target to rotate around the center of the object
        // controls.target = center;  

        controls.target.set(center.x, center.y, center.z);
        controls.update();
    }
    camera.lookAt(center);
};


export const createBoundingBox = (object, scene) => {
    const boundingBox = new THREE.Box3().setFromObject(object);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());
    
    const boxHelper = new THREE.BoxHelper(object, 0xffff00); // color is optional    
    boxHelper.layers.set(1);
    // boxHelper.userData = { interactable: true };
    scene.add(boxHelper);
    boxHelper.update();
    return {center, size, boundingBox};
};

let model = null;

export const calculateScaleFactor = ( camera, rendererDomElement) => {
    // Step 1: Get the size of the bounding box in the world space
    const boundingBox = new THREE.Box3().setFromObject(model);
    const size = boundingBox.getSize(new THREE.Vector3());
  
    console.log('our OBJECT SIZE ',  size);
    // Step 2: Calculate the object's distance from the camera
    const objectPosition = new THREE.Vector3();
    boundingBox.getCenter(objectPosition);
    const distance = objectPosition.distanceTo(camera.position);
  
    // Step 3: Calculate the vertical field of view in radians
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
  
    // Step 4: Calculate the height of the visible area at this distance
    const visibleHeight = 2 * Math.tan(vFOV / 2) * distance;
  
    // Step 5: Calculate the visible width based on the aspect ratio
    const visibleWidth = visibleHeight * camera.aspect;
  
    // Step 6: Calculate the size of the object on the screen in pixels
    const pixelWidth = (size.x / visibleWidth) * rendererDomElement.clientWidth;
    const pixelHeight = (size.y / visibleHeight) * rendererDomElement.clientHeight;
  
    // Step 7: Derive the scaleFactor for CSS3DObject
    // Assuming you want a CSS3DObject to have a specific size in pixels (cssTargetWidth, cssTargetHeight)
    const cssTargetWidth = 200; // The width you want the CSS3D object to have in pixels
    const cssTargetHeight = 200; // The height you want the CSS3D object to have in pixels
    const scaleFactorWidth = cssTargetWidth / pixelWidth;
    const scaleFactorHeight = cssTargetHeight / pixelHeight;
    
    console.log('Scaled width', scaleFactorWidth, 'Scaled Height', scaleFactorHeight);
    // Return the average scale factor
    return (scaleFactorWidth + scaleFactorHeight) / 2;
  };

  export function calculatePerspective(camera, height) {
    const fov = THREE.MathUtils.degToRad(camera.fov); // Convert FOV to radians
    const perspective = 0.5 * height / Math.tan(fov / 2);
    return perspective;
  };

  export const setZoomBasedOnSlider = (sliderValue, scene, camera, controls) => {
    
    const zoomRatio = THREE.MathUtils.lerp(MIN_ZOOM_RATIO, MAX_ZOOM_RATIO, sliderValue / 100);
    
    const size = OBJ_SIZE; // `model` should be the object you want to zoom on
    const center = OBJ_CENTER ; // `model` should be the object you want to zoom on
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    
    // Calculate the new camera position based on the zoom ratio
    let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2)) * zoomRatio;
    // camera.position.z = center.z + cameraZ;
    camera.zoom = zoomRatio;  
    camera.updateProjectionMatrix();  
    if (controls) {
      controls.update();
    }
    camera.lookAt(center);
  };
   
  export const annotationToLookAt = (annotationPosition) =>{
    // Assuming 'annotationPosition' is a THREE.Vector3
    console.log('camera postion before lerping' , Camera.position);
    const targetPosition = annotationPosition; // or apply an offset if needed
    const offsetPosition = new THREE.Vector3(0, 0, 10); // Adjust the values as needed

    // Calculate the camera position by pulling back along the camera's local Z-axis
    const newCameraPosition = targetPosition.clone.add(offsetPosition.applyQuaternion(Camera.quaternion));

    // Start values for interpolation
    const startCameraPosition = Camera.position.clone();
    const startCameraQuaternion = Camera.quaternion.clone();

    // // Target values for quaternion slerp
    // const endCameraQuaternion = new THREE.Quaternion().setFromUnitVectors(Camera.up, new THREE.Vector3(0, 1, 0)).multiply(new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(newCameraPosition, targetPosition, Camera.up)));

    // Calculate the desired end rotation to look at the target
    const desiredLookAtQuaternion = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().lookAt(newCameraPosition, targetPosition, Camera.up)
    );


    // Animation variables
    let t = 0; // Interpolation parameter [0,1]
    const duration = 1000; // Duration of the animation in milliseconds

    function animateCamera(time) {
      requestAnimationFrame(animateCamera);

      // Update the interpolation parameter      
      t += (time - lastTime) / duration;

      if (t < 1) {
        // Interpolate position
        Camera.quaternion.slerpQuaternions(startCameraPosition, newCameraPosition, t);

        // Linear interpolation of the position
        Camera.position.lerpVectors(startCameraPosition, newCameraPosition, t);

        // Update the camera matrix
        // Camera.updateMatrixWorld();
        Camera.updateProjectionMatrix();
        Controls.update();
      } else {
        // Ensure the final values are set
        Camera.quaternion.copy(desiredLookAtQuaternion);
        Camera.position.copy(newCameraPosition);
        Camera.updateMatrixWorld();
        Controls.update();       
        // Stop the animation when t >= 1
        return;
      }      
      lastTime = time;
    }
    
    
    let lastTime = performance.now();
    requestAnimationFrame(animateCamera);
    console.log('camera postion before lerping' , Camera.position);

  };