import type { ReactNode } from "react";

export type AccountIconName =
  | "albums"
  | "orders"
  | "addresses"
  | "profile"
  | "help"
  | "logout"
  | "arrow"
  | "plus"
  | "check"
  | "lock"
  | "mail"
  | "phone";

const paths: Record<AccountIconName, ReactNode> = {
  albums: (
    <>
      <rect x="5" y="3" width="15" height="18" rx="2" />
      <path d="M5 7H3m2 5H3m2 5H3m6-14v18" />
      <path d="m12 14 2-3 3 4" />
    </>
  ),
  orders: (
    <>
      <path d="m3 7 9-4 9 4v10l-9 4-9-4Z" />
      <path d="m3 7 9 4 9-4m-9 4v10M7.5 5l9 4" />
    </>
  ),
  addresses: (
    <>
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3h.01" />
    </>
  ),
  logout: (
    <>
      <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4m6-12 4 4-4 4m-7-4h11" />
    </>
  ),
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12 4 4L19 6" />,
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
};

export function AccountIcon({
  name,
  className = "size-5",
}: {
  name: AccountIconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
