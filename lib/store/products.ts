import {
  generateBagsProducts,
  generateClothingProducts,
  generatePerfumeProducts,
  generateSandalsProducts,
  generateSneakerProducts,
  generateSunglassesProducts,
  generateWatchesProducts,
} from "./generate-products";

export const SNEAKER_PRODUCTS = generateSneakerProducts();
export const SUNGLASSES_PRODUCTS = generateSunglassesProducts();
export const SANDALS_PRODUCTS = generateSandalsProducts();
export const CLOTHING_PRODUCTS = generateClothingProducts();
export const BAGS_PRODUCTS = generateBagsProducts();
export const PERFUME_PRODUCTS = generatePerfumeProducts();
export const WATCHES_PRODUCTS = generateWatchesProducts();
