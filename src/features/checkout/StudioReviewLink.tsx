import { ui } from "@/lib/ui";

export function StudioReviewLink({ projectId }: { projectId: string | null }) {
  if (!projectId) return null;
  const configured =
    process.env.NEXT_PUBLIC_STUDIO_URL?.trim() ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3001"
      : "https://studio.albumo.in");
  let destination: URL;
  try {
    destination = new URL(
      `/projects/${encodeURIComponent(projectId)}/edit?preview=1`,
      configured,
    );
    if (
      destination.username ||
      destination.password ||
      (destination.protocol !== "https:" &&
        !(
          process.env.NODE_ENV === "development" &&
          destination.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(destination.hostname)
        ))
    )
      return null;
  } catch {
    return null;
  }
  return (
    <a
      href={destination.href}
      className={`${ui.textLink} inline-flex min-h-11 items-center`}
    >
      Review in Studio
    </a>
  );
}
