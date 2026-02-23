import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { loadStickersBySubcategory } from '../lib/loadStickers';
import { sortAlphabetically } from '../utils/alphabeticalSort';
import '../styles/HomePage.css';

const subcategoriesData = [
  { name: 'Frozen', color: 'bg-blue-400', code: 'FRZ' },
  { name: 'The Lion King', color: 'bg-blue-400', code: 'TLK' },
  { name: 'Toy Story', color: 'bg-blue-400', code: 'TOY' },
  { name: 'Moana', color: 'bg-blue-400', code: 'MOA' },
  { name: 'Encanto', color: 'bg-blue-400', code: 'ENC' },
  { name: 'Tangled', color: 'bg-blue-400', code: 'TNG' },
  { name: 'Finding Nemo', color: 'bg-blue-400', code: 'FNM' },
  { name: 'Monsters Inc', color: 'bg-blue-400', code: 'MON' },
  { name: 'The Little Mermaid', color: 'bg-blue-400', code: 'TLM' },
  { name: 'Mickey & Friends', color: 'bg-blue-400', code: 'MKF' },
  { name: 'Winnie the Pooh', color: 'bg-blue-400', code: 'WTP' },
  { name: 'Cinderella', color: 'bg-blue-400', code: 'CND' },
  { name: 'Beauty & the Beast', color: 'bg-blue-400', code: 'BTB' },
  { name: 'Stitch', color: 'bg-blue-400', code: 'DS' },
];

const subcategories = sortAlphabetically(subcategoriesData);

export default function DisneyPage() {
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
    <div className="min-h-screen bg-perforated text-white font-orbitron flex flex-col items-center p-4 pt-4 landscape:pt-2 pb-16">
      <div className="text-center mb-2 landscape:mb-1">
        <Link href="/">
          <div className="text-5xl font-cursive font-bold mb-2 cursor-pointer">
            <div className="flex flex-col items-center landscape:hidden">
              <div className="flex items-center">
                <span className="glow-yellow animate-flicker-extremely-slow-single">Stick</span>
                <span className="text-pink-400 text-2xl transform rotate-12 inline-block mx-2" style={{ fontFamily: 'Pacifico, cursive' }}>Them</span>
              </div>
              <span className="glow-yellow animate-flicker-extremely-slow-single">Anywhere</span>
            </div>
            
            <div className="hidden landscape:flex landscape:items-center landscape:justify-center landscape:gap-2 landscape:text-4xl">
              <span className="glow-yellow animate-flicker-extremely-slow-single">Stick</span>
              <span className="text-pink-400 text-xl transform rotate-12 inline-block" style={{ fontFamily: 'Pacifico, cursive' }}>Them</span>
              <span className="glow-yellow animate-flicker-extremely-slow-single">Anywhere</span>
            </div>
          </div>
        </Link>
      </div>

      <div className="text-center mb-2 landscape:mb-1">
        <h1 className="font-bold text-yellow-400 animate-categoriesFlicker font-audiowide text-lg">Disney</h1>
      </div>

      <div className="overflow-x-scroll overflow-y-hidden whitespace-nowrap px-4 py-2 w-full mb-2 landscape:mb-1 auto-hide-scrollbar" 
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          touchAction: 'pan-x'
        }}
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

      <div className="w-full">
        <div className="flex justify-center pb-4 landscape:pb-16">
          <div className="grid grid-cols-1 landscape:grid-cols-2 md:grid-cols-2 md:landscape:grid-cols-4 gap-3 landscape:gap-4 md:gap-5 max-w-lg landscape:max-w-4xl md:max-w-2xl md:landscape:max-w-6xl px-4">
            {subcategories.map((sub, i) => {
              const stickers = stickersByCode[sub.code] || [];
              
              return (
                <div key={i} className="w-52 h-52 landscape:w-52 landscape:h-52 md:w-56 md:h-56 md:landscape:w-56 md:landscape:h-56 border-4 border-blue-400 flex items-center justify-center overflow-hidden">
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
