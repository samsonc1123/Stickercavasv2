import { query } from "./_generated/server";

const UNDERSCORE_RE = /_/;
const CANONICAL_CODE_RE = /^[A-Z0-9]+(-[A-Z0-9]+)*$/;

export const runAudit = query({
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    const subcategories = await ctx.db.query("subcategories").collect();
    const groups = await ctx.db.query("groups").collect();
    const stickerGroupLinks = await ctx.db.query("stickerGroupLinks").collect();

    let underscoreCodes = 0;
    let nonCanonicalCodes = 0;
    const underscoreDetails: string[] = [];
    const nonCanonicalDetails: string[] = [];

    for (const c of categories) {
      if (UNDERSCORE_RE.test(c.code)) {
        underscoreCodes++;
        underscoreDetails.push(`category:${c.code}`);
      }
      if (!CANONICAL_CODE_RE.test(c.code)) {
        nonCanonicalCodes++;
        nonCanonicalDetails.push(`category:${c.code}`);
      }
    }
    for (const s of subcategories) {
      if (UNDERSCORE_RE.test(s.code) || UNDERSCORE_RE.test(s.categoryCode)) {
        underscoreCodes++;
        underscoreDetails.push(`subcategory:${s.categoryCode}/${s.code}`);
      }
      if (!CANONICAL_CODE_RE.test(s.code)) {
        nonCanonicalCodes++;
        nonCanonicalDetails.push(`subcategory:${s.code}`);
      }
      if (!CANONICAL_CODE_RE.test(s.categoryCode)) {
        nonCanonicalCodes++;
        nonCanonicalDetails.push(`subcategory.categoryCode:${s.categoryCode}`);
      }
    }
    for (const g of groups) {
      if (UNDERSCORE_RE.test(g.code) || UNDERSCORE_RE.test(g.subcategoryCode)) {
        underscoreCodes++;
        underscoreDetails.push(`group:${g.subcategoryCode}/${g.code}`);
      }
      if (!CANONICAL_CODE_RE.test(g.code)) {
        nonCanonicalCodes++;
        nonCanonicalDetails.push(`group:${g.code}`);
      }
      if (!CANONICAL_CODE_RE.test(g.subcategoryCode)) {
        nonCanonicalCodes++;
        nonCanonicalDetails.push(`group.subcategoryCode:${g.subcategoryCode}`);
      }
    }
    for (const l of stickerGroupLinks) {
      if (UNDERSCORE_RE.test(l.groupCode) || UNDERSCORE_RE.test(l.stickerCode)) {
        underscoreCodes++;
        underscoreDetails.push(`link:${l.stickerCode}->${l.groupCode}`);
      }
      if (!CANONICAL_CODE_RE.test(l.groupCode)) {
        nonCanonicalCodes++;
        nonCanonicalDetails.push(`link.groupCode:${l.groupCode}`);
      }
    }

    const catDupMap = new Map<string, number>();
    for (const c of categories) {
      catDupMap.set(c.code, (catDupMap.get(c.code) || 0) + 1);
    }
    const duplicateCategories = Array.from(catDupMap.entries())
      .filter(([, count]) => count > 1)
      .map(([code, count]) => ({ code, count }));

    const subDupMap = new Map<string, number>();
    for (const s of subcategories) {
      const key = `${s.categoryCode}|${s.code}`;
      subDupMap.set(key, (subDupMap.get(key) || 0) + 1);
    }
    const duplicateSubcategories = Array.from(subDupMap.entries())
      .filter(([, count]) => count > 1)
      .map(([key, count]) => ({ key, count }));

    const grpDupMap = new Map<string, number>();
    for (const g of groups) {
      const key = `${g.subcategoryCode}|${g.code}`;
      grpDupMap.set(key, (grpDupMap.get(key) || 0) + 1);
    }
    const duplicateGroups = Array.from(grpDupMap.entries())
      .filter(([, count]) => count > 1)
      .map(([key, count]) => ({ key, count }));

    const totalDuplicates = duplicateCategories.reduce((s, d) => s + d.count - 1, 0)
      + duplicateSubcategories.reduce((s, d) => s + d.count - 1, 0)
      + duplicateGroups.reduce((s, d) => s + d.count - 1, 0);

    const categoryCounts: Record<string, number> = {};
    for (const c of categories) {
      categoryCounts[c.code] = subcategories.filter(s => s.categoryCode === c.code).length;
    }

    const subcategoryCounts: Record<string, number> = {};
    for (const s of subcategories) {
      subcategoryCounts[`${s.categoryCode}/${s.code}`] = groups.filter(g => g.subcategoryCode === s.code).length;
    }

    const pokemonGroupCodes = [
      "GEN-01", "GEN-02", "GEN-03", "GEN-04", "GEN-05",
      "GEN-06", "GEN-07", "GEN-08", "GEN-09",
      "LEGENDARY", "MYTHICAL", "ULTRA-BEAST",
      "NORMAL", "FIRE", "WATER", "GRASS", "ELECTRIC", "ICE",
      "FIGHTING", "POISON", "GROUND", "FLYING", "PSYCHIC", "BUG",
      "ROCK", "GHOST", "DRAGON", "DARK", "STEEL", "FAIRY",
    ];
    const pokemonStickerCounts: Record<string, number> = {};
    for (const gc of pokemonGroupCodes) {
      pokemonStickerCounts[gc] = stickerGroupLinks.filter(l => l.groupCode === gc).length;
    }

    return {
      summary: {
        totalCategories: categories.length,
        totalSubcategories: subcategories.length,
        totalGroups: groups.length,
        totalStickerGroupLinks: stickerGroupLinks.length,
        duplicatesCreated: totalDuplicates,
        nonCanonicalCodesRemaining: nonCanonicalCodes,
        underscoreCodesRemaining: underscoreCodes,
      },
      duplicateCategories,
      duplicateSubcategories,
      duplicateGroups,
      underscoreDetails,
      nonCanonicalDetails,
      categoryCounts,
      subcategoryCounts,
      pokemonStickerCounts,
    };
  },
});
