import { useEffect, useState } from 'react';
import { Link } from 'wouter';

interface SubcategoriesBarProps {
  categoryCode: string;
  selectedSubcategory: string | null;
  onSubcategorySelect?: (subcategory: string) => void;
  buttonColor?: string;
}

type Subcategory = {
  code: string;
  name: string;
};

const SubcategoriesBar: React.FC<SubcategoriesBarProps> = ({
  categoryCode,
  selectedSubcategory,
  onSubcategorySelect,
  buttonColor = 'bg-neon-aqua',
}) => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Supabase logic removed
  }, [categoryCode]);

  const handleSubcategorySelect = (subcategoryCode: string) => {
    if (onSubcategorySelect) {
      onSubcategorySelect(subcategoryCode);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-start mb-2 landscape:mb-1 w-full">
        <div className="overflow-x-scroll overflow-y-hidden whitespace-nowrap px-4 py-2 w-full auto-hide-scrollbar">
          <span className="text-gray-500 animate-pulse">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-2 landscape:mb-1 w-full">
      <div 
        className="overflow-x-scroll overflow-y-hidden whitespace-nowrap px-4 py-2 w-full auto-hide-scrollbar" 
        style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', touchAction: 'pan-x' }}
      >
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
          {subcategories.map((sub) => (
            <button
              key={sub.code}
              onClick={() => handleSubcategorySelect(sub.code)}
              className={`flex-shrink-0 rounded-full ${buttonColor} px-4 py-2 mx-1 font-montserrat hover:scale-105 transition-transform ${
                selectedSubcategory === sub.code ? 'ring-2 ring-white' : ''
              }`}
              style={{ color: 'black' }}
              data-testid={`button-subcategory-${sub.code}`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubcategoriesBar;
