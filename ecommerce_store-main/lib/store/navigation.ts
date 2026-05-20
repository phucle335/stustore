import type { NavId } from "./types";

export type NavLink = {
  id: NavId;
  href: string;
  label: string;
};

export const NAV_LINKS: NavLink[] = [
  { id: "home", href: "/", label: "Trang chủ" },
  { id: "sneakers", href: "/sneakers", label: "Sneaker" },
  { id: "clothing", href: "/clothing", label: "Clothes" },
  { id: "sunglasses", href: "/sunglasses", label: "Sunglasses" },
  { id: "perfume", href: "/perfume", label: "Perfume" },
  { id: "watches", href: "/watches", label: "Watches" },
  { id: "blog", href: "/blog", label: "Blog" },
];
