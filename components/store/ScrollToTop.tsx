"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Scroll window to top on client-side route changes. */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a
        href="https://www.facebook.com/stusport26/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on Messenger"
        className="messenger-chat-btn"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.936 1.444 5.544 3.7 7.254V22l3.38-1.866c.857.238 1.76.366 2.692.366 5.523 0 10-4.145 10-9.243S17.523 2 12 2zm.97 13.608c-.617.345-1.425.57-2.21.57-.97 0-1.865-.22-2.64-.62l-.37-.192-1.74.91.74-2.14-.47-.32C5.57 12.54 5 11.34 5 10.1 5 6.615 8.14 4 12 4s7 2.615 7 6.243c0 3.09-1.756 5.8-4.37 7.365l-1.66-2.72z" />
        </svg>
      </a>
    </>
  );
}
