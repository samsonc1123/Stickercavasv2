import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { loadStickers } from "@/lib/loadStickers";

export default function UnicornsPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");

  const subcategories = [
    { name: "Rainbow", slug: "rainbow", color: "bg-pink-400", prefix: "UNI" }
  ];

  const { data: stickers = [], isLoading } = useQuery({
    queryKey: ['stickers', 'unicorns', 'UNI'],
    queryFn: () => loadStickers(['UNI']),
  });

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
        <h1 className="font-bold text-pink-400 animate-categoriesFlicker font-audiowide text-lg">Unicorns</h1>
      </div>

      <div className="flex justify-start mb-2 landscape:mb-1 w-full">
        <div className="overflow-x-scroll overflow-y-hidden whitespace-nowrap px-4 py-2 w-full auto-hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', touchAction: 'pan-x' }}>
          <div className="flex">
            <Link href="/">
              <button
                className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 mx-1 hover:scale-105 transition-transform"
                style={{ color: 'white' }}
                data-testid="button-back"
              >
                ←
              </button>
            </Link>
            {subcategories.map((subcat) => (
              <button
                key={subcat.name}
                onClick={() => setSelectedSubcategory(subcat.slug)}
                className={`flex-shrink-0 rounded-full ${subcat.color} px-4 py-2 mx-1 font-montserrat hover:scale-105 transition-transform`}
                style={{ color: 'black' }}
              >
                {subcat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="flex justify-center pb-4 landscape:pb-16 px-4">
          <div className="border-4 border-pink-400 w-40 h-40 landscape:w-36 landscape:h-36">
            <div className="overflow-x-scroll overflow-y-hidden whitespace-nowrap h-full w-full auto-hide-scrollbar flex items-center" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', touchAction: 'pan-x' }}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-pink-400 animate-pulse">Loading...</span>
                </div>
              ) : stickers.length > 0 ? (
                stickers.map((sticker, i) => (
                  <div key={i} className="flex-shrink-0 h-full flex items-center justify-center px-2">
                    <img 
                      src={sticker.url} 
                      alt={sticker.name || sticker.asset_code}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-gray-500">No stickers yet</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
