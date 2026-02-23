import { useQuery, useQueryClient } from "@tanstack/react-query";
import { loadStickers } from "../lib/loadStickers";
import { StickerCard } from "./StickerCard";

interface StickerListProps {
  activeCategory: string | string[];
  subcategories?: Array<{ name: string; color: string }>;
  boxColor?: string;
}

export default function StickerList({ activeCategory, subcategories, boxColor = 'neon-border-cyan' }: StickerListProps) {
  const queryClient = useQueryClient();
  
  const { data: stickers, isLoading, error, refetch } = useQuery({
    queryKey: ['stickers', activeCategory],
    queryFn: async () => {
      const items = await loadStickers(activeCategory);
      
      console.log("Loaded stickers:", items.map(x => ({ asset_code: x.asset_code, category_name: x.category_name, url: x.url })).slice(0, 5));
      
      return items;
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-full">
            <div className="flex gap-3 overflow-x-auto px-4 pb-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className={`w-40 h-40 landscape:w-36 landscape:h-36 border-4 ${boxColor} flex items-center justify-center animate-pulse`}>
                  <span className="text-gray-500">Loading...</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    const orderedSubs = subcategories 
      ? subcategories.map(s => s.name)
      : ['Stickers'];
    
    return (
      <div className="grid grid-cols-1 landscape:grid-cols-2 gap-3 landscape:gap-4 max-w-lg landscape:max-w-4xl px-4">
        {orderedSubs.map((subcategoryName) => (
          <div key={subcategoryName} className={`w-40 h-40 landscape:w-36 landscape:h-36 border-4 ${boxColor} flex flex-col items-center justify-center`}>
            <span className="text-gray-500 text-sm text-center px-2 mb-2">{subcategoryName}</span>
            <button 
              onClick={() => refetch()}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              ↻ Retry
            </button>
          </div>
        ))}
      </div>
    );
  }

  // Prefix to category name mapping for fallback
  const prefixToName: Record<string, string> = {
    'MM': 'My Melody',
    'HK': 'Hello Kitty',
    'KJ': 'King Jesus',
    'GOD': 'God The Father',
    'HOS': 'Holy Spirit',
    'SCR': 'Scripture',
    'CRS': 'Crosses',
    'HRT': 'Hearts',
    'POC': 'Pochacco',
    'CIN': 'Cinnamoroll',
    'KUR': 'Kuromi',
    'TUX': 'Tuxedo Sam',
    'GUD': 'Gudetama',
    'LTS': 'Little Twin Stars',
    'KER': 'Keroppi',
    'BAD': 'Badtz-Maru',
    'RUR': 'Rururouni',
    'CHO': 'Chococat',
    'HS': 'Sayings',
    'FRZ': 'Frozen',
    'TLK': 'The Lion King',
    'TOY': 'Toy Story',
    'MOA': 'Moana',
    'ENC': 'Encanto',
    'TNG': 'Tangled',
    'FNM': 'Finding Nemo',
    'MON': 'Monsters Inc',
    'TLM': 'The Little Mermaid',
    'MKF': 'Mickey & Friends',
    'WTP': 'Winnie the Pooh',
    'CND': 'Cinderella',
    'BTB': 'Beauty & the Beast',
    'DS': 'Stitch',
  };

  // Group stickers by category_name from database (with prefix fallback)
  const groupedStickers: Record<string, typeof stickers> = {};
  
  stickers?.forEach((sticker) => {
    // Use category_name if available, otherwise fallback to prefix mapping
    const subcategory = sticker.category_name || prefixToName[sticker.category_prefix] || 'Other';
    
    if (!groupedStickers[subcategory]) {
      groupedStickers[subcategory] = [];
    }
    groupedStickers[subcategory]!.push(sticker);
  });

  // Get the order from subcategories prop if provided
  const orderedSubcategories = subcategories 
    ? subcategories.map(s => s.name)
    : Object.keys(groupedStickers).filter(name => (groupedStickers[name]?.length ?? 0) > 0);

  // Create a map of subcategory name to its border color
  const subcategoryColorMap: Record<string, string> = {};
  subcategories?.forEach(s => {
    // Convert bg-* to border-* (e.g., bg-blue-400 -> border-blue-400)
    const borderColor = s.color.replace('bg-', 'border-');
    subcategoryColorMap[s.name] = borderColor;
  });

  // Helper to get box border class for a subcategory
  const getBoxBorderClass = (subcategoryName: string) => {
    if (subcategoryColorMap[subcategoryName]) {
      return subcategoryColorMap[subcategoryName];
    }
    return boxColor;
  };

  // If no stickers, show empty boxes for each subcategory
  if (!stickers || stickers.length === 0) {
    return (
      <div className="grid grid-cols-1 landscape:grid-cols-2 gap-3 landscape:gap-4 max-w-lg landscape:max-w-4xl px-4">
        {orderedSubcategories.map((subcategoryName, idx) => (
          <div key={subcategoryName} className={`w-40 h-40 landscape:w-36 landscape:h-36 border-4 ${getBoxBorderClass(subcategoryName)} flex items-center justify-center`}>
            <span className="text-gray-500 text-sm text-center px-2">{subcategoryName}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 landscape:grid-cols-2 gap-3 landscape:gap-4 max-w-lg landscape:max-w-4xl px-4">
      {orderedSubcategories.map((subcategoryName) => {
        const subcategoryStickers = groupedStickers[subcategoryName];
        
        // Show empty box if no stickers for this subcategory
        if (!subcategoryStickers || subcategoryStickers.length === 0) {
          return (
            <div key={subcategoryName} className={`w-40 h-40 landscape:w-36 landscape:h-36 border-4 ${getBoxBorderClass(subcategoryName)} flex items-center justify-center`}>
              <span className="text-gray-500 text-sm text-center px-2">{subcategoryName}</span>
            </div>
          );
        }
        
        return (
          <div 
            key={subcategoryName}
            className={`w-40 h-40 landscape:w-36 landscape:h-36 border-4 ${getBoxBorderClass(subcategoryName)}
                       flex overflow-x-auto overflow-y-hidden auto-hide-scrollbar`}
            style={{ 
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
              touchAction: 'pan-x'
            }}
          >
            {subcategoryStickers.map((sticker) => (
              <StickerCard key={sticker.id} s={sticker} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
