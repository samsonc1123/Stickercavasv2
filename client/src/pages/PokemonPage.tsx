import { Link } from "wouter";
import "../styles/HomePage.css";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

type Subcat = { code: string; name: string };

export default function PokemonPage() {
  const subcategories = [
    { code: "POK-TYP", name: "Types" },
    { code: "POK-GEN", name: "Generations" },
    { code: "POK-LGD", name: "Legendaries" },
  ];

  const isLoading = false;

  const getRouteForCode = (code: string) => {
    // routes: POK-TYP → /pokemon/types, POK-GEN → /pokemon/generations, POK-LGD → /pokemon/legendaries
    const parts = code.split("-");
    const segment = (parts[1] || "").toLowerCase();

    if (segment === "gen") return "/pokemon/generations";
    if (segment === "typ" || segment === "type") return "/pokemon/types";
    if (segment === "lgd" || segment === "legendary" || segment === "leg")
      return "/pokemon/legendaries";

    return `/pokemon/${segment}`;
  };

  const getButtonColor = (_code: string) => "#facc15";

  return (
    <div className="min-h-screen bg-perforated text-white font-orbitron flex flex-col items-center p-4 pt-4 landscape:pt-2 pb-16">
      <div className="text-center mb-2 landscape:mb-1">
        <Link href="/">
          <div className="text-5xl font-cursive font-bold mb-2 cursor-pointer">
            <div className="flex flex-col items-center landscape:hidden">
              <div className="flex items-center">
                <span className="glow-yellow animate-flicker-extremely-slow-single">
                  Stick
                </span>
                <span
                  className="text-pink-400 text-2xl transform rotate-12 inline-block mx-2"
                  style={{ fontFamily: "Pacifico, cursive" }}
                >
                  Them
                </span>
              </div>
              <span className="glow-yellow animate-flicker-extremely-slow-single">
                Anywhere
              </span>
            </div>

            <div className="hidden landscape:flex landscape:items-center landscape:justify-center landscape:gap-2 landscape:text-4xl">
              <span className="glow-yellow animate-flicker-extremely-slow-single">
                Stick
              </span>
              <span
                className="text-pink-400 text-xl transform rotate-12 inline-block"
                style={{ fontFamily: "Pacifico, cursive" }}
              >
                Them
              </span>
              <span className="glow-yellow animate-flicker-extremely-slow-single">
                Anywhere
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div className="text-center mb-2 landscape:mb-1">
        <h1 className="text-lg font-audiowide text-neon-yellow animate-categoriesFlicker">
          Pokémon
        </h1>
      </div>

      <div
        className="overflow-x-scroll overflow-y-hidden whitespace-nowrap px-4 py-2 w-full mb-2 landscape:mb-1 auto-hide-scrollbar"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
          touchAction: "pan-x",
        }}
      >
        <Link href="/">
          <button
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 mx-1 hover:scale-105 transition-transform"
            style={{ color: "white" }}
          >
            ←
          </button>
        </Link>

        {isLoading ? (
          <span className="text-gray-500 animate-pulse px-4">Loading...</span>
        ) : (subcategories?.length ?? 0) === 0 ? (
          <span className="text-gray-500 px-4">
            No Pokémon subcategories yet (add POK-* in Convex).
          </span>
        ) : (
          subcategories!.map((sub) => (
            <Link key={sub.code} href={getRouteForCode(sub.code)}>
              <button
                className="inline-block rounded-full px-4 py-2 mx-1 hover:scale-105 transition-transform font-montserrat"
                style={{ backgroundColor: getButtonColor(sub.code), color: "black" }}
              >
                {sub.name}
              </button>
            </Link>
          ))
        )}
      </div>

      <div className="w-full">
        <div className="flex justify-center pb-4 landscape:pb-16">
          <div className="grid grid-cols-1 landscape:grid-cols-2 md:grid-cols-2 md:landscape:grid-cols-3 gap-3 landscape:gap-4 max-w-lg landscape:max-w-4xl px-4">
            {isLoading ? (
              <div className="w-52 h-52 border-4 neon-border-cyan flex items-center justify-center">
                <span className="text-gray-500 animate-pulse">Loading...</span>
              </div>
            ) : (
              subcategories!.map((sub) => (
                <Link key={sub.code} href={getRouteForCode(sub.code)}>
                  <div className="w-52 h-52 landscape:w-52 landscape:h-52 md:w-56 md:h-56 md:landscape:w-56 md:landscape:h-56 border-4 neon-border-cyan overflow-hidden flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                    <span className="text-gray-400 text-lg font-montserrat">
                      {sub.name}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}