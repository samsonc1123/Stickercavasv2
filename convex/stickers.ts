// convex/stickers.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getStickersByGroupCode = query({
  args: {
    groupCode: v.string(),
  },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("stickerGroupLinks")
      .withIndex("by_group", (q) => q.eq("groupCode", args.groupCode))
      .collect();

    if (links.length === 0) return [];

    const stickers: any[] = [];
    for (const link of links) {
      const sticker = await ctx.db
        .query("stickers")
        .withIndex("by_code", (q) => q.eq("code", link.stickerCode))
        .unique();

      if (sticker) {
        stickers.push({
          ...sticker,
          imageUrl: sticker.storageId ? await ctx.storage.getUrl(sticker.storageId) : null,
        });
      }
    }
    return stickers;
  },
});

export const getStickerCountsByGroupCodes = query({
  args: {
    groupCodes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const counts: Record<string, number> = {};
    for (const groupCode of args.groupCodes) {
      const links = await ctx.db
        .query("stickerGroupLinks")
        .withIndex("by_group", (q) => q.eq("groupCode", groupCode))
        .collect();
      counts[groupCode] = links.length;
    }
    return counts;
  },
});

export const finalizeStickerUpload = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    categoryCode: v.string(),
    subcategoryCode: v.string(),
    filename: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.subcategoryCode || args.subcategoryCode.trim() === "") {
      throw new Error("subcategoryCode is required and cannot be null/empty.");
    }

    const subcat = await ctx.db
      .query("subcategories")
      .withIndex("by_code", (q) => q.eq("code", args.subcategoryCode.toUpperCase()))
      .first();
    if (!subcat) {
      throw new Error(`Subcategory code "${args.subcategoryCode}" does not exist.`);
    }

    const nameOnly = args.filename.replace(/\.(png|webp)$/i, "");
    const filePrefix = (nameOnly.match(/^([A-Za-z-]+)/) || [])[1]?.toUpperCase();
    if (filePrefix && filePrefix !== subcat.code) {
      throw new Error(`Filename prefix "${filePrefix}" does not match subcategory "${subcat.code}".`);
    }

    const existingByStorage = await ctx.db
      .query("stickers")
      .filter((q) => q.eq(q.field("storageId"), args.storageId))
      .unique();
    if (existingByStorage) {
      return { id: existingByStorage._id, code: existingByStorage.code, alreadyExists: true };
    }

    const allStickers = await ctx.db
      .query("stickers")
      .withIndex("by_code")
      .collect();

    const prefix = subcat.code;
    const matchingCodes = allStickers
      .filter((s) => s.code.startsWith(prefix))
      .map((s) => {
        const num = parseInt(s.code.replace(prefix, ""), 10);
        return isNaN(num) ? 0 : num;
      });
    const nextNum = matchingCodes.length > 0 ? Math.max(...matchingCodes) + 1 : 1;
    const code = `${prefix}${String(nextNum).padStart(5, "0")}`;

    const duplicate = await ctx.db
      .query("stickers")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (duplicate) {
      throw new Error(`Sticker code ${code} already exists. Please retry.`);
    }

    const now = Date.now();
    const id = await ctx.db.insert("stickers", {
      code,
      name: args.name,
      filename: args.filename,
      storageId: args.storageId,
      categoryCode: args.categoryCode,
      subcategoryCode: args.subcategoryCode,
      isActive: true,
      price: 4.0,
      sortOrder: nextNum,
      createdAt: now,
      updatedAt: now,
    });

    return { id, code, alreadyExists: false };
  },
});

export const listAllStickers = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("stickers").collect();
    const result = [];
    for (const sticker of all) {
      result.push({
        ...sticker,
        imageUrl: sticker.storageId
          ? await ctx.storage.getUrl(sticker.storageId)
          : null,
      });
    }
    return result.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  },
});

export const listRecentStickers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const cap = args.limit ?? 20;
    const all = await ctx.db.query("stickers").order("desc").take(cap);
    const result = [];
    for (const sticker of all) {
      result.push({
        ...sticker,
        imageUrl: sticker.storageId
          ? await ctx.storage.getUrl(sticker.storageId)
          : null,
      });
    }
    return result;
  },
});
