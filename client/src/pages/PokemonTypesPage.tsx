import { Link } from "wouter";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import "../styles/HomePage.css";

const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

type Group = {
  code: string;
  name: string;
  subcategoryCode: string;
  isActive?: boolean;
  sortOrder?: number;
};

const TYPES_SUBCATEGORY_CODE = "POK-TYP";

function slugType(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export default function PokemonTypesPage() {
  const groups =
    (useQuery(api.groups.getGroupsBySubcategory, {
      subcategoryCode: TYPES_SUBCATEGORY_CODE,
      onlyActive: true,
    }) as Group[] | undefined) ?? undefined;

  const groupCodes = useMemo(
    () => (groups ? groups.map((g) => g.code) : []),
    [groups]
  );

  const counts =
    useQuery(
      api.stickers.getStickerCountsByGroupCodes,
      groups ? { groupCodes } : "skip"
    ) ?? undefined;

  const isLoading = groups === undefined || counts === undefined;

  const typeGroups = useMemo(() => {
    const unique = new Map<string, Group>();
    (groups ?? []).forEach(g => {
      if (g.isActive !== false && !unique.has(g.code)) {
        unique.set(g.code, g);
      }
    });
    
    // Convert back to array and sort
    return Array.from(unique.values()).sort((a, b) => {
      const ao = a.sortOrder ?? 0;
      const bo = b.sortOrder ?? 0;
      if (ao !== bo) return ao - bo;
      return a.name.localeCompare(b.name);
    });
  }, [groups]);

  return (
    <div className="min-h-screen bg-perforated text-white font-orbitron flex flex-col items-center p-4 pt-18 pb-16">
      <div className="text-center mb-4">
        <Link href="/">
          <div className="text-5xl font-cursive font-bold mb-4 cursor-pointer">
            <span className="glow-yellow animate-flicker-extremely-slow-single">Stick</span>
            <span
              className="text-pink-400 text-2xl transform rotate-12 inline-block mx-2"
              style={{ fontFamily: "Pacifico, cursive" }}
            >
              Them
            </span>
            <span className="glow-yellow animate-flicker-extremely-slow-single">Anywhere</span>
          </div>
        </Link>
        <h1 className="text-lg font-audiowide text-neon-yellow animate-categoriesFlicker">
          Pokémon Types
        </h1>
      </div>

      <div
        className="overflow-x-scroll overflow-y-hidden whitespace-nowrap px-4 py-2 w-full mb-8 auto-hide-scrollbar"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
          touchAction: "pan-x",
        }}
      >
        <Link href="/pokemon">
          <button
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 mx-1 hover:scale-105 transition-transform font-montserrat"
            style={{ color: "white" }}
          >
            ←
          </button>
        </Link>

        {isLoading ? (
          <span className="text-gray-500 animate-pulse font-montserrat">Loading...</span>
        ) : typeGroups.length === 0 ? (
          <span className="text-gray-500 font-montserrat px-4">
            No type groups yet. Seed groups under {TYPES_SUBCATEGORY_CODE}.
          </span>
        ) : (
          typeGroups.map((g) => {
            const typeKey = slugType(g.name);
            const color = TYPE_COLORS[typeKey] || "#facc15";
            const count = (counts as any)?.[g.code] ?? 0;

            return (
              <Link key={g.code} href={`/pokemon/type/${typeKey}`}>
                <button
                  className="inline-block rounded-full px-4 py-2 mx-1 font-montserrat hover:scale-105 transition-transform uppercase text-sm"
                  style={{
                    backgroundColor: color,
                    color: typeKey === "electric" || typeKey === "ice" ? "black" : "white",
                  }}
                >
                  {g.name} {count > 0 ? `(${count})` : ""}
                </button>
              </Link>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 landscape:grid-cols-2 md:grid-cols-2 md:landscape:grid-cols-4 gap-3 landscape:gap-4 md:gap-5 max-w-lg landscape:max-w-4xl md:max-w-2xl md:landscape:max-w-6xl px-4">
        {!isLoading &&
          typeGroups.map((g) => {
            const typeKey = slugType(g.name);
            const color = TYPE_COLORS[typeKey] || "#555";
            const count = (counts as any)?.[g.code] ?? 0;

            return (
              <Link key={g.code} href={`/pokemon/type/${typeKey}`}>
                <div
                  className="w-52 h-52 landscape:w-52 landscape:h-52 md:w-56 md:h-56 md:landscape:w-56 md:landscape:h-56 border-4 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform relative group bg-black/40 overflow-hidden"
                  style={{ borderColor: color }}
                >
                  <div className="text-center w-full px-2 z-10">
                    <span
                      className="text-xs font-audiowide uppercase tracking-widest"
                      style={{ color }}
                    >
                      {g.name}
                    </span>

                    <div className="mt-2 text-[10px] opacity-40 uppercase font-bold">
                      {count > 0 ? `${count} sticker${count === 1 ? "" : "s"}` : "No stickers yet"}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
      </div>

      <div className="mt-12">
        <Link href="/pokemon">
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-2 rounded-full font-montserrat uppercase tracking-widest border border-white/20 transition-all">
            Back to Pokemon
          </button>
        </Link>
      </div>
    </div>
  );
}