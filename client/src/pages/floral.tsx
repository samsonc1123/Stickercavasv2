import React from 'react';
import { Link } from 'wouter';
import StickerList from '../components/StickerList';
import '../styles/HomePage.css';
import { sortAlphabetically } from '../utils/alphabeticalSort';

const subcategoriesData = [
  { name: 'Words in Flowers', color: 'bg-neon-aqua' },
  { name: 'Flowers and Words', color: 'bg-neon-aqua' },
  { name: 'Flowers Around Words', color: 'bg-neon-aqua' },
];

const subcategories = sortAlphabetically(subcategoriesData);

export default function FloralPage() {
  return (
    <div className="min-h-screen bg-perforated text-white font-orbitron flex flex-col items-center p-4 pt-4 landscape:pt-2 pb-16">
      {/* Header */}
      <div className="text-center mb-2 landscape:mb-1">
        <Link href="/">
          <div className="text-5xl font-cursive font-bold mb-2 cursor-pointer">
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
        </Link>
      </div>

      {/* Category Title */}
      <div className="text-center mb-2 landscape:mb-1 mt-[72px]">
        <h1 className="text-yellow-400 text-lg font-bold font-audiowide animate-categoriesFlicker">
          Christian Floral
        </h1>
      </div>

      {/* Subcategories */}
      <div className="flex justify-start mb-2 landscape:mb-1 w-full relative">
        <div
          className="overflow-x-scroll overflow-y-hidden whitespace-nowrap pl-4 pr-4 py-2 w-full auto-hide-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}
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
              style={{ color: 'black' }}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stickers Grid */}
      <div className="w-full">
        <div className="flex justify-center pb-4 landscape:pb-16">
          <StickerList activeCategory="FLR" />
        </div>
      </div>
    </div>
  );
}