import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Text, Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface Point3D {
  x: number;
  y: number;
  z: number;
  color: string;
}

interface CoordinateGrid3DProps {
  points: Point3D[];
  onPointClick?: (point: Point3D) => void;
  targetPoint?: { x: number; y: number; z: number } | null;
}

function AnimatedAxes() {
  return (
    <group>
      {/* X Axis - Red */}
      <Line
        points={[[-5, 0, 0], [5, 0, 0]]}
        color="#ef4444"
        lineWidth={4}
      />
      <mesh position={[5.3, 0, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
      <Text position={[5.8, 0, 0]} fontSize={0.5} color="#ef4444" fontWeight="bold">
        X
      </Text>
      
      {/* Y Axis - Green */}
      <Line
        points={[[0, -5, 0], [0, 5, 0]]}
        color="#22c55e"
        lineWidth={4}
      />
      <mesh position={[0, 5.3, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, 5.8, 0]} fontSize={0.5} color="#22c55e" fontWeight="bold">
        Y
      </Text>
      
      {/* Z Axis - Blue */}
      <Line
        points={[[0, 0, -5], [0, 0, 5]]}
        color="#3b82f6"
        lineWidth={4}
      />
      <mesh position={[0, 0, 5.3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, 0, 5.8]} fontSize={0.5} color="#3b82f6" fontWeight="bold">
        Z
      </Text>
    </group>
  );
}

function GridPlane() {
  const lines: JSX.Element[] = [];
  
  for (let i = -5; i <= 5; i++) {
    // XY plane grid
    lines.push(
      <Line key={`xy-h${i}`} points={[[-5, i, 0], [5, i, 0]]} color="#334155" lineWidth={1} transparent opacity={0.3} />,
      <Line key={`xy-v${i}`} points={[[i, -5, 0], [i, 5, 0]]} color="#334155" lineWidth={1} transparent opacity={0.3} />
    );
    // XZ plane grid (floor)
    lines.push(
      <Line key={`xz-h${i}`} points={[[-5, 0, i], [5, 0, i]]} color="#1e293b" lineWidth={1} transparent opacity={0.2} />,
      <Line key={`xz-v${i}`} points={[[i, 0, -5], [i, 0, 5]]} color="#1e293b" lineWidth={1} transparent opacity={0.2} />
    );
  }
  
  return <>{lines}</>;
}

function ClickablePoint({ 
  position, 
  onClick, 
  isTarget 
}: { 
  position: [number, number, number]; 
  onClick: () => void;
  isTarget: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isTarget) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.2);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[hovered ? 0.25 : 0.15, 16, 16]} />
        <meshStandardMaterial
          color={isTarget ? '#fbbf24' : hovered ? '#60a5fa' : '#475569'}
          emissive={isTarget ? '#fbbf24' : hovered ? '#60a5fa' : '#1e293b'}
          emissiveIntensity={isTarget ? 0.8 : hovered ? 0.5 : 0.1}
          transparent
          opacity={hovered || isTarget ? 1 : 0.5}
        />
      </mesh>
      
      {/* Coordinate tooltip on hover */}
      {hovered && (
        <Html position={[0, 0.5, 0]} center distanceFactor={8}>
          <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-xl text-sm font-mono font-bold whitespace-nowrap border border-primary/50 animate-fade-in">
            ({position[0]}, {position[1]}, {position[2]})
          </div>
        </Html>
      )}
    </group>
  );
}

function PlacedPoint({ point }: { point: Point3D }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const isCorrect = point.color === '#10b981';
  
  useFrame((state) => {
    if (meshRef.current) {
      if (isCorrect) {
        meshRef.current.rotation.y = state.clock.elapsedTime;
      }
      meshRef.current.position.y = point.y + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[point.x, point.y, point.z]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {isCorrect ? (
          <boxGeometry args={[0.3, 0.5, 0.3]} />
        ) : (
          <octahedronGeometry args={[0.2]} />
        )}
        <meshStandardMaterial
          color={point.color}
          emissive={point.color}
          emissiveIntensity={hovered ? 1 : 0.5}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      
      {/* Tower top for correct placements */}
      {isCorrect && (
        <mesh position={[point.x, point.y + 0.4, point.z]}>
          <coneGeometry args={[0.2, 0.3, 4]} />
          <meshStandardMaterial 
            color="#fbbf24" 
            emissive="#fbbf24" 
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
      
      {/* Glow effect */}
      <pointLight
        position={[point.x, point.y, point.z]}
        intensity={hovered ? 3 : 1}
        distance={2}
        color={point.color}
      />
      
      {/* Always visible label */}
      <Html position={[point.x, point.y + 0.8, point.z]} center distanceFactor={10}>
        <div className={`px-2 py-1 rounded text-xs font-mono font-bold whitespace-nowrap transition-all ${
          hovered 
            ? 'bg-white text-black scale-110 shadow-lg' 
            : 'bg-black/70 text-white'
        }`}>
          ({point.x}, {point.y}, {point.z})
        </div>
      </Html>
    </group>
  );
}

function InteractiveGrid({ onPointClick, targetPoint }: { onPointClick?: (point: Point3D) => void; targetPoint?: { x: number; y: number; z: number } | null }) {
  const clickablePoints = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let x = -4; x <= 4; x++) {
      for (let y = -4; y <= 4; y++) {
        for (let z = -4; z <= 4; z++) {
          // Only show points on integer coordinates
          if (x !== 0 || y !== 0 || z !== 0) {
            points.push([x, y, z]);
          }
        }
      }
    }
    return points;
  }, []);

  return (
    <>
      {clickablePoints.map((pos, i) => {
        const isTarget = targetPoint && pos[0] === targetPoint.x && pos[1] === targetPoint.y && pos[2] === targetPoint.z;
        return (
          <ClickablePoint
            key={i}
            position={pos}
            isTarget={!!isTarget}
            onClick={() => onPointClick?.({ x: pos[0], y: pos[1], z: pos[2], color: '' })}
          />
        );
      })}
    </>
  );
}

function Scene({ points, onPointClick, targetPoint }: CoordinateGrid3DProps) {
  return (
    <>
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 10, 30]} />
      
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#3b82f6" />
      <pointLight position={[10, -10, 5]} intensity={0.3} color="#8b5cf6" />
      
      <AnimatedAxes />
      <GridPlane />
      <InteractiveGrid onPointClick={onPointClick} targetPoint={targetPoint} />
      
      {points.map((point, index) => (
        <PlacedPoint key={index} point={point} />
      ))}
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={25}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export function CoordinateGrid3D({ points, onPointClick, targetPoint }: CoordinateGrid3DProps) {
  return (
    <div className="relative w-full">
      <div className="w-full h-[500px] rounded-xl overflow-hidden border-2 border-border bg-slate-900 shadow-2xl">
        <Canvas camera={{ position: [10, 8, 10], fov: 50 }} shadows>
          <Scene points={points} onPointClick={onPointClick} targetPoint={targetPoint} />
        </Canvas>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2 bg-background-secondary px-3 py-2 rounded-lg">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-muted-foreground">X-Axis</span>
        </div>
        <div className="flex items-center gap-2 bg-background-secondary px-3 py-2 rounded-lg">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-muted-foreground">Y-Axis</span>
        </div>
        <div className="flex items-center gap-2 bg-background-secondary px-3 py-2 rounded-lg">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-muted-foreground">Z-Axis</span>
        </div>
        <div className="flex items-center gap-2 bg-background-secondary px-3 py-2 rounded-lg">
          <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-muted-foreground">Target Point</span>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>🖱️ Hover over points to see coordinates • Click to place tower • Drag to rotate • Scroll to zoom</p>
      </div>
    </div>
  );
}
