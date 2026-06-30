"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useToast } from "@/components/store/ToastProvider";

type FooterContactProps = {
  zaloPhoneDigits?: string;
  email?: string;
  compact?: boolean;
};

export function FooterContact({
  zaloPhoneDigits = "0901234567",
  email = "stusport22@gmail.com",
  compact = false,
}: FooterContactProps) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const zaloUrl = `https://zalo.me/${encodeURIComponent(zaloPhoneDigits)}`;
  const phoneDisplay = zaloPhoneDigits.replace(
    /(\d{4})(\d{3})(\d{3})/,
    "$1 $2 $3",
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitted(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/support-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          phone,
          email: formEmail,
          message,
        }),
      });

      const body = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        showToast(body.error ?? "Request failed.", "error");
        return;
      }

      setSubmitted(true);
      showToast("Support request sent. Thank you!", "success");
      setName("");
      setPhone("");
      setFormEmail("");
      setMessage("");
    } catch {
      showToast("Unable to send support request.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ color: "#ccc", fontSize: 14 }}>
            <strong style={{ color: "#fff" }}>Zalo:</strong>{" "}
            <a
              href={zaloUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#f24e35", textDecoration: "none" }}
            >
              {phoneDisplay}
            </a>
          </div>
        </div>

        <div style={{ color: "#ccc", fontSize: 14 }}>
          <strong style={{ color: "#fff" }}>Email:</strong>{" "}
          <a
            href={`mailto:${email}`}
            style={{ color: "#f24e35", textDecoration: "none" }}
          >
            {email}
          </a>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div
          style={{
            display: "grid",
            gap: 10,
            gridTemplateColumns: compact ? "1fr" : "1fr 1fr",
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #333",
              background: "#0f0f0f",
              color: "#fff",
              outline: "none",
            }}
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (Zalo)"
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #333",
              background: "#0f0f0f",
              color: "#fff",
              outline: "none",
            }}
          />
          <input
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #333",
              background: "#0f0f0f",
              color: "#fff",
              outline: "none",
              gridColumn: compact ? "1 / -1" : "1 / -1",
            }}
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help?"
            required
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #333",
              background: "#0f0f0f",
              color: "#fff",
              outline: "none",
              gridColumn: "1 / -1",
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: compact ? "100%" : "auto",
              padding: "12px 18px",
              borderRadius: 999,
              border: "1px solid rgba(242, 78, 53, 0.55)",
              background: "#f24e35",
              color: "#fff",
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.75 : 1,
            }}
          >
            {submitting ? "Sending…" : "Send Request"}
          </button>
        </div>

        {submitted ? (
          <p style={{ marginTop: 10, color: "#ccc", fontSize: 13 }}>
            Request received. STUSPORT will contact you soon.
          </p>
        ) : null}
      </form>
    </div>
  );
}
