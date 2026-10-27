import Link from "next/link";
import { ui } from "@/lib/ui";
import PartnerForm from "./PartnerForm";
import type { PartnerType } from "./partner-content";

export function PartnershipSteps() {
  const steps = [
    {
      title: "Start with your idea",
      text: "Tell us about your business, your customers and the experience you want to create.",
    },
    {
      title: "Find the right fit",
      text: "We discuss products, quantities, pricing and how photos and orders will be handled.",
    },
    {
      title: "Create. Connect. Repeat.",
      text: "Once agreed, bring Albumo to your customers. Opt in to a directory profile to help new customers find you.",
    },
  ];
  return (
    <section
      className={ui.section + " border-y border-line"}
      aria-labelledby="partnership-steps"
    >
      <div className={ui.container}>
        <span className={ui.eyebrow}>How we begin</span>
        <h2 id="partnership-steps" className={ui.heading}>
          A good partnership starts with a conversation.
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-12">
          {steps.map((step, index) => (
            <li key={step.title} data-reveal className="rounded-[28px] bg-surface p-7">
              <span className="text-sm font-medium text-berry">0{index + 1}</span>
              <h3 className="mt-5 text-xl font-medium">{step.title}</h3>
              <p className="mt-3 text-base leading-7 text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PartnershipApplication({ partnerType }: { partnerType?: PartnerType }) {
  return (
    <section
      id="apply"
      className={ui.section + " scroll-mt-28 border-t border-line"}
      aria-labelledby="application-title"
    >
      <div
        className={
          ui.container + " grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"
        }
      >
        <div className="lg:sticky lg:top-32">
          <span className={ui.eyebrow}>For businesses</span>
          <h2 id="application-title" className={ui.heading}>
            Let’s make something
            <br className="hidden lg:block" /> worth keeping.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-muted">
            A few details are all we need to start. Share your idea, even if you are still
            working out the numbers.
          </p>
          <p className="mt-6 max-w-md border-l-2 border-berry/30 pl-5 text-sm leading-6 text-muted">
            This is an enquiry, with no commitment to order. Your contact details stay
            private. A public listing is optional and reviewed separately.
          </p>
          <Link href="/contact" className={ui.textLink + " mt-7"}>
            Have a different question? Contact us
          </Link>
        </div>
        <div className="min-w-0 rounded-[28px] border border-line/80 bg-white p-5 shadow-[0_16px_50px_-36px_#3a2e2a35] sm:p-8">
          <PartnerForm partnerType={partnerType} />
        </div>
      </div>
    </section>
  );
}

export function PartnershipQuestions() {
  const items = [
    [
      "Can we include an album in our own packages?",
      "Yes, that is the idea. Tell us what you have in mind and we will discuss the products, pricing, photo collection and delivery arrangements before you offer it to customers.",
    ],
    [
      "Will our business appear on Albumo?",
      "You can opt in when you apply. After onboarding, our team reviews your public business profile before publishing it in the relevant directory. Applying does not automatically create a listing.",
    ],
    [
      "Is there a minimum order or a fixed partner price?",
      "Share your expected volume, even if it is an estimate. Quantities, pricing and timelines are discussed for your requirements; they are not confirmed by submitting this form.",
    ],
    [
      "Who handles a booking with a listed partner?",
      "Visitors contact the partner through its own website. Travel, photography and other services are arranged directly with that business. Albumo handles its own products and agreed print orders.",
    ],
    [
      "Can we change or remove our public listing?",
      "Yes. Contact Albumo with your business name and the changes you need. Our team can update your profile or remove it from the directory.",
    ],
  ];
  return (
    <section
      className={ui.section + " border-t border-line"}
      aria-labelledby="partner-faq"
    >
      <div className={ui.container + " grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"}>
        <h2 data-reveal id="partner-faq" className={ui.heading}>
          A few things
          <br />
          you might be wondering.
        </h2>
        <div>
          {items.map(([question, answer]) => (
            <details key={question} className="group border-b border-line first:border-t">
              <summary className="cursor-pointer py-5 pr-4 text-base font-medium marker:text-berry">
                {question}
              </summary>
              <p className="pb-6 text-base leading-7 text-muted">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
