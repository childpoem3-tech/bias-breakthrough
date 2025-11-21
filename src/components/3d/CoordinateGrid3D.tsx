import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Text, Html } from '@react-three/drei';
import { Vector3 } from 'three';

interface Point3D {
  x: number;
  y: number;
  z: number;
  color: string;
}

interface CoordinateGrid3DProps {
  points: Point3D[];
  onPointClick?: (point: Point3D) => void;
}

function AnimatedAxes() {
  const axesRef = useRef<any>();
  
  useFrame((state) => {
    if (axesRef.current) {
      axesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={axesRef}>
      {/* X Axis - Red */}
      <Line
        points={[[-5, 0, 0], [5, 0, 0]]}
        color="#ef4444"
        lineWidth={3}
      />
      <Text position={[5.5, 0, 0]} fontSize={0.4} color="#ef4444">
        X
      </Text>
      
      {/* Y Axis - Green */}
      <Line
        points={[[0, -5, 0], [0, 5, 0]]}
        color="#22c55e"
        lineWidth={3}
      />
      <Text position={[0, 5.5, 0]} fontSize={0.4} color="#22c55e">
        Y
      </Text>
      
      {/* Z Axis - Blue */}
      <Line
        points={[[0, 0, -5], [0, 0, 5]]}
        color="#3b82f6"
        lineWidth={3}
      />
      <Text position={[0, 0, 5.5]} fontSize={0.4} color="#3b82f6">
        Z
      </Text>
    </group>
  );
}

function GridPlane({ axis }: { axis: 'xy' | 'xz' | 'yz' }) {
  const lines: any[] = [];
  
  for (let i = -5; i <= 5; i++) {
    if (axis === 'xy') {
      lines.push(
        <Line key={`h${i}`} points={[[-5, i, 0], [5, i, 0]]} color="hsl(var(--muted))" lineWidth={0.5} transparent opacity={0.2} />,
        <Line key={`v${i}`} points={[[i, -5, 0], [i, 5, 0]]} color="hsl(var(--muted))" lineWidth={0.5} transparent opacity={0.2} />
      );
    }
  }
  
  return <>{lines}</>;
}

function AnimatedPoint({ point, onClick }: { point: Point3D; onClick?: (point: Point3D) => void }) {
  const meshRef = useRef<any>();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hovered ? 1.5 : 1);
      meshRef.current.position.y = point.y + Math.sin(state.clock.elapsedTime * 2 + point.x) * 0.1;
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[point.x, point.y, point.z]}
        onClick={() => onClick?.(point)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color={point.color}
          emissive={point.color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Particle effect */}
      {hovered && (
        <pointLight
          position={[point.x, point.y, point.z]}
          intensity={2}
          distance={2}
          color={point.color}
        />
      )}
      
      {/* Label */}
      <Html position={[point.x, point.y + 0.5, point.z]} center>
        <div className="text-xs text-foreground bg-background/90 px-2 py-1 rounded border border-border backdrop-blur-sm">
          ({point.x}, {point.y}, {point.z})
        </div>
      </Html>
    </group>
  );
}

function Scene({ points, onPointClick }: CoordinateGrid3DProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />
      
      <AnimatedAxes />
      <GridPlane axis="xy" />
      
      {points.map((point, index) => (
        <AnimatedPoint key={index} point={point} onClick={onPointClick} />
      ))}
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
      />
    </>
  );
}

export function CoordinateGrid3D({ points, onPointClick }: CoordinateGrid3DProps) {
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-border bg-background-secondary">
      <Canvas camera={{ position: [8, 6, 8], fov: 50 }}>
        <Scene points={points} onPointClick={onPointClick} />
      </Canvas>
    </div>
  );
}
