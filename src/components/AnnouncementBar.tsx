import Link from "next/link";

export default function AnnouncementBar() {
  return (
    <div className="flex min-h-10 flex-wrap items-center justify-center gap-x-5 gap-y-1 bg-rose px-5 py-2 text-center text-xs sm:text-sm">
      <span>Your favourite photos deserve a place in your life.</span>
      <Link
        href="/products"
        className="font-semibold underline underline-offset-4 max-sm:hidden"
      >
        Find your format
      </Link>
    </div>
  );
}
