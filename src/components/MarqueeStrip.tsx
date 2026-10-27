import { ui } from "@/lib/ui";

export default function MarqueeStrip() {
  return (
    <div className="border-y border-line">
      <div
        className={`${ui.container} flex justify-around gap-5 py-[23px] font-display text-[23px] max-[600px]:gap-2.5 max-[600px]:py-4.5 max-[600px]:text-sm [&_span:last-child]:text-berry [&_span:last-child]:italic`}
      >
        <span>Go places.</span>
        <span>Make memories.</span>
        <span>Print the good ones.</span>
      </div>
    </div>
  );
}
