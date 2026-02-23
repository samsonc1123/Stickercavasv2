import { Link } from "wouter";
import { sortAlphabetically } from '../utils/alphabeticalSort';
import SmokeEffect from '../components/SmokeEffect';
import { useState, useRef, useEffect } from "react";

const subcategoriesData = [
  { name: "Cannabis", color: "bg-green-500" }
];

const subcategories = sortAlphabetically(subcategoriesData);

export default function MarijuanaPage() {
  const [isRevealActive, setIsRevealActive] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Prevent default browser behavior like context menu or preview
    // Using both preventDefault and releasePointerCapture for maximum compatibility
    if (e.pointerType === 'touch') {
      const target = e.target as HTMLElement;
      target.releasePointerCapture(e.pointerId);
    }
    
    // Start timer for long press
    holdTimerRef.current = setTimeout(() => {
      setIsRevealActive(prev => !prev);
      // Brief vibration feedback if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Handle scroll events if needed
  };

  return (
    <div 
      className="h-screen bg-perforated-green text-white font-orbitron flex flex-col items-center p-4 pt-4 landscape:pt-2 overflow-hidden relative"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Reveal mode background wash */}
      <div 
        className={`fixed inset-0 pointer-events-none transition-opacity duration-300 z-0 bg-green-900/10 ${isRevealActive ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(34, 197, 94, 0.05) 0%, transparent 70%)`
        }}
      />

      {/* Smoke Backdrop */}
      <SmokeEffect isRevealActive={isRevealActive} />

      {/* Content wrapper to stay above smoke */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Header */}
        <div className="text-center mb-2 landscape:mb-1 relative">
          <div className="text-5xl font-cursive font-bold mb-2">
            {/* Vertical Layout (Portrait) */}
            <div className="flex flex-col items-start landscape:hidden">
              <span className="glow-green-outline animate-flicker-extremely-slow-single">Weed</span>
              <span className="glow-green-outline animate-flicker-extremely-slow-single">
                Sticker's
              </span>
            </div>
            
            {/* Horizontal Layout (Landscape) */}
            <div className="hidden landscape:flex landscape:flex-col landscape:items-start landscape:justify-center landscape:text-4xl">
              <span className="glow-green-outline animate-flicker-extremely-slow-single">Weed</span>
              <span className="glow-green-outline animate-flicker-extremely-slow-single">
                Sticker's
              </span>
            </div>
          </div>
        </div>


        {/* Cannabis Subtitle */}
        <div className="text-center mb-2 landscape:mb-1">
          <div className="flex items-center justify-center space-x-2">
            <span 
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="text-green-400 text-lg font-bold font-audiowide animate-flicker-slow cursor-pointer select-none"
              style={{ 
                touchAction: 'none', 
                WebkitUserSelect: 'none', 
                WebkitTouchCallout: 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                padding: '60px',
                margin: '-60px',
                position: 'relative',
                zIndex: 9999,
                display: 'inline-block'
              }}
            >
              Cannabis
            </span>
          </div>
        </div>

        {/* Cannabis Subcategory */}
        <div className="flex justify-start mb-2 landscape:mb-1 w-full relative">
          <div 
            className="overflow-x-scroll overflow-y-hidden whitespace-nowrap pl-4 pr-4 py-2 w-full auto-hide-scrollbar" 
            style={{ 
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
              touchAction: 'pan-x'
            }}
            onScroll={handleScroll}
          >
            <Link href="/">
              <button
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 mx-1 hover:scale-105 transition-transform"
                style={{ color: 'white' }}
                data-testid="button-back"
              >
                ←
              </button>
            </Link>
            {subcategories.map((sub, i) => (
              <button
                key={i}
                className={`inline-block rounded-full ${sub.color} px-4 py-2 mx-1 hover:scale-105 transition-transform font-montserrat`}
                style={{ 
                  color: 'black'
                }}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sticker Boxes */}
        <div className="w-full">
          <div className="flex justify-center pb-4 landscape:pb-16">
            <div className="grid grid-cols-1 landscape:grid-cols-2 gap-3 landscape:gap-4 max-w-lg landscape:max-w-4xl px-4">
              {subcategories.map((sub, i) => (
                <div key={i} className="w-52 h-52 landscape:w-36 landscape:h-36 border-4 flex items-center justify-center" style={{borderColor: '#22c55e', boxShadow: '0 0 8px #22c55e'}}>
                  <div className="flex items-center justify-center w-full h-full">
                    <span className="text-gray-500">{sub.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}