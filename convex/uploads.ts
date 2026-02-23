import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const resolvePrefix = query({
  args: { prefix: v.string() },
  handler: async (ctx, args) => {
    const upperPrefix = args.prefix.toUpperCase();
    const allSubs = await ctx.db.query("subcategories").collect();
    const match = allSubs.find((s) => s.code === upperPrefix);
    if (!match) return null;
    const cat = await ctx.db
      .query("categories")
      .withIndex("by_code", (q) => q.eq("code", match.categoryCode))
      .unique();
    return {
      categoryCode: match.categoryCode,
      categoryName: cat?.name ?? match.categoryCode,
      subcategoryCode: match.code,
      subcategoryName: match.name,
    };
  },
});

export const listAllPrefixes = query({
  args: {},
  handler: async (ctx) => {
    const allSubs = await ctx.db.query("subcategories").collect();
    const allCats = await ctx.db.query("categories").collect();
    const catMap: Record<string, string> = {};
    for (const c of allCats) {
      catMap[c.code] = c.name;
    }
    return allSubs
      .map((s) => ({
        prefix: s.code,
        categoryCode: s.categoryCode,
        categoryName: catMap[s.categoryCode] ?? s.categoryCode,
        subcategoryCode: s.code,
        subcategoryName: s.name,
      }))
      .sort((a, b) => a.prefix.localeCompare(b.prefix));
  },
});
