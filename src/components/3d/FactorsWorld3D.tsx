import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

interface FactorBlock {
  value: number;
  position: [number, number, number];
  color: string;
  zone: 'forest' | 'valley' | 'tower';
}

interface FactorsWorld3DProps {
  factors: FactorBlock[];
  selectedFactors: number[];
  onFactorClick: (value: number) => void;
}

function FloatingIsland({ position, zone }: { position: [number, number, number]; zone: string }) {
  const meshRef = useRef<any>();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.3;
      meshRef.current.rotation.y += 0.002;
    }
  });

  const color = zone === 'forest' ? '#22c55e' : zone === 'valley' ? '#3b82f6' : '#a855f7';

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[2, 0.5, 2]} />
      <meshStandardMaterial color={color} metalness={0.4} roughness={0.6} />
    </mesh>
  );
}

function FactorCube({ factor, selected, onClick }: { factor: FactorBlock; selected: boolean; onClick: (value: number) => void }) {
  const meshRef = useRef<any>();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const baseY = factor.position[1] + 1.2;
      meshRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 1.5 + factor.position[0]) * 0.2;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.scale.setScalar(selected ? 1.3 : hovered ? 1.15 : 1);
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh
          ref={meshRef}
          position={factor.position}
          onClick={() => onClick(factor.value)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow
        >
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial
            color={factor.color}
            emissive={factor.color}
            emissiveIntensity={selected ? 0.6 : hovered ? 0.4 : 0.2}
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      </Float>
      
      {/* Glow effect */}
      {(selected || hovered) && (
        <pointLight
          position={factor.position}
          intensity={selected ? 3 : 2}
          distance={3}
          color={factor.color}
        />
      )}
      
      {/* Value label */}
      <Html position={[factor.position[0], factor.position[1] + 0.8, factor.position[2]]} center>
        <div className={`text-2xl font-bold px-3 py-2 rounded-lg border-2 backdrop-blur-sm transition-all ${
          selected ? 'bg-primary text-primary-foreground border-primary scale-110' : 'bg-background/90 text-foreground border-border'
        }`}>
          {factor.value}
        </div>
      </Html>
    </group>
  );
}

function ParticleField() {
  const pointsRef = useRef<any>();
  const particleCount = 100;
  
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = Math.random() * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0005;
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
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function Scene({ factors, selectedFactors, onFactorClick }: FactorsWorld3DProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, 5, -5]} intensity={0.5} color="#a855f7" />
      <pointLight position={[0, 5, 0]} intensity={1} distance={15} color="#fbbf24" />
      
      <ParticleField />
      
      {/* Floating Islands */}
      <FloatingIsland position={[-4, 0, -4]} zone="forest" />
      <FloatingIsland position={[0, 0, 0]} zone="valley" />
      <FloatingIsland position={[4, 0, 4]} zone="tower" />
      
      {/* Factor Cubes */}
      {factors.map((factor, index) => (
        <FactorCube
          key={index}
          factor={factor}
          selected={selectedFactors.includes(factor.value)}
          onClick={onFactorClick}
        />
      ))}
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={25}
      />
    </>
  );
}

export function FactorsWorld3D({ factors, selectedFactors, onFactorClick }: FactorsWorld3DProps) {
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-border bg-gradient-to-b from-background to-background-secondary">
      <Canvas camera={{ position: [10, 8, 10], fov: 50 }} shadows>
        <Scene factors={factors} selectedFactors={selectedFactors} onFactorClick={onFactorClick} />
      </Canvas>
    </div>
  );
}
