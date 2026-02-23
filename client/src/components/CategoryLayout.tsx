import { ReactNode } from 'react';

interface CategoryLayoutProps {
  categoryTitle: string;
  children: ReactNode;
}

export default function CategoryLayout({ categoryTitle, children }: CategoryLayoutProps) {
  return (
    <div className="min-h-screen bg-perforated text-white font-orbitron flex flex-col items-center p-4 pt-4 landscape:pt-2 pb-16">
      {/* Header */}
      <div className="text-center mb-2 landscape:mb-1">
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
      <div className="text-center mb-2 landscape:mb-1">
        <h1 className="text-yellow-400 text-lg font-bold font-audiowide animate-categoriesFlicker">
          {categoryTitle}
        </h1>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}