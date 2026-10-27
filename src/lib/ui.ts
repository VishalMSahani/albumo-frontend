// Shared Tailwind utilities define the storefront's spacing and type hierarchy.
const buttonBase =
  "inline-flex min-h-12 items-center justify-center gap-3 rounded-full border px-6 py-3 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none";

export const ui = {
  container:
    "mx-auto w-[calc(100%-40px)] max-w-7xl sm:w-[calc(100%-64px)] xl:w-[calc(100%-112px)]",
  section: "py-14 sm:py-18 lg:py-22",
  eyebrow: "mb-4 block text-xs font-semibold tracking-[0.14em] text-berry uppercase",
  display:
    "font-sans text-[clamp(40px,5.5vw,72px)] leading-[1.06] font-medium tracking-[-0.055em] text-balance [&_em]:text-berry [&_em]:not-italic",
  heading:
    "font-sans text-[clamp(30px,3.8vw,50px)] leading-[1.12] font-medium tracking-[-0.045em] text-balance [&_em]:text-berry [&_em]:not-italic",
  card: "rounded-[28px] border border-line/80 bg-white p-6 shadow-[0_16px_50px_-36px_#3a2e2a35] sm:p-8",
  glass:
    "rounded-[28px] border border-white/90 bg-white/80 shadow-[0_16px_50px_-32px_#3a2e2a35,inset_0_1px_0_#fff] supports-backdrop-filter:backdrop-blur-xl",
  button:
    buttonBase +
    " border-berry bg-berry text-white hover:border-[#ae3154] hover:bg-[#ae3154]",
  buttonOutline:
    buttonBase + " border-line bg-white text-ink hover:border-ink hover:bg-surface",
  buttonDark:
    buttonBase + " border-ink bg-ink text-white hover:border-berry hover:bg-berry",
  textLink:
    "inline-flex min-h-11 items-center gap-3 border-b border-current py-2 text-sm font-medium underline-offset-4 hover:text-berry",
};
