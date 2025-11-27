import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
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
  const crystalRef = useRef<any>();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.3;
      meshRef.current.rotation.y += 0.002;
    }
    if (crystalRef.current) {
      crystalRef.current.rotation.y += 0.01;
      crystalRef.current.position.y = position[1] + 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  const color = zone === 'forest' ? '#22c55e' : zone === 'valley' ? '#3b82f6' : '#a855f7';

  return (
    <group>
      {/* Main Island */}
      <mesh ref={meshRef} position={position} castShadow receiveShadow>
        <cylinderGeometry args={[2, 1.5, 0.8, 8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      
      {/* Crystal on top */}
      <mesh ref={crystalRef} position={[position[0], position[1] + 0.8, position[2]]} castShadow>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Glow around island */}
      <pointLight position={[position[0], position[1] + 0.5, position[2]]} color={color} intensity={2} distance={4} />
    </group>
  );
}

function FactorCube({ factor, selected, onClick }: { factor: FactorBlock; selected: boolean; onClick: (value: number) => void }) {
  const meshRef = useRef<any>();
  const ringRef = useRef<any>();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const baseY = factor.position[1] + 1.2;
      meshRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 1.5 + factor.position[0]) * 0.2;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.scale.setScalar(selected ? 1.3 : hovered ? 1.15 : 1);
    }
    if (ringRef.current && (selected || hovered)) {
      ringRef.current.rotation.x += 0.02;
      ringRef.current.rotation.y += 0.03;
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
          receiveShadow
        >
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color={factor.color}
            emissive={factor.color}
            emissiveIntensity={selected ? 0.8 : hovered ? 0.5 : 0.3}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </Float>
      
      {/* Selection ring */}
      {(selected || hovered) && (
        <mesh
          ref={ringRef}
          position={[factor.position[0], factor.position[1] + 1.2, factor.position[2]]}
        >
          <torusGeometry args={[0.8, 0.05, 16, 32]} />
          <meshStandardMaterial
            color={factor.color}
            emissive={factor.color}
            emissiveIntensity={selected ? 1 : 0.6}
            metalness={1}
            roughness={0}
          />
        </mesh>
      )}
      
      {/* Glow effect */}
      {(selected || hovered) && (
        <>
          <pointLight
            position={factor.position}
            intensity={selected ? 4 : 2.5}
            distance={4}
            color={factor.color}
          />
          <Sphere args={[selected ? 1 : 0.8, 32, 32]} position={[factor.position[0], factor.position[1] + 1.2, factor.position[2]]}>
            <meshBasicMaterial color={factor.color} transparent opacity={selected ? 0.2 : 0.1} />
          </Sphere>
        </>
      )}
      
      {/* Value label */}
      <Html position={[factor.position[0], factor.position[1] + 2, factor.position[2]]} center>
        <div className={`text-2xl font-bold px-4 py-2 rounded-lg border-2 backdrop-blur-sm transition-all shadow-lg ${
          selected ? 'bg-primary text-primary-foreground border-primary scale-125 shadow-primary/50' : 'bg-background/90 text-foreground border-border'
        }`}>
          {factor.value}
        </div>
      </Html>
    </group>
  );
}

function ParticleField() {
  const pointsRef = useRef<any>();
  const particleCount = 200;
  
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0.13; colors[i * 3 + 1] = 0.77; colors[i * 3 + 2] = 0.37; // green
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 0.23; colors[i * 3 + 1] = 0.51; colors[i * 3 + 2] = 0.96; // blue
      } else {
        colors[i * 3] = 0.66; colors[i * 3 + 1] = 0.33; colors[i * 3 + 2] = 0.97; // purple
      }
    }
    
    return { positions, colors };
  }, []);
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0005;
      const positions = pointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
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
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function MagicOrbs() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <Float key={i} speed={2 + i * 0.5} rotationIntensity={0.5} floatIntensity={2}>
          <Sphere args={[0.2, 32, 32]} position={[(Math.random() - 0.5) * 15, 2 + i * 2, (Math.random() - 0.5) * 15]}>
            <MeshDistortMaterial
              color={i % 3 === 0 ? '#22c55e' : i % 3 === 1 ? '#3b82f6' : '#a855f7'}
              emissive={i % 3 === 0 ? '#22c55e' : i % 3 === 1 ? '#3b82f6' : '#a855f7'}
              emissiveIntensity={0.5}
              distort={0.3}
              speed={2}
            />
          </Sphere>
        </Float>
      ))}
    </>
  );
}

function Scene({ factors, selectedFactors, onFactorClick }: FactorsWorld3DProps) {
  return (
    <>
      <color attach="background" args={['#0a0a1a']} />
      <fog attach="fog" args={['#0a0a1a', 10, 35]} />
      
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-10, 5, -5]} intensity={0.6} color="#a855f7" />
      <pointLight position={[0, 8, 0]} intensity={2} distance={20} color="#fbbf24" />
      <spotLight position={[0, 15, 0]} angle={0.5} penumbra={1} intensity={1} castShadow color="#ffffff" />
      
      <ParticleField />
      <MagicOrbs />
      
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
      
      {/* Ground plane with grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0f0f2a" metalness={0.8} roughness={0.4} />
      </mesh>
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={30}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export function FactorsWorld3D({ factors, selectedFactors, onFactorClick }: FactorsWorld3DProps) {
  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10 bg-gradient-to-b from-background to-background-secondary">
      <Canvas 
        camera={{ position: [12, 10, 12], fov: 55 }} 
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <Scene factors={factors} selectedFactors={selectedFactors} onFactorClick={onFactorClick} />
      </Canvas>
    </div>
  );
}
