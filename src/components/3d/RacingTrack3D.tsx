import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface RacingTrack3DProps {
  speed: number;
  distance: number;
  isRacing: boolean;
  targetDistance: number;
}

function RacingTrack({ speed, distance, targetDistance }: { speed: number; distance: number; targetDistance: number }) {
  const trackRef = useRef<any>();
  const gridRef = useRef<any>();
  
  useFrame((state) => {
    if (trackRef.current && speed > 0) {
      trackRef.current.position.z += speed * 0.02;
      if (trackRef.current.position.z > 10) {
        trackRef.current.position.z = -10;
      }
    }
    
    if (gridRef.current && speed > 0) {
      gridRef.current.position.z += speed * 0.02;
      if (gridRef.current.position.z > 2) {
        gridRef.current.position.z = 0;
      }
    }
  });

  const progress = Math.min((distance / targetDistance) * 100, 100);

  return (
    <group>
      {/* Racing grid ground */}
      <group ref={gridRef}>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={i} position={[0, -1, -10 + i * 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8, 2]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#1f2937" : "#111827"}
              emissive="#00ffff"
              emissiveIntensity={0.1}
            />
          </mesh>
        ))}
      </group>
      
      {/* Neon side barriers */}
      {[-4, 4].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <boxGeometry args={[0.2, 2, 50]} />
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
      
      {/* Checkpoint gates */}
      {Array.from({ length: 5 }).map((_, i) => {
        const zPos = -10 + i * 10;
        const isPassed = (distance / targetDistance) > (i / 5);
        
        return (
          <group key={i} position={[0, 2, zPos]}>
            <mesh position={[-3.5, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
              <meshStandardMaterial
                color={isPassed ? "#10b981" : "#ef4444"}
                emissive={isPassed ? "#10b981" : "#ef4444"}
                emissiveIntensity={0.6}
              />
            </mesh>
            <mesh position={[3.5, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
              <meshStandardMaterial
                color={isPassed ? "#10b981" : "#ef4444"}
                emissive={isPassed ? "#10b981" : "#ef4444"}
                emissiveIntensity={0.6}
              />
            </mesh>
            {isPassed && (
              <pointLight
                position={[0, 0, 0]}
                intensity={3}
                distance={8}
                color="#10b981"
              />
            )}
          </group>
        );
      })}
      
      {/* Progress indicator */}
      <Html position={[0, 4, -5]} center>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary bg-background/90 px-6 py-3 rounded-lg border-2 border-primary backdrop-blur-sm mb-2">
            {distance.toFixed(1)} / {targetDistance} m
          </div>
          <div className="w-64 h-4 bg-muted rounded-full overflow-hidden border-2 border-border">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Html>
    </group>
  );
}

function HoverVehicle({ speed, lane }: { speed: number; lane: number }) {
  const vehicleRef = useRef<any>();
  
  useFrame((state) => {
    if (vehicleRef.current) {
      const targetX = lane * 2;
      vehicleRef.current.position.x += (targetX - vehicleRef.current.position.x) * 0.1;
      vehicleRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
      vehicleRef.current.rotation.z = (targetX - vehicleRef.current.position.x) * -0.3;
    }
  });

  return (
    <group ref={vehicleRef} position={[0, 0.5, 2]}>
      {/* Main body */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.6, 2]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Cockpit */}
      <mesh position={[0, 0.4, -0.3]} castShadow>
        <boxGeometry args={[0.8, 0.4, 0.8]} />
        <meshStandardMaterial
          color="#0088ff"
          transparent
          opacity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Engine glow */}
      <mesh position={[0, 0, 1.2]}>
        <cylinderGeometry args={[0.3, 0.4, 0.4, 16]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={1}
        />
      </mesh>
      
      {/* Speed trail */}
      {speed > 0 && (
        <pointLight
          position={[0, 0, 1.5]}
          intensity={speed * 0.5}
          distance={5}
          color="#ff00ff"
        />
      )}
      
      {/* Wings */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 0.1, 1.5]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.3}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ speed, distance, isRacing, targetDistance }: RacingTrack3DProps) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <pointLight position={[0, 5, 5]} intensity={2} distance={20} color="#00ffff" />
      
      {/* Atmospheric fog */}
      <fog attach="fog" args={['#000033', 10, 50]} />
      
      <RacingTrack speed={speed} distance={distance} targetDistance={targetDistance} />
      <HoverVehicle speed={speed} lane={0} />
      
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={true}
        target={[0, 0, 0]}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
      />
    </>
  );
}

export function RacingTrack3D(props: RacingTrack3DProps) {
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-border bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900">
      <Canvas camera={{ position: [0, 4, 8], fov: 60 }}>
        <Scene {...props} />
      </Canvas>
    </div>
  );
}
