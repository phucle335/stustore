/** First image — used on cards, cart, and as default gallery selection. */
export function getPrimaryImage(images: string[]): string {
  return images[0] ?? "";
}
