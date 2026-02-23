import { db } from '../db';
import { stickers, categories, subcategories } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

export class InventoryService {
  async getAllCategories() {
    return await db.select({
      id: categories.code,
      name: categories.name, 
      slug: sql`LOWER(REPLACE(${categories.name}, ' ', '-'))`.as('slug'),
      description: categories.description
    }).from(categories).where(sql`${categories.parentCode} IS NULL`).orderBy(categories.name);
  }

  async getStickerInventoryCount() {
    const floralSubcats = await db
      .select({
        id: subcategories.id,
        categoryName: categories.name,
        subcategoryName: subcategories.name,
        boxPosition: subcategories.boxPosition,
      })
      .from(subcategories)
      .innerJoin(categories, eq(subcategories.categoryId, categories.code))
      .where(eq(categories.name, 'Floral'))
      .orderBy(subcategories.boxPosition);

    const countsWithStickers = await Promise.all(
      floralSubcats.map(async (subcat) => {
        const [countResult] = await db
          .select({ count: sql`COUNT(*)`.as('count') })
          .from(stickers)
          .where(and(
            eq(stickers.subcategoryId, subcat.id),
            eq(stickers.isActive, true)
          ));
        
        return {
          categoryName: subcat.categoryName,
          subcategoryName: subcat.subcategoryName,
          boxPosition: subcat.boxPosition,
          count: parseInt(countResult.count?.toString() || "0")
        };
      })
    );

    return countsWithStickers;
  }

  async getActiveStickers() {
    const result = await db
      .select()
      .from(stickers)
      .innerJoin(categories, eq(stickers.categoryId, categories.code))
      .innerJoin(subcategories, eq(stickers.subcategoryId, subcategories.code))
      .where(eq(stickers.isActive, true))
      .orderBy(stickers.boxPosition, stickers.displayOrder);

    return result;
  }

  async addStickerToInventory(stickerData: any) {
    const [newSticker] = await db
      .insert(stickers)
      .values(stickerData)
      .returning();

    return newSticker;
  }

  async removeStickerFromInventory(stickerId: string) {
    const [updatedSticker] = await db
      .update(stickers)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(stickers.id, stickerId))
      .returning();

    return updatedSticker;
  }

  async initializeFloralCategories() {
    let [floralCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.name, 'Floral'));

    if (!floralCategory) {
      [floralCategory] = await db
        .insert(categories)
        .values({
          code: 'FLO',
          name: 'Floral',
          description: 'Christian floral stickers with biblical messages'
        })
        .returning();
    }

    const subcategoryData = [
      { name: 'Words in Flowers', boxPosition: 1, description: 'Text integrated within floral designs' },
      { name: 'Flowers and Words', boxPosition: 2, description: 'Flowers positioned alongside text elements' },
      { name: 'Flowers Around Words', boxPosition: 3, description: 'Biblical messages with floral borders/wreaths' }
    ];

    for (const subcat of subcategoryData) {
      const existing = await db
        .select()
        .from(subcategories)
        .where(and(
          eq(subcategories.categoryId, floralCategory.code),
          eq(subcategories.name, subcat.name)
        ));

      if (existing.length === 0) {
        await db
          .insert(subcategories)
          .values({
            categoryId: floralCategory.code,
            ...subcat
          });
      }
    }

    return floralCategory;
  }

  async getStickersByCategoryAndSubcategory(categoryName: string, subcategoryName: string) {
    const result = await db
      .select({
        sticker: stickers,
        category: categories,
        subcategory: subcategories
      })
      .from(stickers)
      .innerJoin(categories, eq(stickers.categoryId, categories.code))
      .innerJoin(subcategories, eq(stickers.subcategoryId, subcategories.id))
      .where(and(
        eq(categories.name, categoryName),
        eq(subcategories.name, subcategoryName),
        eq(stickers.isActive, true)
      ))
      .orderBy(stickers.boxPosition, stickers.displayOrder);

    return result.map(row => ({
      ...row.sticker,
      category: row.category,
      subcategory: row.subcategory
    }));
  }
}

export const inventoryService = new InventoryService();
