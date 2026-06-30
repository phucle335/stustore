"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTTO_CASE_STUDIES } from "@/lib/motto/content";
import styles from "@/styles/components/motto/MottoWork.module.css";
import { MottoLine, MottoReveal } from "./MottoReveal";

gsap.registerPlugin(ScrollTrigger);

export function MottoWork() {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const items = list.querySelectorAll("li");
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
    <section className={styles.work} id="work">
      <div className={styles.container}>
        <div className={styles.workHead}>
          <Link href="/sneakers" className={styles.btnLink}>
            <span>View All Products</span>
            <span aria-hidden>→</span>
          </Link>
        </div>

        <ul className={styles.workList} ref={listRef}>
          {MOTTO_CASE_STUDIES.map((project, index) => (
            <li key={project.title}>
              <Link href={project.href} className={styles.workCard}>
                <div className={styles.workCardMedia}>
                  <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={styles.workCardImg}
                    priority={index < 2}
                  />
                  <div className={styles.workCardOverlay} />
                </div>
                <div className={styles.workCardText}>
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
