import { query } from "./_generated/server";

export const getAllCategories = query({
  handler: async (ctx) => {
    const cats = await ctx.db.query("categories").collect();
    return cats.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  },
});
