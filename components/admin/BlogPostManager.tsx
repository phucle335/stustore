"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Save, Upload } from "lucide-react";
import {
  BLOG_CATEGORIES,
  getPostCategory,
  type BlogCategoryId,
} from "@/lib/store/blog-categories";
import type { BlogPost } from "@/lib/store/blog-content";

type ApiListResponse = { data?: BlogPost[]; error?: string };
type ApiPostResponse = { data?: BlogPost; error?: string };

async function uploadAdminImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch("/api/admin/products/upload-image", {
    method: "POST",
    body,
  });
  const json = (await res.json()) as { data?: { url: string }; error?: string };
  if (!res.ok || !json.data?.url) {
    throw new Error(json.error ?? "Upload failed.");
  }
  return json.data.url;
}

export function BlogPostManager() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [draft, setDraft] = useState<BlogPost | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch("/api/blog-posts");
        const json = (await res.json()) as ApiListResponse;
        if (!res.ok || !json.data) throw new Error(json.error ?? "Failed to fetch blog.");
        if (cancelled) return;
        setPosts(json.data);
        setSelectedId(json.data[0]?.id ?? "");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Could not load blog.");
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!posts) return;
    const next = posts.find((p) => p.id === selectedId) ?? null;
    setDraft(next);
  }, [posts, selectedId]);

  const selectedIndex = useMemo(() => {
    if (!posts) return 0;
    return Math.max(0, posts.findIndex((p) => p.id === selectedId));
  }, [posts, selectedId]);

  async function handleUploadFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadAdminImage(file);
      setDraft((d) => (d ? { ...d, image: url } : d));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function createPostDraft() {
    const id = `blog-${Date.now()}`;
    const now = new Date().toLocaleDateString("vi-VN");
    const next: BlogPost = {
      id,
      title: "New Post",
      excerpt: "",
      image: "",
      date: now,
      body: "",
      category: "tips",
    };
    setPosts((prev) => (prev ? [next, ...prev] : [next]));
    setSelectedId(id);
    setDraft(next);
    setMessage("Draft post created.");
    setError(null);
  }

  function handleSave() {
    if (!draft) return;
    if (!draft.id) return;

    setMessage(null);
    setError(null);

    startTransition(async () => {
      const res = await fetch(`/api/admin/blog-posts/${encodeURIComponent(draft.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          excerpt: draft.excerpt,
          image: draft.image,
          date: draft.date || null,
          body: draft.body,
          category: draft.category ?? "tips",
        }),
      });

      const json = (await res.json()) as ApiPostResponse & { ok?: boolean };
      if (!res.ok || !json.data) {
        setError(json.error ?? "Could not save blog post.");
        return;
      }

      setPosts((prev) => {
        if (!prev) return prev;
        return prev.map((p) => (p.id === json.data!.id ? json.data! : p));
      });
      setMessage("Blog post saved.");
    });
  }

  if (!posts || !draft) {
    return (
      <div className="admin-card">
        <p className="admin-muted">Loading blog…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold admin-text">Blog CMS</h2>
          <p className="mt-1 text-sm admin-muted">
            Edit posts — category, title, excerpt, image, body.
          </p>
        </div>

        <div className="text-sm admin-muted">
          {selectedIndex + 1}/{posts.length}
        </div>
      </div>

      <div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={createPostDraft}>
          + Create new post
        </button>
      </div>

      <div className="admin-card">
        <label className="block text-sm admin-text">
          Select post
          <select
            className="admin-input mt-1.5"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {posts.map((p) => {
              const cat = BLOG_CATEGORIES.find((c) => c.id === getPostCategory(p));
              return (
                <option key={p.id} value={p.id}>
                  [{cat?.label ?? "Tips hay"}] {p.title}
                </option>
              );
            })}
          </select>
        </label>
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <h3 className="text-base font-semibold admin-text">Content</h3>

          <div className="mt-4 space-y-3">
            <label className="block text-sm admin-text">
              Category
              <select
                className="admin-input mt-1"
                value={draft.category ?? "tips"}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, category: e.target.value as BlogCategoryId } : d,
                  )
                }
              >
                {BLOG_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm admin-text">
              Title
              <input
                className="admin-input mt-1"
                value={draft.title}
                onChange={(e) => setDraft((d) => (d ? { ...d, title: e.target.value } : d))}
              />
            </label>

            <label className="block text-sm admin-text">
              Excerpt
              <textarea
                className="admin-input mt-1 resize-y"
                rows={4}
                value={draft.excerpt}
                onChange={(e) => setDraft((d) => (d ? { ...d, excerpt: e.target.value } : d))}
              />
            </label>

            <label className="block text-sm admin-text">
              Image URL
              <div className="mt-1 flex items-center gap-2">
                <input
                  className="admin-input"
                  value={draft.image}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, image: e.target.value } : d))
                  }
                />
                <label className="admin-btn inline-flex items-center gap-2" aria-label="Upload image">
                  <Upload className="h-4 w-4" />
                  {uploading ? "…" : "Upload"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      void handleUploadFile(file);
                    }}
                  />
                </label>
              </div>
            </label>

            <label className="block text-sm admin-text">
              Date (string)
              <input
                className="admin-input mt-1"
                value={draft.date ?? ""}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, date: e.target.value } : d))
                }
                placeholder="March 12, 2026"
              />
            </label>
          </div>
        </div>

        <div className="admin-card">
          <h3 className="text-base font-semibold admin-text">Body</h3>
          <p className="mt-1 text-sm admin-muted">
            Body is a paragraph string separated by blank lines (split by `\n\n`).
          </p>

          <textarea
            className="admin-input mt-3 resize-y"
            rows={18}
            value={draft.body}
            onChange={(e) => setDraft((d) => (d ? { ...d, body: e.target.value } : d))}
          />

          {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
          {message ? (
            <p className="mt-3 text-sm text-emerald-400">{message}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
              disabled={isPending}
              onClick={handleSave}
            >
              <Save className="inline-block h-4 w-4 mr-2" />
              {isPending ? "Saving…" : "Save Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

