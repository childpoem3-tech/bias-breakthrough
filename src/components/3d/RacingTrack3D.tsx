import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Trail } from '@react-three/drei';
import * as THREE from 'three';

interface RacingTrack3DProps {
  speed: number;
  distance: number;
  isRacing: boolean;
  targetDistance: number;
}

function SpeedParticles({ speed, isRacing }: { speed: number; isRacing: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = Math.random() * 5;
      positions[i * 3 + 2] = Math.random() * -30;
    }
    return positions;
  }, []);

  useFrame(() => {
    if (particlesRef.current && isRacing && speed > 0) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 100; i++) {
        positions[i * 3 + 2] += speed * 0.05;
        if (positions[i * 3 + 2] > 10) {
          positions[i * 3 + 2] = -30;
          positions[i * 3] = (Math.random() - 0.5) * 10;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!isRacing) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={100}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#00ffff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function RacingTrack({ speed, distance, targetDistance }: { speed: number; distance: number; targetDistance: number }) {
  const trackRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (trackRef.current && speed > 0) {
      trackRef.current.children.forEach((child, i) => {
        if (child.type === 'Group') {
          child.position.z += speed * 0.02;
          if (child.position.z > 12) {
            child.position.z = -28;
          }
        }
      });
    }
  });

  const progress = Math.min((distance / targetDistance) * 100, 100);

  return (
    <group>
      {/* Racing grid ground */}
      <group ref={trackRef}>
        {Array.from({ length: 20 }).map((_, i) => (
          <group key={i} position={[0, 0, -28 + i * 2]}>
            <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[8, 2]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? "#1a1a2e" : "#0f0f1a"}
                emissive="#00ffff"
                emissiveIntensity={0.05}
              />
            </mesh>
            {/* Center line glow */}
            <mesh position={[0, -0.99, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.1, 2]} />
              <meshStandardMaterial
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={0.5}
                transparent
                opacity={0.5}
              />
            </mesh>
          </group>
        ))}
      </group>
      
      {/* Neon side barriers with glow */}
      {[-4, 4].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0, 0]}>
            <boxGeometry args={[0.15, 1.5, 50]} />
            <meshStandardMaterial
              color={x < 0 ? "#ff00ff" : "#00ffff"}
              emissive={x < 0 ? "#ff00ff" : "#00ffff"}
              emissiveIntensity={1}
            />
          </mesh>
          <pointLight
            position={[x, 0.5, 0]}
            intensity={2}
            distance={6}
            color={x < 0 ? "#ff00ff" : "#00ffff"}
          />
        </group>
      ))}
      
      {/* Checkpoint gates */}
      {Array.from({ length: 5 }).map((_, i) => {
        const zPos = -10 + i * 10;
        const isPassed = (distance / targetDistance) > (i / 5);
        
        return (
          <group key={i} position={[0, 0, zPos]}>
            {/* Gate pillars */}
            {[-3.5, 3.5].map((x, j) => (
              <mesh key={j} position={[x, 1, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 3, 16]} />
                <meshStandardMaterial
                  color={isPassed ? "#10b981" : "#ef4444"}
                  emissive={isPassed ? "#10b981" : "#ef4444"}
                  emissiveIntensity={isPassed ? 1 : 0.5}
                />
              </mesh>
            ))}
            {/* Gate top bar */}
            <mesh position={[0, 2.5, 0]}>
              <boxGeometry args={[7.2, 0.15, 0.15]} />
              <meshStandardMaterial
                color={isPassed ? "#10b981" : "#ef4444"}
                emissive={isPassed ? "#10b981" : "#ef4444"}
                emissiveIntensity={isPassed ? 1 : 0.5}
              />
            </mesh>
            {isPassed && (
              <pointLight
                position={[0, 2, 0]}
                intensity={5}
                distance={10}
                color="#10b981"
              />
            )}
          </group>
        );
      })}
      
      {/* Progress indicator */}
      <Html position={[0, 5, -5]} center>
        <div className="text-center">
          <div className="text-4xl font-bold text-cyan-400 bg-slate-900/90 px-6 py-3 rounded-xl border-2 border-cyan-500/50 backdrop-blur-sm mb-2 shadow-lg shadow-cyan-500/20">
            {distance.toFixed(1)} / {targetDistance} m
          </div>
          <div className="w-64 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-300 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

function HoverVehicle({ speed }: { speed: number }) {
  const vehicleRef = useRef<THREE.Group>(null);
  const engineRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (vehicleRef.current) {
      vehicleRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
      vehicleRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 3) * 0.02;
    }
    if (engineRef.current && speed > 0) {
      engineRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 20) * 0.2;
    }
  });

  return (
    <Trail
      width={speed > 0 ? 2 : 0}
      length={6}
      color={new THREE.Color("#ff00ff")}
      attenuation={(t) => t * t}
    >
      <group ref={vehicleRef} position={[0, 0.5, 2]}>
        {/* Main body */}
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.5, 2.2]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00d4ff"
            emissiveIntensity={0.4}
            metalness={0.95}
            roughness={0.05}
          />
        </mesh>
        
        {/* Cockpit */}
        <mesh position={[0, 0.35, -0.2]} castShadow>
          <boxGeometry args={[0.7, 0.35, 0.7]} />
          <meshStandardMaterial
            color="#0088ff"
            transparent
            opacity={0.7}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        
        {/* Engine glow */}
        <mesh ref={engineRef} position={[0, 0, 1.3]}>
          <cylinderGeometry args={[0.25, 0.35, 0.5, 16]} />
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={speed > 0 ? 2 : 0.3}
          />
        </mesh>
        
        {/* Wings */}
        {[-0.9, 0.9].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.3]} castShadow>
            <boxGeometry args={[0.4, 0.08, 1.6]} />
            <meshStandardMaterial
              color="#00d4ff"
              emissive="#00d4ff"
              emissiveIntensity={0.3}
              metalness={0.95}
              roughness={0.05}
            />
          </mesh>
        ))}
        
        {/* Speed effects */}
        {speed > 0 && (
          <>
            <pointLight
              position={[0, 0, 1.8]}
              intensity={speed * 0.3}
              distance={8}
              color="#ff00ff"
            />
            <pointLight
              position={[0, 0, -1]}
              intensity={2}
              distance={4}
              color="#00ffff"
            />
          </>
        )}
      </group>
    </Trail>
  );
}

function Scene({ speed, distance, isRacing, targetDistance }: RacingTrack3DProps) {
  return (
    <>
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 15, 50]} />
      
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.4} />
      <pointLight position={[0, 8, 5]} intensity={3} distance={25} color="#00ffff" />
      <pointLight position={[0, 8, -10]} intensity={2} distance={20} color="#ff00ff" />
      
      <SpeedParticles speed={speed} isRacing={isRacing} />
      <RacingTrack speed={speed} distance={distance} targetDistance={targetDistance} />
      <HoverVehicle speed={speed} />
      
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
    <div className="w-full h-[500px] rounded-2xl overflow-hidden border-2 border-cyan-500/30 bg-slate-950 shadow-2xl shadow-cyan-500/10">
      <Canvas camera={{ position: [0, 4, 10], fov: 60 }} shadows>
        <Scene {...props} />
      </Canvas>
    </div>
  );
}
