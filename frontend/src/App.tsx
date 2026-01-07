import { useState, Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
// @ts-ignore
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import axios from 'axios';
import './App.css';

interface ModelProps {
  url: string;
}

function Model({ url }: ModelProps) {
  const geometry = useLoader(STLLoader, url);
  
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color="#ffffff" roughness={0.5} metalness={0.1} />
    </mesh>
  );
}

function App() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/generate-demo', {
        params: { length: 100, width: 60 },
        responseType: 'blob',
      });

      if (modelUrl) URL.revokeObjectURL(modelUrl);

      const url = URL.createObjectURL(response.data);
      setModelUrl(url);
    } catch (error) {
      console.error("Generation Failed:", error);
      alert("Failed. Make sure main.py is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!modelUrl) return;

    const link = document.createElement('a');
    link.href = modelUrl;
    link.download = 'generated-model.stl';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h2>AI Modeling</h2>
        <p>Build123d + Three.js</p>
        
        <div className="control-group">
          <button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Demo Model"}
          </button>


          <button 
            onClick={handleDownload} 
            disabled={!modelUrl || loading}
            style={{ marginTop: '10px', backgroundColor: modelUrl ? '#28a745' : '#666' }}
          >
            Download STL
          </button>
        </div>

        <div className="instructions">
          1. Press "Demo Model" to generate.<br/>
          2. Press "Download STL" to save file.
        </div>
      </div>

      <div className="canvas-wrapper">
        <Canvas shadows camera={{ position: [50, 50, 50], fov: 50 }}>
          <color attach="background" args={['#1a1a1a']} />
          
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.5}>
              {modelUrl && <Center><Model url={modelUrl} /></Center>}
            </Stage>
          </Suspense>

          <OrbitControls makeDefault />
        </Canvas>
      </div>
    </div>
  );
}

export default App;