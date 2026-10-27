"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
type Settings = {
  print: null | {
    targetDpi: number;
    minimumDpi: number;
    bleedMm: number;
    safeMm: number;
  };
  retention: { enabled: boolean; days: number | null };
};
export default function StudioGuidance({ productId }: { productId: string }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  useEffect(() => {
    const c = new AbortController();
    api
      .get<Settings>(
        `/api/studio/projects/public-settings?productId=${encodeURIComponent(productId)}`,
        { signal: c.signal },
      )
      .then(setSettings)
      .catch(() => {});
    return () => c.abort();
  }, [productId]);
  if (!settings) return null;
  return (
    <details className="rounded-xl border border-line bg-white/70 p-4 text-sm">
      <summary className="cursor-pointer py-2 font-medium">
        Photo quality & storage
      </summary>
      <div className="space-y-2 pt-2 leading-relaxed text-muted">
        <p>
          {settings.print
            ? `Use original photos where possible. Studio checks your chosen layout against our ${settings.print.targetDpi} DPI target and ${settings.print.minimumDpi} DPI minimum before you approve it.`
            : "Studio helps you review every page. Albumo confirms print specifications before production."}
        </p>
        {settings.print && (
          <p>
            Print setup: {settings.print.bleedMm} mm bleed and {settings.print.safeMm} mm
            safe margin. Guides appear in Studio preview.
          </p>
        )}
        <p>
          {settings.retention.enabled
            ? `For deleted albums, unused photos are removed after ${settings.retention.days} days from the later of delivery and deletion, once support cases are closed. Photos used by an order remain retained.`
            : "Photos linked to orders are retained for fulfilment and support. Automatic cleanup of unused order photos is currently disabled."}
        </p>
      </div>
    </details>
  );
}
