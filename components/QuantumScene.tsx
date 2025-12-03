
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Cylinder, Stars, Environment, Box } from '@react-three/drei';
import * as THREE from 'three';

const FloatingOrb = ({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.position.y = position[1] + Math.sin(t * 0.5 + position[0]) * 0.2;
      ref.current.rotation.x = t * 0.2;
      ref.current.rotation.z = t * 0.1;
    }
  });

  return (
    <Sphere ref={ref} args={[1, 64, 64]} position={position} scale={scale}>
      <MeshDistortMaterial
        color={color}
        envMapIntensity={1.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
        metalness={0.6}
        roughness={0.2}
        distort={0.3}
        speed={1.5}
      />
    </Sphere>
  );
};

const GoldenRing = () => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
       const t = state.clock.getElapsedTime();
       ref.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.2) * 0.1;
       ref.current.rotation.y = t * 0.1;
    }
  });

  return (
    <Torus ref={ref} args={[3, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.2} emissive="#C5A059" emissiveIntensity={0.2} />
    </Torus>
  );
}

export const HeroScene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <FloatingOrb position={[0, 0, 0]} color="#1a1a1a" scale={1.2} />
          <GoldenRing />
        </Float>
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
           <FloatingOrb position={[-3.5, 1.5, -2]} color="#C5A059" scale={0.4} />
           <FloatingOrb position={[3.5, -1.5, -3]} color="#F5F4F0" scale={0.5} />
        </Float>

        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export const LensScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [4, 2, 4], fov: 40 }}>
        <ambientLight intensity={1} />
        <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={2} color="#fff" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        <Environment preset="studio" />
        
        <Float rotationIntensity={0.2} floatIntensity={0.2} speed={1}>
          <group rotation={[0, -Math.PI / 4, Math.PI / 6]} position={[0, 0, 0]}>
            
            {/* Abstract Lens Elements */}
            
            {/* Back Element */}
            <Cylinder args={[1, 1, 0.2, 64]} position={[0, -1, 0]}>
              <meshPhysicalMaterial 
                color="#1a1a1a" 
                metalness={0.8} 
                roughness={0.2} 
                clearcoat={1}
              />
            </Cylinder>
            
            {/* Glass Element 1 */}
            <Cylinder args={[1.1, 1.1, 0.3, 64]} position={[0, -0.6, 0]}>
              <meshPhysicalMaterial 
                color="#ffffff" 
                transmission={0.9} 
                opacity={0.8} 
                transparent 
                roughness={0} 
                metalness={0} 
                thickness={1}
              />
            </Cylinder>

            {/* Gold Ring */}
             <Torus args={[1.15, 0.05, 16, 64]} position={[0, -0.6, 0]} rotation={[Math.PI/2, 0, 0]}>
               <meshStandardMaterial color="#C5A059" metalness={1} roughness={0.1} />
            </Torus>
            
            {/* Middle Body */}
            <Cylinder args={[0.9, 0.9, 0.8, 64]} position={[0, 0.1, 0]}>
               <meshStandardMaterial color="#222" metalness={0.8} roughness={0.4} />
            </Cylinder>

            {/* Glass Element 2 */}
            <Cylinder args={[1.2, 1.2, 0.1, 64]} position={[0, 0.7, 0]}>
               <meshPhysicalMaterial 
                color="#C5A059" 
                transmission={0.6} 
                opacity={0.5} 
                transparent 
                roughness={0} 
                metalness={0.5} 
              />
            </Cylinder>

             {/* Front Ring */}
             <Torus args={[1.25, 0.05, 16, 64]} position={[0, 0.7, 0]} rotation={[Math.PI/2, 0, 0]}>
               <meshStandardMaterial color="#C5A059" metalness={1} roughness={0.1} />
            </Torus>

          </group>
        </Float>
      </Canvas>
    </div>
  );
}
