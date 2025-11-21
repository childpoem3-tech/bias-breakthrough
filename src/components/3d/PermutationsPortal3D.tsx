import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface PermutationKey {
  id: number;
  symbol: string;
  color: string;
  selected: boolean;
  order?: number;
}

interface PermutationsPortal3DProps {
  keys: PermutationKey[];
  onKeyClick: (id: number) => void;
  level: 'basic' | 'time' | 'chrono';
}

function Portal({ level }: { level: string }) {
  const portalRef = useRef<any>();
  const ringsRef = useRef<any>();
  
  useFrame((state) => {
    if (portalRef.current) {
      portalRef.current.rotation.z += 0.01;
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.z -= 0.008;
    }
  });

  const getColor = () => {
    switch (level) {
      case 'basic': return '#10b981';
      case 'time': return '#f59e0b';
      case 'chrono': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <group>
      {/* Main portal ring */}
      <mesh ref={portalRef} position={[0, 0, 0]}>
        <torusGeometry args={[2, 0.15, 16, 100]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Inner rings */}
      <mesh ref={ringsRef} position={[0, 0, 0]}>
        <torusGeometry args={[1.5, 0.08, 16, 100]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Portal center */}
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[2, 64]} />
        <MeshDistortMaterial
          color={getColor()}
          transparent
          opacity={0.3}
          distort={0.4}
          speed={2}
        />
      </mesh>
      
      {/* Portal light */}
      <pointLight
        position={[0, 0, 0]}
        intensity={5}
        distance={8}
        color={getColor()}
      />
    </group>
  );
}

function FloatingKey({ keyData, onClick, totalKeys }: { keyData: PermutationKey; onClick: (id: number) => void; totalKeys: number }) {
  const meshRef = useRef<any>();
  const [hovered, setHovered] = useState(false);
  
  // Calculate orbital position
  const angle = (keyData.id / totalKeys) * Math.PI * 2;
  const radius = 4;
  const baseX = Math.cos(angle) * radius;
  const baseZ = Math.sin(angle) * radius;
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      const orbitAngle = angle + time * 0.3;
      meshRef.current.position.x = Math.cos(orbitAngle) * radius;
      meshRef.current.position.z = Math.sin(orbitAngle) * radius;
      meshRef.current.position.y = Math.sin(time * 2 + angle) * 0.3;
      meshRef.current.rotation.y += 0.02;
      
      const targetScale = keyData.selected ? 1.4 : hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[baseX, 0, baseZ]}
        onClick={() => onClick(keyData.id)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <boxGeometry args={[0.6, 0.6, 0.2]} />
        <meshStandardMaterial
          color={keyData.color}
          emissive={keyData.color}
          emissiveIntensity={keyData.selected ? 0.7 : hovered ? 0.5 : 0.3}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      
      {/* Glow */}
      {(keyData.selected || hovered) && (
        <pointLight
          position={[baseX, 0, baseZ]}
          intensity={keyData.selected ? 4 : 2}
          distance={3}
          color={keyData.color}
        />
      )}
      
      {/* Label */}
      <Html position={[baseX, 0.8, baseZ]} center>
        <div className={`text-center transition-all ${keyData.selected || hovered ? 'scale-110' : ''}`}>
          <div className={`text-3xl font-bold px-3 py-2 rounded-lg border-2 backdrop-blur-sm ${
            keyData.selected 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'bg-background/90 text-foreground border-border'
          }`}>
            {keyData.symbol}
          </div>
          {keyData.selected && keyData.order !== undefined && (
            <div className="text-sm font-bold text-primary bg-background/90 px-2 py-1 rounded-full border border-primary mt-1">
              #{keyData.order}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

function ParticleSystem() {
  const pointsRef = useRef<any>();
  const particleCount = 200;
  
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const radius = 3 + Math.random() * 5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#8b5cf6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function Scene({ keys, onKeyClick, level }: PermutationsPortal3DProps) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 0, 0]} intensity={2} distance={10} color="#8b5cf6" />
      
      <ParticleSystem />
      <Portal level={level} />
      
      {keys.map((key) => (
        <FloatingKey
          key={key.id}
          keyData={key}
          onClick={onKeyClick}
          totalKeys={keys.length}
        />
      ))}
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={20}
      />
    </>
  );
}

export function PermutationsPortal3D({ keys, onKeyClick, level }: PermutationsPortal3DProps) {
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-border bg-gradient-to-br from-purple-900 via-black to-blue-900">
      <Canvas camera={{ position: [0, 3, 12], fov: 50 }} shadows>
        <Scene keys={keys} onKeyClick={onKeyClick} level={level} />
      </Canvas>
    </div>
  );
}
