import { useState, useEffect } from 'react';

export interface Category {
  code: string;
  name: string;
  slug: string;
}

export interface Subcategory {
  code: string;
  name: string;
  category_code: string;
}

export function useSupabaseCategories() {
  // Logic removed during migration to Convex
  return { categories: [], isLoading: false, error: null };
}

export function useSupabaseSubcategories(categoryCode: string) {
  // Logic removed during migration to Convex
  return { subcategories: [], isLoading: false, error: null };
}
