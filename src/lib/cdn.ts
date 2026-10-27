import manifest from "@/generated/cdn-assets.json";

export const CDN_ORIGIN = (
  process.env.NEXT_PUBLIC_CDN_BASE_URL || "https://cdn.albumo.in"
).replace(/\/+$/, "");
const files: Record<string, { key: string }> = manifest.files;

/** Static originals are mapped to immutable keys by assets:publish. */
export function cdnImageUrl(source: string): string {
  if (/^https:\/\//.test(source)) {
    const url = new URL(source);
    if (
      url.origin !== CDN_ORIGIN ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      throw new Error("Website images must use the Albumo CDN");
    }
    return url.href;
  }
  const asset = files[source];
  if (!asset)
    throw new Error(
      "Image is missing from the CDN manifest. Run assets:publish: " + source,
    );
  return CDN_ORIGIN + "/" + asset.key.split("/").map(encodeURIComponent).join("/");
}
