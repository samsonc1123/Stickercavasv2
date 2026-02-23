import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import "../styles/HomePage.css";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

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

const TYPE_NAME_MAP: Record<string, string> = {
  normal: "Normal",
  fire: "Fire",
  water: "Water",
  electric: "Electric",
  grass: "Grass",
  ice: "Ice",
  fighting: "Fighting",
  poison: "Poison",
  ground: "Ground",
  flying: "Flying",
  psychic: "Psychic",
  bug: "Bug",
  rock: "Rock",
  ghost: "Ghost",
  dragon: "Dragon",
  dark: "Dark",
  steel: "Steel",
  fairy: "Fairy",
};

const TYPES_SUBCATEGORY_CODE = "POK-TYP";

function slugType(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export default function PokemonTypeStickersPage() {
  const params = useParams<{ type: string }>();
  const typeKey = (params.type || "").toLowerCase();
  const typeName = TYPE_NAME_MAP[typeKey];
  const typeColor = TYPE_COLORS[typeKey] || "#facc15";

  // 1) Load all type groups (Normal/Fire/Water/etc) from Convex
  const groups =
    useQuery(api.groups.getGroupsBySubcategory, {
      subcategoryCode: TYPES_SUBCATEGORY_CODE,
      onlyActive: true,
    }) ?? [];

  // 2) Find the group matching this route param
  const currentGroup = useMemo(() => {
    return (groups as any[]).find((g) => slugType(g.name) === typeKey);
  }, [groups, typeKey]);

  // 3) Load stickers by groupCode (Tier-3)
  const stickers =
    useQuery(
      api.stickers.getStickersByGroupCode,
      currentGroup?.code ? { groupCode: currentGroup.code } : "skip"
    ) ?? [];

  // Secondary types derived from returned sticker fields (if they exist)
  const secondaryTypes = useMemo(() => {
    const set = new Set<string>();
    for (const s of stickers as any[]) {
      if (s.secondary_type) set.add(String(s.secondary_type));
    }
    return Array.from(set).sort();
  }, [stickers]);

  const [selectedSecondaryType, setSelectedSecondaryType] = useState<string | null>(null);

  const filteredStickers = useMemo(() => {
    if (!selectedSecondaryType) return stickers as any[];
    return (stickers as any[]).filter(
      (s) => String(s.secondary_type || "").toLowerCase() === selectedSecondaryType.toLowerCase()
    );
  }, [stickers, selectedSecondaryType]);

  if (!typeName) {
    return (
      <div className="min-h-screen bg-perforated text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Type not found</p>
          <Link href="/pokemon/types">
            <button className="bg-yellow-400 text-black px-4 py-2 rounded-full">
              Back to Types
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const isLoading = currentGroup?.code ? stickers === undefined : (groups as any) === undefined;

  return (
    <div className="min-h-screen bg-perforated text-white font-orbitron flex flex-col items-center p-4 pt-4 landscape:pt-2 pb-16">
      <div className="text-center mb-2 landscape:mb-1">
        <Link href="/">
          <div className="text-5xl font-cursive font-bold mb-2 cursor-pointer">
            <div className="flex flex-col items-center landscape:hidden">
              <div className="flex items-center">
                <span className="glow-yellow animate-flicker-extremely-slow-single">Stick</span>
                <span
                  className="text-pink-400 text-2xl transform rotate-12 inline-block mx-2"
                  style={{ fontFamily: "Pacifico, cursive" }}
                >
                  Them
                </span>
              </div>
              <span className="glow-yellow animate-flicker-extremely-slow-single">Anywhere</span>
            </div>

            <div className="hidden landscape:flex landscape:items-center landscape:justify-center landscape:gap-2 landscape:text-4xl">
              <span className="glow-yellow animate-flicker-extremely-slow-single">Stick</span>
              <span
                className="text-pink-400 text-xl transform rotate-12 inline-block"
                style={{ fontFamily: "Pacifico, cursive" }}
              >
                Them
              </span>
              <span className="glow-yellow animate-flicker-extremely-slow-single">Anywhere</span>
            </div>
          </div>
        </Link>
      </div>

      <div className="text-center mb-2 landscape:mb-1">
        <h1
          className="text-lg font-audiowide text-neon-yellow animate-categoriesFlicker"
          style={{ color: typeColor }}
        >
          {typeName} Stickers
        </h1>
      </div>

      <div className="w-full mb-4 px-4 flex flex-wrap items-center justify-center gap-2">
        <Link href="/pokemon/types">
          <button
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gray-600 hover:scale-105 transition-transform font-montserrat"
            style={{ color: "white" }}
          >
            ← Back
          </button>
        </Link>

        {secondaryTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedSecondaryType(null)}
              className={`px-3 py-1 rounded-full text-xs font-montserrat transition-all ${
                !selectedSecondaryType ? "ring-2 ring-white scale-105" : "opacity-70"
              }`}
              style={{ backgroundColor: typeColor, color: "black" }}
            >
              All {typeName}
            </button>

            {secondaryTypes.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedSecondaryType(t === selectedSecondaryType ? null : t)}
                className={`px-3 py-1 rounded-full text-xs font-montserrat transition-all ${
                  selectedSecondaryType === t ? "ring-2 ring-white scale-105" : "opacity-70"
                }`}
                style={{ backgroundColor: TYPE_COLORS[t.toLowerCase()] || "#555", color: "white" }}
              >
                + {TYPE_NAME_MAP[t.toLowerCase()] || t}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full">
        <div className="flex justify-center pb-4 landscape:pb-16">
          <div className="grid grid-cols-1 landscape:grid-cols-2 md:grid-cols-2 md:landscape:grid-cols-4 gap-3 landscape:gap-4 md:gap-5 max-w-lg landscape:max-w-4xl md:max-w-2xl md:landscape:max-w-6xl px-4">
            {isLoading ? (
              <div className="w-40 h-40 border-4 neon-border-cyan flex items-center justify-center">
                <span className="text-gray-500 animate-pulse">Loading...</span>
              </div>
            ) : filteredStickers.length === 0 ? (
              <div className="w-40 h-40 border-4 neon-border-cyan flex items-center justify-center">
                <span className="text-gray-500 text-sm text-center px-2">No stickers found</span>
              </div>
            ) : (
              (filteredStickers as any[]).map((sticker, i) => (
                <div
                  key={sticker._id ?? i}
                  className="w-52 h-52 landscape:w-52 landscape:h-52 md:w-56 md:h-56 md:landscape:w-56 md:landscape:h-56 border-4 neon-border-cyan overflow-hidden flex flex-col items-center justify-center hover:scale-105 transition-transform relative group"
                  style={{ borderColor: typeColor }}
                >
                  <img
                    src={sticker.imageUrl ?? sticker.image_url ?? sticker.url ?? ""}
                    alt={sticker.title ?? sticker.asset_code ?? sticker.name ?? "sticker"}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />

                  <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-1 rounded">
                    {sticker.primary_type && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[8px] uppercase font-bold text-white"
                        style={{
                          backgroundColor:
                            TYPE_COLORS[String(sticker.primary_type).toLowerCase()] || "#888",
                        }}
                      >
                        {sticker.primary_type}
                      </span>
                    )}
                    {sticker.secondary_type && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[8px] uppercase font-bold text-white"
                        style={{
                          backgroundColor:
                            TYPE_COLORS[String(sticker.secondary_type).toLowerCase()] || "#888",
                        }}
                      >
                        {sticker.secondary_type}
                      </span>
                    )}
                    {sticker.generation && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] uppercase font-bold bg-gray-700 text-white">
                        {sticker.generation}
                      </span>
                    )}
                    {sticker.legendary_tier && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] uppercase font-bold bg-neon-yellow text-black">
                        {sticker.legendary_tier}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}