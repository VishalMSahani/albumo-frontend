import { aboutUi } from "@/components/about/about-ui";

export const homeUi = {
  ...aboutUi,
  container:
    "mx-auto w-[calc(100%-40px)] max-w-7xl sm:w-[calc(100%-64px)] xl:w-[calc(100%-112px)]",
  heading:
    "font-sans text-[clamp(34px,4.2vw,58px)] leading-[1.1] font-medium tracking-[-0.05em] text-balance",
  lift: "transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none",
};
