import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RacingTrack3D } from '@/components/3d/RacingTrack3D';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RacingGame() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isRacing, setIsRacing] = useState(false);
  const [targetDistance, setTargetDistance] = useState(100);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isRacing && distance < targetDistance) {
      interval = setInterval(() => {
        setDistance((prev) => Math.min(prev + speed * 0.1, targetDistance));
        setTimeElapsed((prev) => prev + 0.1);
      }, 100);
    } else if (distance >= targetDistance && isRacing) {
      setIsRacing(false);
      toast.success(`Race complete! Time: ${timeElapsed.toFixed(1)}s`);
      setScore(score + Math.floor((targetDistance / timeElapsed) * 10));
    }
    return () => clearInterval(interval);
  }, [isRacing, speed, distance, targetDistance]);

  const startRace = () => {
    setIsRacing(true);
    setSpeed(20);
    setDistance(0);
    setTimeElapsed(0);
    toast.info('Race started! 🏁');
  };

  const boostSpeed = () => {
    if (isRacing && speed < 50) {
      setSpeed(speed + 10);
      toast.success('Speed boost! 🚀');
    }
  };

  const brakeSpeed = () => {
    if (isRacing && speed > 10) {
      setSpeed(speed - 10);
      toast.info('Braking! 🛑');
    }
  };

  const resetRace = () => {
    setIsRacing(false);
    setSpeed(0);
    setDistance(0);
    setTimeElapsed(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 p-4">
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
            🏎️ Chrono Racers
          </h1>
          <p className="text-lg text-white/80 mb-2">
            Master speed, distance, and time calculations
          </p>
          <div className="flex gap-4 justify-center items-center">
            <div className="bg-white/10 px-6 py-3 rounded-lg border border-white/20 backdrop-blur-sm">
              <span className="text-sm text-white/60">Speed</span>
              <p className="text-2xl font-bold text-cyan-400">{speed} m/s</p>
            </div>
            <div className="bg-white/10 px-6 py-3 rounded-lg border border-white/20 backdrop-blur-sm">
              <span className="text-sm text-white/60">Time</span>
              <p className="text-2xl font-bold text-pink-400">{timeElapsed.toFixed(1)}s</p>
            </div>
            <div className="bg-white/10 px-6 py-3 rounded-lg border border-white/20 backdrop-blur-sm">
              <span className="text-sm text-white/60">Score</span>
              <p className="text-2xl font-bold text-yellow-400">{score}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-sm mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Mission:</h3>
          <p className="text-2xl font-bold text-cyan-400">
            Reach {targetDistance}m as fast as possible!
          </p>
          <div className="mt-4 flex gap-4 text-sm text-white/70">
            <div>Distance = Speed × Time</div>
            <div>•</div>
            <div>Current: {distance.toFixed(1)}m</div>
          </div>
        </div>

        <RacingTrack3D
          speed={speed}
          distance={distance}
          isRacing={isRacing}
          targetDistance={targetDistance}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Button
            onClick={startRace}
            size="lg"
            disabled={isRacing}
            className="bg-green-500 hover:bg-green-600"
          >
            🏁 Start Race
          </Button>
          <Button
            onClick={boostSpeed}
            size="lg"
            disabled={!isRacing || speed >= 50}
            className="bg-cyan-500 hover:bg-cyan-600"
          >
            🚀 Boost (+10)
          </Button>
          <Button
            onClick={brakeSpeed}
            size="lg"
            disabled={!isRacing || speed <= 10}
            className="bg-orange-500 hover:bg-orange-600"
          >
            🛑 Brake (-10)
          </Button>
          <Button
            onClick={resetRace}
            size="lg"
            variant="outline"
          >
            🔄 Reset
          </Button>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-cyan-500/20 p-4 rounded-lg border border-cyan-500/30 backdrop-blur-sm">
            <h4 className="font-bold text-cyan-400 mb-2">⚡ Speed</h4>
            <p className="text-sm text-white/70">Meters per second (m/s)</p>
            <p className="text-xs text-white/50 mt-1">Higher speed = faster travel</p>
          </div>
          <div className="bg-pink-500/20 p-4 rounded-lg border border-pink-500/30 backdrop-blur-sm">
            <h4 className="font-bold text-pink-400 mb-2">⏱️ Time</h4>
            <p className="text-sm text-white/70">Duration in seconds (s)</p>
            <p className="text-xs text-white/50 mt-1">Less time = better score</p>
          </div>
          <div className="bg-purple-500/20 p-4 rounded-lg border border-purple-500/30 backdrop-blur-sm">
            <h4 className="font-bold text-purple-400 mb-2">📏 Distance</h4>
            <p className="text-sm text-white/70">Total meters traveled (m)</p>
            <p className="text-xs text-white/50 mt-1">Distance = Speed × Time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
