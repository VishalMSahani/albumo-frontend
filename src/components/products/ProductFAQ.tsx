import Link from "next/link";
import { ui } from "@/lib/ui";

const faqs = [
  {
    question: "Which photo book should I choose?",
    answer:
      "Softcover books are light and easy to gift. Hardcover books make lovely everyday collections. For photographs that stretch across two pages, choose a layflat album.",
  },
  {
    question: "How do I choose my photos?",
    answer:
      "Start with the moments you love most. Use the original, highest-resolution files you have, and avoid screenshots or heavily compressed copies. A mix of wide views and small details makes a lovely story.",
  },
  {
    question: "Can I get help with my album?",
    answer:
      "Of course. Send us a message through the contact page with the kind of album you have in mind, your preferred size and any questions. We can help you find a starting point.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Standard delivery is usually 5–7 business days. Confirm the timing for your location and chosen product with us before ordering, especially if it’s a gift for a particular date.",
  },
  {
    question: "Do you make albums for teams or events?",
    answer:
      "Yes. For corporate gifts, event albums or orders of 10 or more albums, use the event enquiry form for a custom quote.",
  },
];

export default function ProductFAQ() {
  return (
    <section className={`${ui.section} bg-paper`} id="product-faq">
      <div
        className={`${ui.container} grid grid-cols-[0.85fr_1.3fr] gap-25 max-[800px]:grid-cols-1 max-[800px]:gap-9`}
      >
        <div>
          <span className={ui.eyebrow}>The little details</span>
          <h2 className={ui.heading}>
            A few good
            <br />
            <em>questions.</em>
          </h2>
          <Link href="/contact" className={`${ui.textLink} mt-7`}>
            Ask us anything <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div>
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group border-t border-line last:border-b"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-base font-medium [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  className="text-xl font-normal transition-transform group-open:rotate-45 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="pr-7.5 pb-6 text-sm text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
