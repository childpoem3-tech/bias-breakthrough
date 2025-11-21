import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface ProbabilityRealm3DProps {
  mode: 'dice' | 'urn' | 'cards';
  diceValue?: number;
  isRolling?: boolean;
  onRoll?: () => void;
  urnBalls?: { color: string; count: number }[];
}

function AnimatedDice({ value, isRolling, onRoll }: { value: number; isRolling: boolean; onRoll?: () => void }) {
  const diceRef = useRef<any>();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (diceRef.current) {
      if (isRolling) {
        diceRef.current.rotation.x += 0.2;
        diceRef.current.rotation.y += 0.15;
        diceRef.current.rotation.z += 0.1;
        diceRef.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.5;
      } else {
        // Settle to show value
        diceRef.current.rotation.x = 0;
        diceRef.current.rotation.y = 0;
        diceRef.current.rotation.z = 0;
        diceRef.current.position.y = 1;
      }
    }
  });

  const getDotPositions = (face: number): [number, number, number][] => {
    const offset = 0.52;
    const spacing = 0.3;
    
    const patterns: Record<number, [number, number, number][]> = {
      1: [[0, offset, 0]],
      2: [[-spacing, offset, -spacing], [spacing, offset, spacing]],
      3: [[-spacing, offset, -spacing], [0, offset, 0], [spacing, offset, spacing]],
      4: [[-spacing, offset, -spacing], [spacing, offset, -spacing], [-spacing, offset, spacing], [spacing, offset, spacing]],
      5: [[-spacing, offset, -spacing], [spacing, offset, -spacing], [0, offset, 0], [-spacing, offset, spacing], [spacing, offset, spacing]],
      6: [[-spacing, offset, -spacing], [0, offset, -spacing], [spacing, offset, -spacing], [-spacing, offset, spacing], [0, offset, spacing], [spacing, offset, spacing]],
    };
    
    return patterns[face] || [];
  };

  return (
    <group>
      <group
        ref={diceRef}
        onClick={onRoll}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <RoundedBox args={[1, 1, 1]} radius={0.1} smoothness={4} castShadow>
          <meshStandardMaterial
            color="#ffffff"
            emissive={hovered ? "#fbbf24" : "#000000"}
            emissiveIntensity={hovered ? 0.3 : 0}
            metalness={0.3}
            roughness={0.7}
          />
        </RoundedBox>
        
        {/* Dots for current face */}
        {!isRolling && getDotPositions(value).map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        ))}
      </group>
      
      {(hovered || isRolling) && (
        <pointLight
          position={[0, 1, 0]}
          intensity={3}
          distance={5}
          color="#fbbf24"
        />
      )}
      
      {!isRolling && (
        <Html position={[0, 2, 0]} center>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary bg-background/90 px-4 py-2 rounded-lg border border-border backdrop-blur-sm">
              {value}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function MagicalUrn({ balls }: { balls: { color: string; count: number }[] }) {
  const urnRef = useRef<any>();
  
  useFrame((state) => {
    if (urnRef.current) {
      urnRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={urnRef}>
      {/* Urn body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.8, 1, 2, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Urn rim */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <torusGeometry args={[0.85, 0.1, 16, 32]} />
        <meshStandardMaterial color="#a855f7" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Balls inside */}
      {balls.flatMap((ball, ballType) =>
        Array.from({ length: ball.count }).map((_, i) => {
          const angle = ((ballType * ball.count + i) / balls.reduce((sum, b) => sum + b.count, 0)) * Math.PI * 2;
          const radius = 0.3 + Math.random() * 0.3;
          const height = -0.5 + Math.random() * 1;
          
          return (
            <mesh
              key={`${ballType}-${i}`}
              position={[
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
              ]}
            >
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial
                color={ball.color}
                emissive={ball.color}
                emissiveIntensity={0.4}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          );
        })
      )}
      
      <pointLight position={[0, 0, 0]} intensity={2} distance={4} color="#a855f7" />
    </group>
  );
}

function MysticalGround() {
  const groundRef = useRef<any>();
  
  useFrame((state) => {
    if (groundRef.current) {
      const positions = groundRef.current.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const wave = Math.sin(x * 0.5 + state.clock.elapsedTime) * 0.05 + Math.sin(z * 0.5 + state.clock.elapsedTime * 0.8) * 0.05;
        positions.setY(i, wave);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[20, 20, 50, 50]} />
      <meshStandardMaterial
        color="#1e1b4b"
        metalness={0.8}
        roughness={0.3}
      />
    </mesh>
  );
}

function Scene({ mode, diceValue = 1, isRolling = false, onRoll, urnBalls = [] }: ProbabilityRealm3DProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[0, 5, 0]} intensity={2} distance={15} color="#8b5cf6" />
      <hemisphereLight args={['#a78bfa', '#1e1b4b', 0.6]} />
      
      <MysticalGround />
      
      {mode === 'dice' && (
        <AnimatedDice value={diceValue} isRolling={isRolling} onRoll={onRoll} />
      )}
      
      {mode === 'urn' && (
        <MagicalUrn balls={urnBalls} />
      )}
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={15}
      />
    </>
  );
}

export function ProbabilityRealm3D(props: ProbabilityRealm3DProps) {
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-border bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <Canvas camera={{ position: [4, 4, 8], fov: 50 }} shadows>
        <Scene {...props} />
      </Canvas>
    </div>
  );
}
