import type { NavId } from "./types";

export type NavLink = {
  id: NavId;
  href: string;
  label: string;
};

export const NAV_LINKS: NavLink[] = [
  { id: "home", href: "/", label: "Home" },
  { id: "sneakers", href: "/sneakers", label: "Sneakers" },
  { id: "clothing", href: "/clothing", label: "Clothing" },
  { id: "sunglasses", href: "/sunglasses", label: "Sunglasses" },
  { id: "watches", href: "/watches", label: "Watches" },
  { id: "stuclub", href: "/stuclub", label: "STUClub" },
  { id: "blog", href: "/blog", label: "Blog" },
];
