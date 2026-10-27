import Link from "next/link";
import { ui } from "@/lib/ui";

export default function ProductNotFound() {
  return (
    <section className={`${ui.container} py-24 text-center sm:py-32`}>
      <span className={ui.eyebrow}>A small detour / 404</span>
      <h1 className={ui.heading}>
        This one isn’t
        <br />
        <em>in the collection.</em>
      </h1>
      <p className="mx-auto mt-6 max-w-sm text-sm text-muted">
        Let’s find another home for your favourite memories.
      </p>
      <Link href="/products" className={`${ui.button} mt-8`}>
        Back to the collection <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
