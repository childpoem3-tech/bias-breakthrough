import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface CombinationItem {
  id: number;
  emoji: string;
  name: string;
  selected: boolean;
  color: string;
}

interface CombinationsHall3DProps {
  items: CombinationItem[];
  onItemClick: (id: number) => void;
  maxSelections: number;
}

function GuildHall() {
  const floorRef = useRef<any>();
  
  return (
    <>
      {/* Floor */}
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial
          color="#1f2937"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
      
      {/* Ambient pillars */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 7;
        const z = Math.sin(angle) * 7;
        return (
          <mesh key={i} position={[x, 1, z]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 4, 8]} />
            <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.4} />
          </mesh>
        );
      })}
    </>
  );
}

function ItemPedestal({ item, onClick, totalItems, currentSelections, maxSelections }: {
  item: CombinationItem;
  onClick: (id: number) => void;
  totalItems: number;
  currentSelections: number;
  maxSelections: number;
}) {
  const groupRef = useRef<any>();
  const [hovered, setHovered] = useState(false);
  
  const angle = (item.id / totalItems) * Math.PI * 2;
  const radius = 5;
  const baseX = Math.cos(angle) * radius;
  const baseZ = Math.sin(angle) * radius;
  
  const canSelect = item.selected || currentSelections < maxSelections;
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      groupRef.current.rotation.y = angle + time * 0.2;
      
      const baseY = 0;
      const hoverY = item.selected ? 0.8 : hovered ? 0.5 : 0;
      groupRef.current.position.y = baseY + hoverY + Math.sin(time * 2 + angle) * 0.1;
      
      const targetScale = item.selected ? 1.3 : hovered && canSelect ? 1.15 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[baseX, 0, baseZ]}
      onClick={() => canSelect && onClick(item.id)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Pedestal base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.8, 1, 1.5, 8]} />
        <meshStandardMaterial
          color={item.color}
          emissive={item.color}
          emissiveIntensity={item.selected ? 0.6 : hovered && canSelect ? 0.3 : 0.1}
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>
      
      {/* Top platform */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.9, 0.9, 0.3, 8]} />
        <meshStandardMaterial
          color={item.color}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      
      {/* Glow */}
      {(item.selected || (hovered && canSelect)) && (
        <pointLight
          position={[0, 1, 0]}
          intensity={item.selected ? 4 : 2}
          distance={4}
          color={item.color}
        />
      )}
      
      {/* Item display */}
      <Html position={[0, 2, 0]} center>
        <div className={`text-center transition-all ${item.selected || hovered ? 'scale-110' : ''}`}>
          <div className={`text-6xl mb-2 ${!canSelect && !item.selected ? 'opacity-50 grayscale' : ''}`}>
            {item.emoji}
          </div>
          <div className={`text-sm font-bold px-3 py-1 rounded-lg border backdrop-blur-sm ${
            item.selected
              ? 'bg-primary text-primary-foreground border-primary'
              : canSelect
              ? 'bg-background/90 text-foreground border-border'
              : 'bg-muted/50 text-muted-foreground border-muted'
          }`}>
            {item.name}
          </div>
        </div>
      </Html>
      
      {/* Selection ring */}
      {item.selected && (
        <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.3, 32]} />
          <meshBasicMaterial color={item.color} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function Scene({ items, onItemClick, maxSelections }: CombinationsHall3DProps) {
  const currentSelections = items.filter(item => item.selected).length;
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[0, 5, 0]} intensity={2} distance={15} color="#fbbf24" />
      <hemisphereLight args={['#ffffff', '#1f2937', 0.5]} />
      
      <GuildHall />
      
      {items.map((item) => (
        <ItemPedestal
          key={item.id}
          item={item}
          onClick={onItemClick}
          totalItems={items.length}
          currentSelections={currentSelections}
          maxSelections={maxSelections}
        />
      ))}
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

export function CombinationsHall3D({ items, onItemClick, maxSelections }: CombinationsHall3DProps) {
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-border bg-gradient-to-br from-amber-900 via-gray-900 to-purple-900">
      <Canvas camera={{ position: [0, 6, 12], fov: 50 }} shadows>
        <Scene items={items} onItemClick={onItemClick} maxSelections={maxSelections} />
      </Canvas>
    </div>
  );
}
