import type { BlogCategoryId } from "@/lib/store/blog-categories";

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  /** Body content (paragraphs split by \n\n) */
  body: string;
  /** Display group on blog page (Tips, Sneakers, ...) */
  category?: BlogCategoryId;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    category: "sneakers",
    title: "How to Choose Sneakers That Match Your Streetwear Style",
    excerpt:
      "Streetwear has no fixed formula — but you can still pick the right silhouette, colorway, and material so your outfit feels cohesive every day.",
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
    date: "March 12, 2026",
    body: [
      "Streetwear is all about freedom in styling. That's why picking the right sneaker isn't about \"following the script\" — it's about choosing a shoe that supports the vibe of the outfit you're going for.",
      "1) Balance your silhouette: Chunky sneakers work well when you're layering with heavy pieces, wide-leg or cargo pants. Conversely, low-top or sleek silhouettes pair better with slim/straight-fit jeans or shorts.",
      "2) Pick colors so your outfit ages well together: If you're wearing lots of details, lean toward neutral tones (white/black/gray). If your outfit is monochrome, a bold sneaker (red/orange/green…) becomes the focal point.",
      "3) Material sets the vibe: Canvas is usually lightweight, breathable, and great for casual walks. Suede/leather gives a more individual, vintage feel. For active use, durable materials that hold their shape will save you from needing repairs down the line.",
      "Quick checklist before buying: (i) your foot shape—snug or relaxed fit, (ii) toe-box length/space, (iii) whether the colorway works with your existing wardrobe, (iv) whether the material suits the season and intended use.",
      "Choosing the right streetwear sneaker makes your outfit look intentional, even if you're just wearing a plain tee and simple pants. Most importantly: you feel confident and comfortable.",
    ].join("\n\n"),
  },
  {
    id: "blog-2",
    category: "accessories",
    title: "Sports Sunglasses Trends 2026",
    excerpt:
      "2026 marks the convergence of performance and fashion: wraparound frames, polarized lenses, and adaptive light lenses for use from training to street.",
    image:
      "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80",
    date: "March 5, 2026",
    body: [
      "Sports sunglasses in 2026 no longer split cleanly between \"running glasses\" and \"going-out glasses.\" Buyers increasingly want one pair that looks good, reduces glare, and works across contexts.",
      "1) Wrap/shield trend: Wraparound or shield-style frames create a wider sense of eye protection while making a strong style statement. These shapes pair especially well with street + outdoor vibes.",
      "2) Polarized is still a \"nice-to-have\": When driving in bright sun, near water, or in bright outdoor conditions, polarized lenses cut glare and improve contrast.",
      "3) Adaptive lens flexibility: Photochromic lenses that adjust to ambient light are gaining traction as they reduce the need to swap glasses when moving between environments.",
      "4) Frame materials and fit: Lightweight, durable frames that hold their shape let you wear them longer without fatigue. Plus, finishing touches like gradient or mirrored coatings help your outfit level up fast.",
      "Quick pick guide: If you prioritize performance during activity—go polarized + wrap style. If you prioritize daily fashion—lean toward classic/retro shapes that still offer UV protection.",
    ].join("\n\n"),
  },
  {
    id: "blog-3",
    category: "tips",
    title: "How to Care for Leather and Fabric Shoes Properly",
    excerpt:
      "Leather and fabric need \"the right care\" to stay looking good. This article outlines cleaning, drying, conditioning, and storage by material type.",
    image:
      "https://images.unsplash.com/photo-1460353589841-61cb21bbe436?w=800&q=80",
    date: "February 28, 2026",
    body: [
      "To keep your shoes looking good longer, rule #1 is: clean gently and handle each material correctly. Don't soak in water, don't scrub hard \"by feel\" — this will strip color or deform the surface.",
      "Leather shoes:\n- Use a dry cloth or soft brush to remove dust.\n- Wipe stains with a wrung-out damp cloth; for stubborn marks, use a leather-specific cleaner applied sparingly.\n- Let shoes air-dry naturally in a cool, well-ventilated spot, away from direct sunlight and heat.",
      "After cleaning and drying: apply conditioner to moisturize the leather, reduce cracking, and maintain suppleness. Regular conditioning helps color stay even over time.",
      "Suede / nubuck: avoid water. For cleaning, use a dedicated suede brush and rubber eraser-type cleaners.",
      "Canvas / fabric shoes: can be cleaned with a mild solution (diluted soap) and gently scrubbed with the surface grain. Wipe with a clean cloth afterward and let air-dry.",
      "Proper storage: keep shoes in a dry, ventilated area. Stuffing them with paper helps retain shape and reduces odor from moisture.",
    ].join("\n\n"),
  },
  {
    id: "blog-4",
    category: "clothing",
    title: "5 Outfit Ideas with Basic Hoodies for Men",
    excerpt:
      "Basic hoodies are easy to style, but looking properly streetwear comes down to matching the right pants silhouette and balancing colors. Here are 5 formulas you can apply easily.",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
    date: "February 20, 2026",
    body: [
      "Basic hoodies have an advantage: quick to throw on, easy to style, and work for many occasions. The difference is how you pair them with pants and shoes so the look doesn't fall flat.",
      "1) Hoodie + joggers\nThe safest street formula: a relaxed-fit hoodie with tapered joggers. Add white sneakers and a small accessory and you're set.",
      "2) Hoodie + jeans\nPick straight or moderately baggy jeans to balance the hoodie's volume. Neutral colors (black/gray/dark blue) keep the whole look clean and cohesive.",
      "3) Hoodie + cargo pants\nCargo pockets hit the right streetwear note. Tip: go with a solid-color hoodie and let the cargo pants be the focal point.",
      "4) Hoodie + outer layering\nElevate the outfit with a bomber/denim/light jacket on top in a coordinating tone. Small tip: keep the collar and sleeve edges neat so the look doesn't feel cluttered.",
      "5) Hoodie + shorts\nGreat for cooler weather: pick shorts that aren't too short and pair with appropriate sneakers so the whole look stays balanced.",
      "Color tips: If you want easy coordination, lean toward black/gray/white/beige. When you want to stand out, pick one statement piece (shoes or accessory) instead of loading up on colors.",
    ].join("\n\n"),
  },
  {
    id: "blog-5",
    category: "tips",
    title: "Slides: Which Pair for Summer?",
    excerpt:
      "Slides are great for summer — convenient and lightweight. But to walk comfortably for extended periods, pay attention to material, cushioning, and arch support.",
    image:
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80",
    date: "February 14, 2026",
    body: [
      "Summer usually calls for a slide that's quick to slip on, easy to clean, and appropriate for most settings. Slides handle the \"convenience\" part well, but comfort levels vary by design and material.",
      "Yeezy Slide (minimalist streetwear style):\n- Pros: lightweight, minimalist shape, easy to pair with casual outfits.\n- Note: if you walk a lot, consider the fit and arch support feel.",
      "Crocs Slide (practical option):\n- Pros: durable, easy to clean, and great for water-adjacent activities.\n- Note: pick the right size so the fit isn't loose when moving.",
      "Birkenstock (comfort and support):\n- Pros: ergonomically designed with a focus on foot support, great for those who want to wear them for longer periods.\n- Note: may need a break-in period to get used to the shape.",
      "Quick pick guide before buying:\n1) try walking in them for a few minutes to check for any pressure points,\n2) prioritize easy-to-clean surfaces,\n3) pick the right cushioning level for your needs (casual strolls or all-day walking).",
    ].join("\n\n"),
  },
  {
    id: "blog-6",
    category: "accessories",
    title: "Backpacks: Size and Materials You Should Know",
    excerpt:
      "Picking a backpack isn't just about \"20L/30L.\" You need to understand real usable capacity, laptop compartments, and water resistance so your bag lasts in Vietnam's conditions.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    date: "February 8, 2026",
    body: [
      "A properly sized backpack helps you stay organized and reduces shoulder and back fatigue. On the market, the same liter capacity can feel quite different depending on compartment layout.",
      "1) Choose capacity by need\n- 20L: great for school, work, or short trips.\n- 30L: suited for 2–4 day trips with extra gear and personal items.",
      "2) Materials and water resistance\nPrioritize fabrics with a water-resistant coating such as PU/TPU/DWR on polyester or nylon. For better rain protection, tarpaulin (or similar) options are usually more durable and easier to clean.",
      "3) Laptop compartment and structure\nCheck the laptop compartment fits your device, and padded back plus cushioned straps will determine how it feels over a full day of wear.",
      "Checklist before choosing: (i) laptop size, (ii) how much gear you need to carry, (iii) do you frequently encounter rainy weather, (iv) do you prefer a minimalist or multi-compartment layout.",
    ].join("\n\n"),
  },
];

export function getBlogPostById(id: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.id === id);
}

export function getBlogPostHref(id: string): string {
  return `/blog/${id}`;
}
