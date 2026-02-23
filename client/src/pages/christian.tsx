import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { loadStickersBySubcategory } from '../lib/loadStickers';
import '../styles/HomePage.css';
import { sortAlphabetically } from '../utils/alphabeticalSort';

const subcategoriesData = [
  { name: 'King Jesus', color: 'bg-gold', code: 'KJ' },
  { name: 'God The Father', color: 'bg-gold', code: 'GOD' },
  { name: 'Holy Spirit', color: 'bg-gold', code: 'HS' },
  { name: 'Scripture', color: 'bg-gold', code: 'SCR' },
  { name: 'Crosses', color: 'bg-gold', code: 'CRS' },
  { name: 'Hearts', color: 'bg-gold', code: 'HRT' },
];

const subcategories = sortAlphabetically(subcategoriesData);

export default function ChristianPage() {
  const [stickersByCode, setStickersByCode] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAllStickers() {
      setIsLoading(true);
      const data: Record<string, any[]> = {};
      
      for (const sub of subcategories) {
        try {
          const stickers = await loadStickersBySubcategory(sub.code);
          data[sub.code] = stickers;
        } catch (err) {
          console.error(`Error loading stickers for ${sub.code}:`, err);
          data[sub.code] = [];
        }
      }
      
      setStickersByCode(data);
      setIsLoading(false);
    }
    
    fetchAllStickers();
  }, []);

  return (
    <div className="min-h-screen bg-perforated text-white font-orbitron flex flex-col items-center p-4 pt-4 landscape:pt-2 pb-16 relative">
      {/* Twinkling Gold Stars Background */}
      <div className="absolute top-0 left-0 w-full h-32 pointer-events-none overflow-hidden">
        <div className="animate-twinkle-gold absolute top-4 left-8 text-3xl">✨</div>
        <div className="animate-twinkle-gold absolute top-6 right-12 text-2xl" style={{ animationDelay: '0.5s' }}>⭐</div>
        <div className="animate-twinkle-gold absolute top-12 left-1/4 text-2xl" style={{ animationDelay: '1s' }}>✨</div>
        <div className="animate-twinkle-gold absolute top-8 right-1/3 text-3xl" style={{ animationDelay: '1.5s' }}>⭐</div>
        <div className="animate-twinkle-gold absolute top-16 left-1/3 text-2xl" style={{ animationDelay: '0.7s' }}>✨</div>
        <div className="animate-twinkle-gold absolute top-10 right-1/4 text-2xl" style={{ animationDelay: '1.2s' }}>⭐</div>
      </div>

      {/* Header */}
      <div className="text-center mb-2 landscape:mb-1 relative z-10">
        <div className="text-5xl font-cursive font-bold mb-2">
          {/* Portrait layout */}
          <div className="flex flex-col items-center landscape:hidden">
            <div className="flex items-center">
              <span className="glow-yellow animate-flicker-extremely-slow-single">Stick</span>
              <span className="text-pink-400 text-2xl transform rotate-12 inline-block mx-2" style={{ fontFamily: 'Pacifico, cursive' }}>Them</span>
            </div>
            <span className="glow-yellow animate-flicker-extremely-slow-single">Anywhere</span>
          </div>
          {/* Landscape layout */}
          <div className="hidden landscape:flex landscape:items-center landscape:justify-center landscape:gap-2 landscape:text-4xl">
            <span className="glow-yellow animate-flicker-extremely-slow-single">Stick</span>
            <span className="text-pink-400 text-xl transform rotate-12 inline-block" style={{ fontFamily: 'Pacifico, cursive' }}>Them</span>
            <span className="glow-yellow animate-flicker-extremely-slow-single">Anywhere</span>
          </div>
        </div>
      </div>

      {/* Category Title */}
      <div className="text-center mb-2 landscape:mb-1 relative z-10">
        <h1 className="text-gold font-bold text-lg font-audiowide animate-categoriesFlicker" style={{ color: '#FFD700' }}>
          Christian
        </h1>
      </div>

      {/* Subcategories */}
      <div className="flex justify-start mb-2 landscape:mb-1 w-full relative">
        <div
          className="overflow-x-scroll overflow-y-hidden whitespace-nowrap pl-4 pr-4 py-2 w-full auto-hide-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', touchAction: 'pan-x' }}
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
              className={`inline-block rounded-full px-4 py-2 mx-1 hover:scale-105 transition-transform font-montserrat`}
              style={{ backgroundColor: '#FFD700', color: 'black' }}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Christian Stickers Grid - each box scrolls horizontally */}
      <div className="w-full">
        <div className="flex justify-center pb-4 landscape:pb-16">
          <div className="grid grid-cols-1 landscape:grid-cols-2 md:grid-cols-2 md:landscape:grid-cols-4 gap-3 landscape:gap-4 md:gap-5 max-w-lg landscape:max-w-4xl md:max-w-2xl md:landscape:max-w-6xl px-4">
            {subcategories.map((sub, i) => {
              const stickers = stickersByCode[sub.code] || [];
              
              return (
                <div key={i} className="w-52 h-52 landscape:w-52 landscape:h-52 md:w-56 md:h-56 md:landscape:w-56 md:landscape:h-56 border-4 border-yellow-400 flex items-center justify-center overflow-hidden">
                  {isLoading ? (
                    <span className="text-gray-500 animate-pulse text-sm">Loading...</span>
                  ) : stickers.length > 0 ? (
                    <div 
                      className="flex h-full gap-2 overflow-x-auto w-full items-center px-2"
                      style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}
                    >
                      {stickers.map((sticker, j) => (
                        <div key={j} className="flex-shrink-0 h-full flex items-center justify-center">
                          <img 
                            src={sticker.url} 
                            alt={sticker.asset_code}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm text-center px-2">{sub.name}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}