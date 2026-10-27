/* eslint-disable @next/next/no-img-element -- Authenticated signed previews bypass public optimization. */
"use client";
import "./preview.css";
import { pageStyle, pageWidthIn } from "./page-appearance";
import { useState, type CSSProperties } from "react";
import { Button } from "@/components/base/buttons/button";
import { api, errorMessage } from "@/lib/api-client";
import type { SavedDesign, Placement } from "./types";
export function SavedDesignPreview({ endpoint }: { endpoint: string }) {
  const [data, setData] = useState<SavedDesign | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setBusy(true);
    setError("");
    try {
      setData(await api.get<SavedDesign>(endpoint));
      setOpen(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const size = data?.configuration.options.find((o) => o.kind === "dimension");
  const ratio = size?.width && size.height ? size.width / size.height : 1;
  function photo(p: Placement) {
    const source = data?.photos.find((a) => a.id === p.assetId)?.previewUrl;
    return (
      <div key={p.assetId} className="album-slot">
        {source ? (
          <img
            src={source}
            alt="Saved album photograph"
            referrerPolicy="no-referrer"
            style={{ objectPosition: `${p.x}% ${p.y}%` }}
          />
        ) : (
          <span>Preview unavailable</span>
        )}
      </div>
    );
  }
  return (
    <div className="saved-design">
      <Button color="secondary" onPress={toggle} isLoading={busy}>
        {open ? "Close saved design" : "Review saved design"}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-berry">
          {error}
        </p>
      )}
      {open && data && (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-muted">
            Saved version {data.revision}. Digital layout preview; production proof is
            confirmed separately.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <figure>
              <div
                className={`album-canvas cover-page ${data.document.cover.appearance?.margin === 0 ? "borderless" : ""} template-${data.document.template}`}
                style={{ aspectRatio: ratio, ...pageStyle(data.document.cover.appearance, true, false, pageWidthIn(data.configuration.options)) } as CSSProperties}
              >
                <div className="album-photos">{photo(data.document.cover.photo)}</div>
                <div className="album-cover-title">
                  <span>ALBUMO</span>
                  <h2>{data.document.cover.title}</h2>
                  <p>A story worth keeping.</p>
                </div>
              </div>
              <figcaption className="mt-2 text-xs">Cover</figcaption>
            </figure>
            {data.document.pages.map((page, i) => (
              <figure key={page.id}>
                <div
                  className={`album-canvas inner-page ${page.appearance?.margin === 0 ? "borderless" : ""} ${page.caption ? "has-caption" : ""} template-${data.document.template}`}
                  style={{ aspectRatio: ratio, ...pageStyle(page.appearance, false, !!page.caption, pageWidthIn(data.configuration.options)) } as CSSProperties}
                >
                  <div className="album-photos">{page.photos.map(photo)}</div>
                  <p className="album-caption">{page.caption}</p>
                </div>
                <figcaption className="mt-2 text-xs">Page {i + 1}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
