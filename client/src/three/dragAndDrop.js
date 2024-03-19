import React, { useState, useEffect, useRef } from 'react';
import { loadModelFromFile } from './loadModel';
import { setupInteractionHandler } from './interactionHandler';

const DragAndDrop = ({ handlePointClick ,onModelLoaded, scene, camera, controls, renderer}) => { //scene, camera, controls, renderer
  const [isDragging, setIsDragging] = useState(false);  
  const [fileLoaded, setFileLoaded] = useState(false);  
  const cleanupInteractionRef = useRef(null);
  let modelFile = null;

  useEffect(() => {
    const handleDrop = (event) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) {
        loadModelFromFile(file, camera, scene, controls,(loadedModel)=>{
          setFileLoaded(true);
          modelFile = loadedModel;
          cleanupInteractionRef.current = setupInteractionHandler(scene, camera, renderer, loadedModel, handlePointClick);          
        });
        if (typeof onModelLoaded === 'function'){
          onModelLoaded();
        } 
      }
    };

    

    const handleDragOver = (event) => {
      event.preventDefault();
      setIsDragging(true);
    };

    
    
    const handleDragEnd = (event) => {
      event.preventDefault();
      setIsDragging(false); // Assuming you have an `isDragging` state
      setFileLoaded(true); 
    };

    // Add event listeners to the document
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragend', handleDragEnd);

    // Cleanup
    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);      
      document.removeEventListener('dragend', handleDragEnd);
      if (cleanupInteractionRef.current) {
        // console.log('Cleaned up');
        cleanupInteractionRef.current();
        
      }
    };
  }, []); //scene, camera, controls, onModelLoaded, handlePointClick

  return (
    <div
      className={`drop-zone ${isDragging ? 'drag-over' : ''}`}
      style={{
        display: fileLoaded ? 'none' : 'flex', // Hide after file is loaded
        // Additional styles here
      }}>
        <lottie-player
        src="https://lottie.host/179750b7-1f47-40ce-9274-0eff47e3885c/rlZg6Efq3f.json"
        background="transparent"
        speed="1"
        style={{ width: '300px', height: '300px' }}
        loop
        autoplay
      ></lottie-player>
      <p> Drag and Drop GLB Files Here </p>
    </div>
  );
};

export default DragAndDrop;