import React, { useCallback, useContext ,useEffect, useRef , useState } from 'react';
import AnnotationForm  from '../ThreeComponents/AnnotationForm';//not required
import { setupScene } from '../../three/setupScene';
import { loadModel } from '../../three/loadModel';
import { setZoomBasedOnSlider } from '../../three/cameraUtil'; //not required
import { getAnnotationById, onSaveAnnotation, getAnnotationData } from '../../js/annotation';//not required
import InteractionHandler from '../../three/interactionHandler';//not required
import  AnnotationManager  from '../../three/annotationManager';//not required
import { AnnotationContext } from '../../js/AnnotationContext';//not required
import { toScreenPosition } from '../../js/projectionUtils'//not required

const ThreeContainer = ({ modelPath, productId, interactionHandlerRef, historyManager, UpdateUndoRedoAvailability, threeComponentRef}) => {
  const mountRef = useRef(null);
  const [initialized, setInitialized] = useState(false);
  const [showForm, setShowForm] = useState(false);//not required
  const [selectedPoint, setSelectedPoint] = useState(null);//not required
  const [AnnotationPosition, setPosition] = useState(null);//not required
  const [annotationData, setAnnotationData] = useState(null);//not required
  const [threeObjects, setThreeObjects] = useState({ scene: null, camera: null, renderer: null, controls: null });
  const { annotations ,setAnnotations } = useContext(AnnotationContext);//not required
  
  const [annotationPositions, setAnnotationPositions] = useState({});//not required

  // Add a function to update annotation positions
  const updateAnnotationPositions = useCallback(() => {   //not required
    const newPositions = {};
    
    annotations.forEach(annotation => {
      if (annotation && annotation.position) {
        if(mountRef.current){
          const screenPosition = toScreenPosition(annotation.obj, threeObjects.camera, threeObjects.renderer);
          newPositions[annotation.id] = screenPosition;
        }
      }
    });

    setAnnotationPositions(newPositions);
  }, []);


  const handlePointClick = (point, position, isNewPoint) => { //not required
    
      setSelectedPoint(point);
      setPosition(position);
      setShowForm(true);
      if(!isNewPoint){
        const annotationID = point;
        getAnnotationById(productId, annotationID).then( annotationData=>{
          setAnnotationData(annotationData);
        });
      }
      else{
        const nullData = '';
        setAnnotationData(nullData);
      }
    
  };

  const handleSaveAnnotation = async ( id ) => {    //not required
    const annotationWithPosition = {
        ...id, 
        position: AnnotationPosition 
    };
    onSaveAnnotation(annotationWithPosition , productId);
    if(interactionHandlerRef.current){
      interactionHandlerRef.current.clearActivePoint();
    }
    setShowForm(false);
    setPosition(null);   
  };

  const handleEditPoint = (EditID) =>{ //not required
    interactionHandlerRef.current.editActivePoint(EditID);
  }

  const handleDeletePoint = (deleteID) =>{ //not required
    setShowForm(false);
    interactionHandlerRef.current.deleteActivePoint(deleteID);
  }

  useEffect(() => {
    if(mountRef.current){}

      const { scene, camera, renderer ,controls} = setupScene(); 
      setThreeObjects({ scene, camera, renderer ,controls});
      mountRef.current.appendChild(renderer.domElement);
      loadModel(scene, modelPath, camera,  controls, (onModelLoaded)=>{
        interactionHandlerRef.current = new InteractionHandler(scene,
                                                                camera, 
                                                                renderer, 
                                                                onModelLoaded, 
                                                                handlePointClick,
                                                                historyManager,
                                                                UpdateUndoRedoAvailability,
                                                                setAnnotations); //not required
                                                                
          getAnnotationData(productId, interactionHandlerRef.current);//not required
                                                              });
        setInitialized(true);
        
        threeComponentRef.current = (newZoomLevel) =>{//not required
          setZoomBasedOnSlider(newZoomLevel, scene, camera, controls);
        };
        
        const animate = () => {
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
          updateAnnotationPositions();//not required
          camera.updateProjectionMatrix();
          controls.update();
        };
        
        animate(); 
        
        const onWindowResize = () => {
          const width = mountRef.current.clientWidth;
          const height = mountRef.current.clientHeight;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          controls.update();       
          updateAnnotationPositions();//not required
        };
        
        window.addEventListener('resize', onWindowResize, false);
        onWindowResize();
      
        
    // Cleanup function to remove the renderer from the DOM and clear event listeners
    return () => {           
        if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.complement);
        }
        window.removeEventListener('resize',onWindowResize, false);
        
      };
    }, [modelPath, productId, interactionHandlerRef]); // modelPath, productId, interactionHandlerRef

  return <div ref={mountRef} children class="box-content" style={{ width: '800px', height: '800px', position:'relative', overflow :'hidden'}}>
    { initialized &&  ( //not required
        <>   
        {(interactionHandlerRef.current &&        
          <AnnotationManager  camera = {threeObjects.camera}
                              renderer = {threeObjects.renderer}
                              annotationPositions = {annotationPositions} 
                              containerRef = {mountRef}
                              handlePointClick = {handlePointClick}/>    
        )}     
          {showForm && (
            <AnnotationForm
              annotationData={annotationData}
              selectedPoint={selectedPoint}
              onCancel={() => setShowForm(false)}
              onSave={handleSaveAnnotation}
              onEdit={handleEditPoint}
              onDelete={handleDeletePoint}
            />
          )}
        </>
      )}
  </div>;
};

export default ThreeContainer;
