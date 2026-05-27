"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTTO_CASE_STUDIES } from "@/lib/motto/content";
import { MottoLine, MottoReveal } from "./MottoReveal";

gsap.registerPlugin(ScrollTrigger);

export function MottoWork() {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const items = list.querySelectorAll(".motto-work-item");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: list,
            start: "top 80%",
          },
        },
      );
    }, list);

    return () => ctx.revert();
  }, []);

  return (
    <section className="motto-work" id="work">
      <div className="motto-container">
        <div className="motto-work-head">
          <MottoReveal as="h2" className="motto-work-title">
            <MottoLine>TRENDING</MottoLine>
            <MottoLine>
              <em>now</em>
            </MottoLine>
          </MottoReveal>
          <Link href="/sneakers" className="motto-btn-link motto-work-all">
            <span>Xem tất cả sản phẩm</span>
            <span aria-hidden>→</span>
          </Link>
        </div>

        <ul className="motto-work-list" ref={listRef}>
          {MOTTO_CASE_STUDIES.map((project, index) => (
            <li key={project.title} className="motto-work-item">
              <Link href={project.href} className="motto-work-card">
                <div className="motto-work-card-media">
                  <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="motto-work-card-img"
                    priority={index < 2}
                  />
                  <div className="motto-work-card-overlay" />
                </div>
                <div className="motto-work-card-text">
                  <h3>{project.title}</h3>
                  <p>{project.subtitle}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
