import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CoordinateGrid3D } from '@/components/3d/CoordinateGrid3D';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CoordinatesGame() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState<any[]>([]);
  const [targetPoint, setTargetPoint] = useState({ x: 2, y: 3, z: 1 });

  const generateNewTarget = () => {
    setTargetPoint({
      x: Math.floor(Math.random() * 9) - 4,
      y: Math.floor(Math.random() * 9) - 4,
      z: Math.floor(Math.random() * 9) - 4,
    });
  };

  const handlePointClick = (point: any) => {
    if (
      point.x === targetPoint.x &&
      point.y === targetPoint.y &&
      point.z === targetPoint.z
    ) {
      toast.success('Correct! 🎯');
      setScore(score + 100);
      setLevel(level + 1);
      generateNewTarget();
      setPoints([...points, { ...targetPoint, color: '#10b981' }]);
    } else {
      toast.error('Try again! ❌');
      setPoints([...points, { ...point, color: '#ef4444' }]);
    }
  };

  const handlePlacePoint = () => {
    const newPoint = {
      x: Math.floor(Math.random() * 9) - 4,
      y: Math.floor(Math.random() * 9) - 4,
      z: Math.floor(Math.random() * 9) - 4,
      color: '#3b82f6',
    };
    setPoints([...points, newPoint]);
    toast.success('Point placed!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background p-4">
      <div className="container mx-auto py-8 max-w-6xl">
        <Button
          variant="outline"
          onClick={() => navigate('/home')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            🏙️ City of Coordinates
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Navigate the cyber-city grid in 3D space
          </p>
          <div className="flex gap-4 justify-center items-center">
            <div className="bg-background-secondary px-6 py-3 rounded-lg border border-border">
              <span className="text-sm text-muted-foreground">Level</span>
              <p className="text-2xl font-bold text-primary">{level}</p>
            </div>
            <div className="bg-background-secondary px-6 py-3 rounded-lg border border-border">
              <span className="text-sm text-muted-foreground">Score</span>
              <p className="text-2xl font-bold text-accent">{score}</p>
            </div>
          </div>
        </div>

        <div className="bg-background-secondary p-6 rounded-lg border border-border mb-6">
          <h3 className="text-xl font-bold mb-2">Find the Point:</h3>
          <p className="text-3xl font-bold text-primary">
            ({targetPoint.x}, {targetPoint.y}, {targetPoint.z})
          </p>
        </div>

        <CoordinateGrid3D points={points} onPointClick={handlePointClick} />

        <div className="flex gap-4 mt-6 justify-center">
          <Button onClick={handlePlacePoint} size="lg">
            Place Random Point
          </Button>
          <Button onClick={() => setPoints([])} variant="outline" size="lg">
            Clear All
          </Button>
          <Button onClick={generateNewTarget} variant="secondary" size="lg">
            New Target
          </Button>
        </div>

        <div className="mt-8 bg-background-secondary p-6 rounded-lg border border-border">
          <h3 className="text-xl font-bold mb-3">How to Play:</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>✅ Find and click the target coordinate in 3D space</li>
            <li>🔄 Use your mouse to rotate, zoom, and pan the view</li>
            <li>📍 Red axis = X, Green axis = Y, Blue axis = Z</li>
            <li>⭐ Each correct answer increases your score and level</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
