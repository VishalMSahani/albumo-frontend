import Image, { type ImageProps } from "next/image";
import { cdnImageUrl } from "@/lib/cdn";

/** Layout and lazy loading from Next; bytes come directly from R2's CDN. */
export default function CdnImage({
  src,
  alt,
  ...props
}: Omit<ImageProps, "src" | "loader" | "unoptimized" | "overrideSrc"> & { src: string }) {
  return <Image {...props} src={cdnImageUrl(src)} alt={alt} unoptimized />;
}
