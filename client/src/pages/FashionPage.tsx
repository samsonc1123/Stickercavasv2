import { Link } from "wouter";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function FashionPage() {
  const subcategories = [
    { name: "Bathing Ape", code: "FSH-BAP" },
    { name: "Supreme", code: "FSH-SUP" },
    { name: "DC", code: "FSH-DC" },
    { name: "Spitfire", code: "FSH-SPI" },
    { name: "Toy Machine", code: "FSH-TOY" },
    { name: "Jordan", code: "FSH-JOR" },
    { name: "Gucci", code: "FSH-GUC" },
    { name: "Louis Vuitton", code: "FSH-LV" },
    { name: "Nike", code: "FSH-NIK" },
    { name: "Adidas", code: "FSH-ADI" },
    { name: "Palace", code: "FSH-PAL" }
  ];

  // Placeholder for Convex migration
  const allStickers: Record<string, any[]> = {};
  const isLoading = false;
  const uxTags: any[] = [];

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
        <h1 className="font-bold animate-categoriesFlicker font-audiowide text-lg" style={{ color: '#c3a343' }}>Fashion</h1>
        {uxTags && uxTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {uxTags.map((tag: any, idx: number) => (
              <span 
                key={idx} 
                className="text-[10px] px-2 py-0.5 rounded-full border border-[#c3a343]/30 text-[#c3a343]/70 uppercase tracking-wider font-montserrat"
              >
                {tag.tag_name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-start mb-2 landscape:mb-1 w-full">
        <div className="overflow-x-scroll overflow-y-hidden whitespace-nowrap px-4 py-2 w-full auto-hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', touchAction: 'pan-x' }}>
          <div className="flex">
            <Link href="/">
              <button className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 mx-1 hover:scale-105 transition-transform" style={{ color: 'white' }}>←</button>
            </Link>
            {subcategories.map((subcat) => (
              <button
                key={subcat.code}
                className="flex-shrink-0 rounded-full px-4 py-2 mx-1 font-montserrat hover:scale-105 transition-transform"
                style={{ backgroundColor: '#c3a343', color: 'black' }}
              >
                {subcat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="flex justify-center pb-4 landscape:pb-16">
          <div className="grid grid-cols-1 landscape:grid-cols-2 md:grid-cols-2 md:landscape:grid-cols-4 gap-3 landscape:gap-4 md:gap-5 max-w-lg landscape:max-w-4xl md:max-w-2xl md:landscape:max-w-6xl px-4">
            {subcategories.map((subcat) => {
              const subcatStickers = allStickers[subcat.code] || [];
              
              return (
                <div key={subcat.code} className="w-52 h-52 landscape:w-52 landscape:h-52 md:w-56 md:h-56 md:landscape:w-56 md:landscape:h-56 border-4 flex items-center justify-center overflow-hidden" style={{ borderColor: '#c3a343' }}>
                  {isLoading ? (
                    <span className="text-gray-500 animate-pulse text-sm">Loading...</span>
                  ) : subcatStickers.length > 0 ? (
                    <div 
                      className="flex h-full gap-2 overflow-x-auto w-full items-center px-2"
                      style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}
                    >
                      {subcatStickers.map((sticker: any, j: number) => (
                        <div key={j} className="flex-shrink-0 h-full flex items-center justify-center">
                          <img 
                            src={sticker.url} 
                            alt={sticker.asset_code || sticker.name}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-600 text-sm text-center px-2" style={{ color: '#c3a343' }}>{subcat.name}</span>
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
