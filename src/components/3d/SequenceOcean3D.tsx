import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

interface SequenceIsland {
  term: number;
  value: number;
  position: [number, number, number];
  type: 'ap' | 'gp' | 'series';
}

interface SequenceOcean3DProps {
  islands: SequenceIsland[];
  onIslandClick: (island: SequenceIsland) => void;
}

function Ocean() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const positions = (meshRef.current.geometry as THREE.PlaneGeometry).attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const wave1 = Math.sin(x * 0.3 + state.clock.elapsedTime) * 0.2;
        const wave2 = Math.sin(z * 0.4 + state.clock.elapsedTime * 0.8) * 0.15;
        const wave3 = Math.sin((x + z) * 0.2 + state.clock.elapsedTime * 1.2) * 0.1;
        positions.setY(i, wave1 + wave2 + wave3);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
      <planeGeometry args={[50, 50, 80, 80]} />
      <meshStandardMaterial
        color="#0369a1"
        transparent
        opacity={0.7}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

function WaterParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 10 - 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 200; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.01;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={200}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#60a5fa" transparent opacity={0.6} />
    </points>
  );
}

function FloatingIsland({ island, onClick }: { island: SequenceIsland; onClick: (island: SequenceIsland) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const baseY = island.position[1];
      groupRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 0.8 + island.position[0] * 0.5) * 0.4;
    }
    if (glowRef.current && hovered) {
      glowRef.current.intensity = 3 + Math.sin(state.clock.elapsedTime * 3) * 1;
    }
  });

  const getColor = () => {
    switch (island.type) {
      case 'ap': return '#10b981';
      case 'gp': return '#f59e0b';
      case 'series': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const isMissing = island.value === -1;
  const color = getColor();

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
      <group
        ref={groupRef}
        position={island.position}
        onClick={(e) => { e.stopPropagation(); onClick(island); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        {/* Island base with layers */}
        <mesh position={[0, -0.3, 0]} castShadow>
          <cylinderGeometry args={[1.3, 1.6, 0.6, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
        </mesh>
        
        <mesh castShadow>
          <cylinderGeometry args={[1.1, 1.3, 0.8, 8]} />
          <meshStandardMaterial
            color={isMissing ? '#0ea5e9' : color}
            emissive={isMissing ? '#0ea5e9' : color}
            emissiveIntensity={hovered ? 0.6 : 0.2}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        
        {/* Top platform */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[1, 1, 0.2, 8]} />
          <meshStandardMaterial
            color={isMissing ? '#38bdf8' : color}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Crystal/Beacon for missing term */}
        {isMissing && (
          <group position={[0, 1.2, 0]}>
            <mesh>
              <octahedronGeometry args={[0.4]} />
              <meshStandardMaterial
                color="#0ea5e9"
                emissive="#0ea5e9"
                emissiveIntensity={1}
                transparent
                opacity={0.8}
              />
            </mesh>
            <pointLight color="#0ea5e9" intensity={2} distance={3} />
          </group>
        )}

        {/* Number pillar for known values */}
        {!isMissing && (
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
          </mesh>
        )}
        
        {/* Glow effect */}
        <pointLight
          ref={glowRef}
          position={[0, 0, 0]}
          intensity={hovered ? 3 : 0.5}
          distance={5}
          color={isMissing ? '#0ea5e9' : color}
        />
        
        {/* Labels */}
        <Html position={[0, isMissing ? 2 : 2.2, 0]} center distanceFactor={8}>
          <div className={`text-center transition-all duration-300 ${hovered ? 'scale-110' : ''}`}>
            <div className="text-sm font-bold text-slate-300 bg-slate-900/90 px-3 py-1 rounded-t-lg border border-slate-700 backdrop-blur-sm">
              Term {island.term}
            </div>
            <div className={`text-2xl font-bold px-4 py-2 rounded-b-lg border border-t-0 backdrop-blur-sm ${
              isMissing 
                ? 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50 animate-pulse' 
                : 'text-white bg-slate-900/90 border-slate-700'
            }`}>
              {isMissing ? '?' : island.value}
            </div>
          </div>
        </Html>
      </group>
    </Float>
  );
}

function ConnectionLines({ islands }: { islands: SequenceIsland[] }) {
  if (islands.length < 2) return null;

  const points = islands.map(island => [island.position[0], island.position[1] + 0.5, island.position[2]] as [number, number, number]);

  return (
    <group>
      {points.slice(0, -1).map((point, i) => (
        <mesh key={i} position={[(point[0] + points[i + 1][0]) / 2, (point[1] + points[i + 1][1]) / 2, (point[2] + points[i + 1][2]) / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
          <meshStandardMaterial color="#60a5fa" transparent opacity={0.4} emissive="#60a5fa" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ islands, onIslandClick }: SequenceOcean3DProps) {
  return (
    <>
      <color attach="background" args={['#0c1929']} />
      <fog attach="fog" args={['#0c1929', 15, 40]} />
      
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-8, 8, -8]} intensity={0.4} color="#60a5fa" />
      <hemisphereLight args={['#60a5fa', '#0369a1', 0.5]} />
      
      <Ocean />
      <WaterParticles />
      <ConnectionLines islands={islands} />
      
      {islands.map((island, index) => (
        <FloatingIsland key={index} island={island} onClick={onIslandClick} />
      ))}
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={35}
        autoRotate
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
}

export function SequenceOcean3D({ islands, onIslandClick }: SequenceOcean3DProps) {
  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden border-2 border-slate-700 bg-gradient-to-b from-slate-900 to-blue-900 shadow-2xl">
      <Canvas camera={{ position: [15, 10, 15], fov: 50 }} shadows>
        <Scene islands={islands} onIslandClick={onIslandClick} />
      </Canvas>
    </div>
  );
}
