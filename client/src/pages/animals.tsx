import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { loadStickers } from "@/lib/loadStickers";

export default function AnimalsPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("turtles");

  // Subcategories with their prefixes for fetching stickers
  const subcategories = [
    { name: "Axolotls", slug: "axolotls", color: "bg-neon-aqua", prefix: "AXO" },
    { name: "Birds", slug: "birds", color: "bg-neon-aqua", prefix: "BRD" },
    { name: "Butterflys", slug: "butterflys", color: "bg-neon-aqua", prefix: "BTF" },
    { name: "Cats", slug: "cats", color: "bg-neon-aqua", prefix: "CAT" },
    { name: "Dogs", slug: "dogs", color: "bg-neon-aqua", prefix: "DOG" },
    { name: "Elephants", slug: "elephants", color: "bg-neon-aqua", prefix: "ELE" },
    { name: "Lions", slug: "lions", color: "bg-neon-aqua", prefix: "LIO" },
    { name: "Pandas", slug: "pandas", color: "bg-neon-aqua", prefix: "PAN" },
    { name: "Shellfish", slug: "shellfish", color: "bg-neon-aqua", prefix: "SHL" },
    { name: "Sharks", slug: "sharks", color: "bg-neon-aqua", prefix: "SHK" },
    { name: "Tigers", slug: "tigers", color: "bg-neon-aqua", prefix: "TIG" },
    { name: "Turtles", slug: "turtles", color: "bg-neon-aqua", prefix: "TUR" }
  ];

  // Get all prefixes for fetching
  const allPrefixes = subcategories.map(s => s.prefix);

  // Fetch all animal stickers
  const { data: stickers = [], isLoading } = useQuery({
    queryKey: ['stickers', 'animals', allPrefixes],
    queryFn: () => loadStickers(allPrefixes),
  });

  // Group stickers by their category_prefix
  const stickersByPrefix: Record<string, typeof stickers> = {};
  for (const s of stickers) {
    if (!stickersByPrefix[s.category_prefix]) {
      stickersByPrefix[s.category_prefix] = [];
    }
    stickersByPrefix[s.category_prefix].push(s);
  }

  return (
    <div className="min-h-screen bg-perforated text-white font-orbitron flex flex-col items-center p-4 pt-4 landscape:pt-2 pb-16">
      {/* Header */}
      <div className="text-center mb-2 landscape:mb-1">
        <Link href="/">
          <div className="text-5xl font-cursive font-bold mb-2 cursor-pointer">
            {/* Vertical Layout (Portrait) */}
            <div className="flex flex-col items-center landscape:hidden">
              <div className="flex items-center">
                <span className="glow-yellow animate-flicker-extremely-slow-single">Stick</span>
                <span className="text-pink-400 text-2xl transform rotate-12 inline-block mx-2" style={{ fontFamily: 'Pacifico, cursive' }}>Them</span>
              </div>
              <span className="glow-yellow animate-flicker-extremely-slow-single">Anywhere</span>
            </div>
            
            {/* Horizontal Layout (Landscape) */}
            <div className="hidden landscape:flex landscape:items-center landscape:justify-center landscape:gap-2 landscape:text-4xl">
              <span className="glow-yellow animate-flicker-extremely-slow-single">Stick</span>
              <span className="text-pink-400 text-xl transform rotate-12 inline-block" style={{ fontFamily: 'Pacifico, cursive' }}>Them</span>
              <span className="glow-yellow animate-flicker-extremely-slow-single">Anywhere</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Animals Header */}
      <div className="text-center mb-2 landscape:mb-1">
        <h1 className="font-bold text-yellow-400 animate-categoriesFlicker font-audiowide text-lg">Animals</h1>
      </div>

      {/* Subcategories */}
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
                style={{
                  color: 'black'
                }}
              >
                {subcat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stickers Vertical Grid with Horizontal Scrolling Inside Each Box */}
      <div className="w-full">
        <div className="flex justify-center pb-4 landscape:pb-16">
          <div className="grid grid-cols-1 landscape:grid-cols-2 md:grid-cols-2 md:landscape:grid-cols-4 gap-3 landscape:gap-4 md:gap-5 max-w-lg landscape:max-w-4xl md:max-w-2xl md:landscape:max-w-6xl px-4">
            {subcategories.map((subcat, i) => {
              const subcatStickers = stickersByPrefix[subcat.prefix] || [];
              
              return (
                <div
                  key={i}
                  className="w-52 h-52 landscape:w-52 landscape:h-52 md:w-56 md:h-56 md:landscape:w-56 md:landscape:h-56 border-4 neon-border-cyan overflow-hidden"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <span className="text-gray-500 animate-pulse">Loading...</span>
                    </div>
                  ) : subcatStickers.length > 0 ? (
                    <div 
                      className="flex gap-2 h-full overflow-x-auto items-center px-2"
                      style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}
                    >
                      {subcatStickers.map((sticker) => (
                        <img 
                          key={sticker.asset_code}
                          src={sticker.url} 
                          alt={sticker.name || subcat.name}
                          className="max-h-full max-w-full object-contain flex-shrink-0"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <span className="text-gray-500">{subcat.name}</span>
                    </div>
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