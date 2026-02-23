export interface Sticker {
  src: string;
  alt: string;
  name: string;
  id?: string;
}

export interface Subcategory {
  name: string;
  color: string;
  stickers?: Sticker[];
}

export interface CategoryData {
  code: string;
  name: string;
  title: string;
  subcategories: Subcategory[];
  stickerCollections: Sticker[][];
}