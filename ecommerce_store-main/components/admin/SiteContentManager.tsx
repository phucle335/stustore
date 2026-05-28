"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ImageUp, RefreshCw, Save, Upload } from "lucide-react";
import { useSiteContent } from "@/lib/site-content/useSiteContent";
import type { SiteContent } from "@/lib/site-content/site-content";

type BannerState = SiteContent["motto"]["mottoInsights"]["banner"];

async function uploadAdminImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch("/api/admin/products/upload-image", {
    method: "POST",
    body,
  });
  const json = (await res.json()) as { data?: { url: string }; error?: string };
  if (!res.ok || !json.data?.url) {
    throw new Error(json.error ?? "Upload ảnh thất bại.");
  }
  return json.data.url;
}

function ensureBanner(banner: BannerState): NonNullable<BannerState> {
  if (banner && banner.enabled) return banner;
  return {
    enabled: true,
    imageUrl: "",
    title: "",
    href: "/blog",
  };
}

export function SiteContentManager() {
  const { siteContent } = useSiteContent();
  const [draft, setDraft] = useState<SiteContent>(siteContent);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    setDraft(siteContent);
  }, [siteContent]);

  const heroSlides = draft.motto.mottoHeroSlides;
  const rotatingWords = draft.motto.homeRotatingWords;
  const marqueeItems = draft.motto.mottoMarqueeItems;
  const insights = draft.motto.mottoInsights;
  const pageBackgrounds = draft.pages;

  const banner: BannerState = insights.banner;

  const heroSlots = useMemo(() => {
    const result = [...heroSlides];
    while (result.length < 5) {
      result.push({
        id: `hero-${result.length + 1}`,
        image: "",
        alt: "",
      });
    }
    return result.slice(0, 5);
  }, [heroSlides]);

  function updateHeroSlide(index: number, patch: Partial<(typeof heroSlots)[number]>) {
    setDraft((d) => {
      const nextSlides = [...d.motto.mottoHeroSlides];
      const current =
        nextSlides[index] ?? ({
          id: `hero-${index + 1}`,
          image: "",
          alt: "",
        } as (typeof heroSlots)[number]);
      nextSlides[index] = { ...current, ...patch };
      return {
        ...d,
        motto: { ...d.motto, mottoHeroSlides: nextSlides },
      };
    });
  }

  function updateRotatingWord(index: number, value: string) {
    setDraft((d) => {
      const next = [...d.motto.homeRotatingWords];
      next[index] = value;
      return { ...d, motto: { ...d.motto, homeRotatingWords: next } };
    });
  }

  function updateMarqueeItem(index: number, value: string) {
    setDraft((d) => {
      const next = [...d.motto.mottoMarqueeItems];
      next[index] = value;
      return { ...d, motto: { ...d.motto, mottoMarqueeItems: next } };
    });
  }

  function updateInsightIntro(value: string) {
    setDraft((d) => {
      return {
        ...d,
        motto: {
          ...d.motto,
          mottoInsights: { ...d.motto.mottoInsights, introText: value },
        },
      };
    });
  }

  function updateInsightCard(
    index: number,
    patch: Partial<(typeof insights.cards)[number]>,
  ) {
    setDraft((d) => {
      const nextCards = [...d.motto.mottoInsights.cards];
      const current = nextCards[index] ?? { title: "", href: "" };
      nextCards[index] = { ...current, ...patch };
      return {
        ...d,
        motto: { ...d.motto, mottoInsights: { ...d.motto.mottoInsights, cards: nextCards } },
      };
    });
  }

  function setBannerEnabled(enabled: boolean) {
    setDraft((d) => {
      return {
        ...d,
        motto: {
          ...d.motto,
          mottoInsights: {
            ...d.motto.mottoInsights,
            banner: enabled ? ensureBanner(d.motto.mottoInsights.banner) : null,
          },
        },
      };
    });
  }

  function updateBanner(patch: Partial<NonNullable<BannerState>>) {
    setDraft((d) => {
      const nextBanner = ensureBanner(d.motto.mottoInsights.banner);
      return {
        ...d,
        motto: {
          ...d.motto,
          mottoInsights: {
            ...d.motto.mottoInsights,
            banner: { ...nextBanner, ...patch },
          },
        },
      };
    });
  }

  function updatePageBackground(
    key: keyof SiteContent["pages"],
    value: string,
  ) {
    setDraft((d) => ({
      ...d,
      pages: {
        ...d.pages,
        [key]: {
          ...d.pages[key],
          backgroundImage: value,
        },
      },
    }));
  }

  async function handlePickFile(key: string, file: File | undefined) {
    if (!file) return;
    setUploadingKey(key);
    setError(null);

    try {
      const url = await uploadAdminImage(file);
      if (key.startsWith("hero:")) {
        const index = Number(key.split(":")[1] ?? 0);
        updateHeroSlide(index, { image: url });
      } else if (key === "banner") {
        updateBanner({ imageUrl: url });
      } else if (key.startsWith("page-bg:")) {
        const pageKey = key.split(":")[1] as keyof SiteContent["pages"];
        updatePageBackground(pageKey, url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload ảnh thất bại.");
    } finally {
      setUploadingKey(null);
    }
  }

  async function handleSave() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/admin/site-content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: draft }),
      });

      const json = (await res.json()) as { data?: unknown; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Không lưu được site content.");
        return;
      }
      setMessage("Đã lưu site content.");
    });
  }

  function resetToDefaults() {
    setDraft(siteContent);
    setMessage(null);
    setError(null);
  }

  return (
    <div className="space-y-8">
      <div className="admin-grid-2">
        <div>
          <h2 className="text-lg font-semibold admin-text">Motto / Home CMS</h2>
          <p className="mt-1 text-sm admin-muted">
            Chỉnh hero, chữ xoay, marquee và MottoInsights. Lưu sẽ cập nhật trực tiếp.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="admin-btn"
            disabled={isPending}
            onClick={resetToDefaults}
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={isPending}
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* Rotating words */}
      <div className="admin-card">
        <h3 className="text-base font-semibold admin-text">Rotating words (DOMINATION…)</h3>
        <p className="mt-1 text-sm admin-muted">
          Các chữ sẽ xoay liên tục ở khu vực hero.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rotatingWords.map((w, i) => (
            <label key={i} className="block text-sm admin-text">
              Word {i + 1}
              <input
                className="admin-input mt-1"
                value={w}
                onChange={(e) => updateRotatingWord(i, e.target.value)}
                placeholder="VD: DOMINATION"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Hero slides */}
      <div className="admin-card">
        <h3 className="text-base font-semibold admin-text">Hero slides (5 ảnh)</h3>
        <p className="mt-1 text-sm admin-muted">
          Nhập URL ảnh hoặc chọn file từ máy. Ảnh sẽ là nền carrousel full-bleed.
        </p>

        <div className="mt-5 space-y-6">
          {heroSlots.map((slide, i) => {
            const busy = uploadingKey === `hero:${i}`;
            return (
              <div key={slide.id ?? i} className="border-t border-slate-800 pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-sm admin-text">
                      Alt
                      <input
                        className="admin-input mt-1"
                        value={slide.alt ?? ""}
                        onChange={(e) => updateHeroSlide(i, { alt: e.target.value })}
                      />
                    </label>

                    <label className="block text-sm admin-text mt-3">
                      Image URL
                      <input
                        className="admin-input mt-1"
                        value={slide.image ?? ""}
                        onChange={(e) => updateHeroSlide(i, { image: e.target.value })}
                        placeholder="/images/hero/slide-1.jpg"
                      />
                    </label>
                  </div>

                  <div className="w-28 shrink-0">
                    {slide.image ? (
                      <img
                        src={slide.image}
                        alt=""
                        className="w-28 h-20 object-cover rounded"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-28 h-20 rounded border border-slate-800" />
                    )}
                    <label className="mt-2 inline-flex items-center gap-2 admin-btn">
                      <ImageUp className="h-4 w-4" />
                      {busy ? "Đang tải…" : "Chọn ảnh"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        disabled={busy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          void handlePickFile(`hero:${i}`, file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
      </div>

      {/* Marquee */}
      <div className="admin-card">
        <h3 className="text-base font-semibold admin-text">Marquee (3 dòng)</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {marqueeItems.map((item, i) => (
            <label key={i} className="block text-sm admin-text">
              Item {i + 1}
              <input
                className="admin-input mt-1"
                value={item}
                onChange={(e) => updateMarqueeItem(i, e.target.value)}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="admin-card">
        <h3 className="text-base font-semibold admin-text">MottoInsights</h3>

        <div className="mt-4">
          <label className="block text-sm admin-text">
            Intro text
            <input
              className="admin-input mt-1"
              value={insights.introText}
              onChange={(e) => updateInsightIntro(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold admin-text">Banner (tuỳ chọn)</h4>

            <label className="mt-3 flex items-center gap-2 text-sm admin-text">
              <input
                type="checkbox"
                checked={banner?.enabled ?? false}
                onChange={(e) => setBannerEnabled(e.target.checked)}
              />
              Bật banner trong MottoInsights
            </label>

            {banner?.enabled ? (
              <div className="mt-4 space-y-3">
                <label className="block text-sm admin-text">
                  Banner title (text)
                  <input
                    className="admin-input mt-1"
                    value={banner.title}
                    onChange={(e) => updateBanner({ title: e.target.value })}
                  />
                </label>

                <label className="block text-sm admin-text">
                  Banner href (link)
                  <input
                    className="admin-input mt-1"
                    value={banner.href}
                    onChange={(e) => updateBanner({ href: e.target.value })}
                  />
                </label>

                <label className="block text-sm admin-text">
                  Banner image URL
                  <input
                    className="admin-input mt-1"
                    value={banner.imageUrl}
                    onChange={(e) => updateBanner({ imageUrl: e.target.value })}
                  />
                </label>

                <div className="flex items-start gap-4">
                  <div className="w-28 shrink-0">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt=""
                        className="w-28 h-20 object-cover rounded"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-28 h-20 rounded border border-slate-800" />
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="admin-btn inline-flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      {uploadingKey === "banner" ? "Đang tải…" : "Chọn ảnh"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        disabled={uploadingKey === "banner"}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          void handlePickFile("banner", file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <h4 className="text-sm font-semibold admin-text">Card list</h4>
            <div className="mt-3 space-y-4">
              {insights.cards.map((c, i) => (
                <div key={`${c.title}-${i}`} className="border-t border-slate-800 pt-3">
                  <label className="block text-sm admin-text">
                    Title
                    <input
                      className="admin-input mt-1"
                      value={c.title}
                      onChange={(e) => updateInsightCard(i, { title: e.target.value })}
                    />
                  </label>
                  <label className="block text-sm admin-text mt-3">
                    Href
                    <input
                      className="admin-input mt-1"
                      value={c.href}
                      onChange={(e) => updateInsightCard(i, { href: e.target.value })}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="text-base font-semibold admin-text">Background các trang static</h3>
        <p className="mt-1 text-sm admin-muted">
          Chỉnh background ảnh cho Tài khoản, Điều khoản và Hỗ trợ.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {(
            [
              ["account", "Trang tài khoản"],
              ["terms", "Trang điều khoản"],
              ["support", "Trang hỗ trợ"],
            ] as const
          ).map(([pageKey, label]) => (
            <div key={pageKey} className="rounded-lg border border-slate-800 p-3">
              <p className="text-sm font-semibold admin-text">{label}</p>
              <label className="mt-3 block text-sm admin-text">
                Image URL
                <input
                  className="admin-input mt-1"
                  value={pageBackgrounds[pageKey].backgroundImage}
                  onChange={(e) => updatePageBackground(pageKey, e.target.value)}
                  placeholder="https://..."
                />
              </label>
              <div className="mt-3">
                {pageBackgrounds[pageKey].backgroundImage ? (
                  <img
                    src={pageBackgrounds[pageKey].backgroundImage}
                    alt=""
                    className="h-24 w-full rounded object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-24 w-full rounded border border-slate-800" />
                )}
              </div>
              <label className="mt-3 inline-flex items-center gap-2 admin-btn">
                <Upload className="h-4 w-4" />
                {uploadingKey === `page-bg:${pageKey}` ? "Đang tải…" : "Chọn ảnh"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  disabled={uploadingKey === `page-bg:${pageKey}`}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    void handlePickFile(`page-bg:${pageKey}`, file);
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {message ? (
        <p className="text-sm text-emerald-500" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}

