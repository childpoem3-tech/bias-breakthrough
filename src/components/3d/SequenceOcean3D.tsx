import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';

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
  const meshRef = useRef<any>();
  
  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const wave1 = Math.sin(x * 0.5 + state.clock.elapsedTime) * 0.1;
        const wave2 = Math.sin(z * 0.3 + state.clock.elapsedTime * 0.8) * 0.08;
        positions.setY(i, wave1 + wave2);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[30, 30, 50, 50]} />
      <meshStandardMaterial
        color="#1e40af"
        transparent
        opacity={0.6}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function FloatingIsland({ island, onClick }: { island: SequenceIsland; onClick: (island: SequenceIsland) => void }) {
  const groupRef = useRef<any>();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (groupRef.current) {
      const baseY = island.position[1];
      groupRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime + island.position[0]) * 0.3;
      groupRef.current.rotation.y += 0.005;
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

  return (
    <group
      ref={groupRef}
      position={island.position}
      onClick={() => onClick(island)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Island base */}
      <mesh castShadow>
        <cylinderGeometry args={[1, 1.2, 0.8, 6]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {/* Top platform */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.9, 0.9, 0.2, 6]} />
        <meshStandardMaterial
          color={getColor()}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Glow */}
      {hovered && (
        <pointLight
          position={[0, 0, 0]}
          intensity={3}
          distance={4}
          color={getColor()}
        />
      )}
      
      {/* Labels */}
      <Html position={[0, 1.2, 0]} center>
        <div className={`text-center transition-all ${hovered ? 'scale-110' : ''}`}>
          <div className="text-lg font-bold text-foreground bg-background/90 px-3 py-1 rounded-t-lg border border-border backdrop-blur-sm">
            Term {island.term}
          </div>
          <div className="text-2xl font-bold text-primary bg-background/90 px-3 py-2 rounded-b-lg border border-border border-t-0 backdrop-blur-sm">
            {island.value}
          </div>
        </div>
      </Html>
    </group>
  );
}

function Scene({ islands, onIslandClick }: SequenceOcean3DProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#60a5fa" />
      <hemisphereLight args={['#87ceeb', '#1e40af', 0.6]} />
      
      <Ocean />
      
      {islands.map((island, index) => (
        <FloatingIsland key={index} island={island} onClick={onIslandClick} />
      ))}
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={30}
      />
    </>
  );
}

export function SequenceOcean3D({ islands, onIslandClick }: SequenceOcean3DProps) {
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-border bg-gradient-to-b from-sky-200 to-blue-500">
      <Canvas camera={{ position: [12, 8, 12], fov: 50 }} shadows>
        <Scene islands={islands} onIslandClick={onIslandClick} />
      </Canvas>
    </div>
  );
}
