import { useEffect, useRef, useState, FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Helper Hook for Parallax Effect ---
// This custom hook tracks mouse movement and returns translational offsets.
const useParallax = (ref: React.RefObject<HTMLElement>, strength: number = 20) => {
  const [offsets, setOffsets] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Calculate mouse position from the center of the screen (-0.5 to 0.5)
      const xPos = (clientX / innerWidth) - 0.5;
      const yPos = (clientY / innerHeight) - 0.5;

      // Apply strength factor to create the parallax offset
      setOffsets({
        x: xPos * strength,
        y: yPos * strength,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [ref, strength]);

  return offsets;
};

// --- Animated Starry Background Component ---
// This component generates a dynamic, animated starfield.
const StarryBackground: FC = () => {
  const [stars, setStars] = useState<JSX.Element[]>([]);
  const [shootingStars, setShootingStars] = useState<JSX.Element[]>([]);

  useEffect(() => {
    // Generate static twinkling stars
    const generateStars = () => {
      const newStars = Array.from({ length: 150 }).map((_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${Math.random() * 2 + 1}px`,
          height: `${Math.random() * 2 + 1}px`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${Math.random() * 5 + 3}s`,
        };
        return <div key={`star-${i}`} className="star" style={style}></div>;
      });
      setStars(newStars);
    };

    // Generate shooting stars
    const generateShootingStars = () => {
      const newShootingStars = Array.from({ length: 5 }).map((_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10 + 2}s`,
          animationDuration: `${Math.random() * 2 + 1}s`,
        };
        return <div key={`shooting-star-${i}`} className="shooting-star" style={style}></div>;
      });
      setShootingStars(newShootingStars);
    };

    generateStars();
    generateShootingStars();
  }, []);

  return (
    <>
      {/* We inject CSS directly for complex, self-contained animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.5; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        .star {
          position: absolute;
          background-color: white;
          border-radius: 50%;
          animation: twinkle infinite ease-in-out;
        }
        @keyframes shoot {
          0% { transform: translateX(0) translateY(0); opacity: 1; }
          100% { transform: translateX(300px) translateY(300px); opacity: 0; }
        }
        .shooting-star {
          position: absolute;
          width: 2px;
          height: 80px;
          background: linear-gradient(to bottom, white, rgba(255, 255, 255, 0));
          transform-origin: top left;
          animation: shoot infinite linear;
          transform: rotate(-45deg);
        }
      `}</style>
      <div className="absolute inset-0 z-0 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        {stars}
        {shootingStars}
      </div>
    </>
  );
};


// --- Main NotFound Page Component ---
const NotFound = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply parallax with different strengths for depth
  const text404Offsets = useParallax(containerRef, 40);
  const athleteOffsets = useParallax(containerRef, -20); // Moves in the opposite direction

  useEffect(() => {
    // Log the error for debugging purposes
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div ref={containerRef} className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <StarryBackground />
      <div className="relative z-10 flex flex-col items-center text-center text-white p-6">
        {/* Parallax "404" Text */}
        <div
          className="relative transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${text404Offsets.x}px, ${text404Offsets.y}px)`,
          }}
        >
          <h1 className="text-8xl md:text-9xl font-black text-amber-400 opacity-80 tracking-widest">
            404
          </h1>
        </div>

        {/* Parallax Floating Athlete Image */}
        <div
          className="absolute -top-10 md:-top-20 w-32 h-32 md:w-48 md:h-48 transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${athleteOffsets.x}px, ${athleteOffsets.y}px)`,
          }}
        >
          {/* Replace with your own athlete SVG or image */}
          <img
            src="/lost-athlete.png" // Create a simple SVG like a person holding a ball
            alt="Lost Athlete"
            className="animate-float opacity-70"
          />
        </div>

        {/* Animated Text Content */}
        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Oops! You're Lost in Space.
          </h2>
          <p className="text-lg text-slate-300 max-w-md mx-auto mb-8">
            The page you are looking for has either been moved or never existed.
            Let's get you back on the field.
          </p>
          <Link to="/">
            <Button
              size="lg"
              className="font-bold text-slate-900 bg-amber-500 transition-all duration-300
               hover:bg-amber-400 hover:scale-105 hover:shadow-[0_0_25px_rgba(251,191,36,0.7)]"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Return to Home Base
            </Button>
          </Link>
        </div>
      </div>
      {/* CSS for simple animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(-10px); }
          50% { transform: translateY(10px); }
        }
        .animate-float {
          animation: float 6s infinite ease-in-out;
        }
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.8s both;
        }
      `}</style>
    </div>
  );
};

export default NotFound;