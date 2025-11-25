import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, RoundedBox, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

interface ProbabilityRealm3DProps {
  mode: 'dice' | 'urn' | 'cards';
  diceValue?: number;
  isRolling?: boolean;
  onRoll?: () => void;
  urnBalls?: { color: string; count: number }[];
}

function MagicParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(50 * 3);
    const colors = new Float32Array(50 * 3);
    for (let i = 0; i < 50; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = Math.random() * 8 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
      
      const color = new THREE.Color().setHSL(Math.random() * 0.3 + 0.7, 1, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 50; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.005;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={50} array={particles.positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={50} array={particles.colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.15} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function AnimatedDice({ value, isRolling, onRoll }: { value: number; isRolling: boolean; onRoll?: () => void }) {
  const diceRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (diceRef.current) {
      if (isRolling) {
        diceRef.current.rotation.x += 0.25;
        diceRef.current.rotation.y += 0.2;
        diceRef.current.rotation.z += 0.15;
        diceRef.current.position.y = 1.5 + Math.sin(state.clock.elapsedTime * 15) * 0.8;
      } else {
        diceRef.current.rotation.x = THREE.MathUtils.lerp(diceRef.current.rotation.x, 0, 0.1);
        diceRef.current.rotation.y = THREE.MathUtils.lerp(diceRef.current.rotation.y, 0, 0.1);
        diceRef.current.rotation.z = THREE.MathUtils.lerp(diceRef.current.rotation.z, 0, 0.1);
        diceRef.current.position.y = THREE.MathUtils.lerp(diceRef.current.position.y, 1, 0.1);
      }
    }
    if (glowRef.current) {
      glowRef.current.intensity = isRolling ? 8 + Math.sin(state.clock.elapsedTime * 20) * 4 : (hovered ? 5 : 2);
    }
  });

  const getDotPositions = (face: number): [number, number, number][] => {
    const offset = 0.52;
    const spacing = 0.28;
    
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
    <Float speed={isRolling ? 0 : 2} rotationIntensity={isRolling ? 0 : 0.2} floatIntensity={isRolling ? 0 : 0.5}>
      <group>
        <group
          ref={diceRef}
          onClick={onRoll}
          onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        >
          <RoundedBox args={[1, 1, 1]} radius={0.08} smoothness={4} castShadow>
            <meshStandardMaterial
              color="#ffffff"
              emissive={isRolling ? "#a855f7" : hovered ? "#fbbf24" : "#4f46e5"}
              emissiveIntensity={isRolling ? 0.8 : hovered ? 0.4 : 0.1}
              metalness={0.2}
              roughness={0.6}
            />
          </RoundedBox>
          
          {/* Dots for current face */}
          {!isRolling && getDotPositions(value).map((pos, i) => (
            <mesh key={i} position={pos}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#1e1b4b" />
            </mesh>
          ))}
        </group>
        
        <pointLight
          ref={glowRef}
          position={[0, 1, 0]}
          intensity={2}
          distance={8}
          color={isRolling ? "#a855f7" : "#fbbf24"}
        />
        
        {/* Rolling effect particles */}
        {isRolling && (
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial
              color="#a855f7"
              transparent
              opacity={0.2}
              wireframe
            />
          </mesh>
        )}
        
        {!isRolling && (
          <Html position={[0, 2.2, 0]} center>
            <div className="text-center animate-fade-in">
              <div className="text-5xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl border-2 border-purple-400/50 shadow-2xl shadow-purple-500/30">
                {value}
              </div>
              <p className="text-xs text-purple-300 mt-2">Click dice to roll</p>
            </div>
          </Html>
        )}
      </group>
    </Float>
  );
}

function MagicalUrn({ balls }: { balls: { color: string; count: number }[] }) {
  const urnRef = useRef<THREE.Group>(null);
  const ballsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (urnRef.current) {
      urnRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
    if (ballsRef.current) {
      ballsRef.current.children.forEach((ball, i) => {
        ball.position.y = ball.userData.baseY + Math.sin(state.clock.elapsedTime * 2 + i) * 0.05;
      });
    }
  });

  const totalBalls = balls.reduce((sum, b) => sum + b.count, 0);

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={urnRef}>
        {/* Urn body - glass effect */}
        <mesh castShadow>
          <cylinderGeometry args={[0.7, 0.9, 2, 32]} />
          <meshStandardMaterial
            color="#8b5cf6"
            metalness={0.3}
            roughness={0.1}
            transparent
            opacity={0.5}
          />
        </mesh>
        
        {/* Urn inner glow */}
        <mesh>
          <cylinderGeometry args={[0.65, 0.85, 1.9, 32]} />
          <meshStandardMaterial
            color="#4c1d95"
            emissive="#7c3aed"
            emissiveIntensity={0.3}
            transparent
            opacity={0.3}
          />
        </mesh>
        
        {/* Urn rim */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <torusGeometry args={[0.75, 0.12, 16, 32]} />
          <meshStandardMaterial color="#c084fc" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Balls inside */}
        <group ref={ballsRef}>
          {balls.flatMap((ball, ballType) =>
            Array.from({ length: ball.count }).map((_, i) => {
              const angle = ((ballType * ball.count + i) / totalBalls) * Math.PI * 2;
              const radius = 0.25 + (i % 2) * 0.2;
              const baseY = -0.5 + (i % 3) * 0.4;
              
              return (
                <mesh
                  key={`${ballType}-${i}`}
                  position={[Math.cos(angle) * radius, baseY, Math.sin(angle) * radius]}
                  userData={{ baseY }}
                >
                  <sphereGeometry args={[0.18, 24, 24]} />
                  <meshStandardMaterial
                    color={ball.color}
                    emissive={ball.color}
                    emissiveIntensity={0.5}
                    metalness={0.9}
                    roughness={0.1}
                  />
                </mesh>
              );
            })
          )}
        </group>
        
        <pointLight position={[0, 0, 0]} intensity={3} distance={5} color="#a855f7" />
        
        {/* Stats label */}
        <Html position={[0, 2.5, 0]} center>
          <div className="text-center bg-slate-900/90 px-4 py-2 rounded-lg border border-purple-500/30 backdrop-blur-sm">
            <p className="text-sm text-purple-300">Total Balls: <span className="font-bold text-white">{totalBalls}</span></p>
            <div className="flex gap-3 mt-1 justify-center">
              {balls.map((b, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }} />
                  <span className="text-xs text-slate-400">{b.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Html>
      </group>
    </Float>
  );
}

function MysticalGround() {
  const groundRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (groundRef.current) {
      const positions = (groundRef.current.geometry as THREE.PlaneGeometry).attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const wave = Math.sin(x * 0.3 + state.clock.elapsedTime) * 0.08 + Math.sin(z * 0.3 + state.clock.elapsedTime * 0.7) * 0.08;
        positions.setY(i, wave);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
      <planeGeometry args={[30, 30, 60, 60]} />
      <meshStandardMaterial
        color="#1e1b4b"
        emissive="#4c1d95"
        emissiveIntensity={0.1}
        metalness={0.8}
        roughness={0.3}
      />
    </mesh>
  );
}

function Scene({ mode, diceValue = 1, isRolling = false, onRoll, urnBalls = [] }: ProbabilityRealm3DProps) {
  return (
    <>
      <color attach="background" args={['#0a0a1a']} />
      <fog attach="fog" args={['#0a0a1a', 10, 40]} />
      
      <Stars radius={50} depth={50} count={1000} factor={3} saturation={0.5} fade speed={1} />
      <MagicParticles />
      
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 8, 0]} intensity={3} distance={20} color="#8b5cf6" />
      <pointLight position={[-5, 3, 5]} intensity={2} distance={15} color="#ec4899" />
      <pointLight position={[5, 3, -5]} intensity={2} distance={15} color="#3b82f6" />
      
      <MysticalGround />
      
      {mode === 'dice' && (
        <AnimatedDice value={diceValue} isRolling={isRolling} onRoll={onRoll} />
      )}
      
      {mode === 'urn' && (
        <MagicalUrn balls={urnBalls} />
      )}
      
      {mode === 'cards' && (
        <Float speed={2} rotationIntensity={0.3}>
          <Html center>
            <div className="text-center bg-gradient-to-br from-slate-900 to-purple-900 p-8 rounded-2xl border-2 border-purple-500/30 shadow-2xl">
              <div className="text-6xl mb-4">🃏</div>
              <p className="text-purple-300">Card mode coming soon!</p>
              <p className="text-sm text-slate-500 mt-2">52 cards, 4 suits</p>
            </div>
          </Html>
        </Float>
      )}
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={18}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export function ProbabilityRealm3D(props: ProbabilityRealm3DProps) {
  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden border-2 border-purple-500/30 bg-slate-950 shadow-2xl shadow-purple-500/10">
      <Canvas camera={{ position: [5, 4, 8], fov: 50 }} shadows>
        <Scene {...props} />
      </Canvas>
    </div>
  );
}
