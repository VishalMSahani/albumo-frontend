import { LEGAL_ENTITY, LEGAL_POLICY_LINKS } from "./constants";
export type PolicyKey = keyof typeof LEGAL_POLICY_LINKS;
export type PolicySection = { title: string; paragraphs: string[] };
export type Policy = { title: string; summary: string; sections: PolicySection[] };
export const policies: Record<PolicyKey, Policy> = {
  termsAndConditions: {
    title: "Terms & conditions",
    summary: "A clear understanding, from your first visit to your finished album.",
    sections: [
      {
        title: "Using Albumo",
        paragraphs: [
          "Albumo is operated by " +
            LEGAL_ENTITY +
            ". These terms apply to the Albumo website, your account, and the products or services you choose to use.",
          "Please provide accurate information, keep your account secure, and use the service lawfully. Do not attempt to access another person’s account, disrupt the website, or upload content you do not have permission to use.",
        ],
      },
      {
        title: "Your photos and creative work",
        paragraphs: [
          "You retain ownership of the photos and other content you supply. You must have the necessary permissions to upload, share, and print that content, including permission from contributors where needed.",
          "When you request an album or print, you permit us and the service providers involved in fulfilling that request to process the supplied content for that purpose. Contact us before sharing material that needs special handling.",
        ],
      },
      {
        title: "Products, proofs, and orders",
        paragraphs: [
          "Available options, prices, and any delivery charges are shown with the product or agreed in your quotation. An enquiry is not a confirmed order.",
          "For personalised work, check the names, captions, photo selection, layout, and delivery details before approving a proof. Requested changes after approval depend on the stage of production.",
          "An order proceeds only after its details and payment have been confirmed. Shipping, cancellation, and refund information should be read alongside these terms.",
        ],
      },
      {
        title: "Service and account access",
        paragraphs: [
          "Availability can be affected by maintenance, network issues, and third-party services. We may restrict accounts used for unlawful activity or misuse.",
          "External services, including payment and delivery providers, have their own terms. Nothing in these terms removes rights that cannot be excluded under applicable law.",
        ],
      },
      {
        title: "Questions and updates",
        paragraphs: [
          "Contact Albumo support if you have a question about these terms or an existing order. We identify updates on this page; the terms agreed for a particular order remain part of its record.",
        ],
      },
    ],
  },
  privacyPolicy: {
    title: "Privacy policy",
    summary: "What you share with us, why we need it, and the choices you have.",
    sections: [
      {
        title: "Information you provide",
        paragraphs: [
          LEGAL_ENTITY +
            " processes the details you provide when creating an account, contacting support, subscribing to emails, or placing an order. These may include your name, email, phone, delivery address, and correspondence.",
          "Where a service accepts photo uploads, the supplied photos, captions, and album choices are also needed to provide that service. Do not include information you do not want processed for your request.",
        ],
      },
      {
        title: "How information is used",
        paragraphs: [
          "We use account details to provide access, order details to fulfil purchases, and support messages to respond and keep a record of your conversation.",
          "Newsletter permission is separate from contacting support. You can unsubscribe from marketing emails while continuing to receive messages needed for your account, order, or support request.",
        ],
      },
      {
        title: "Service providers and security",
        paragraphs: [
          "Information needed to provide a service may be processed by hosting, email, payment, printing, or delivery providers. Payment credentials are handled by the relevant payment provider.",
          "We use access controls and secure connections to protect information. No online service can guarantee absolute security. Keep your login details and private sharing links safe.",
        ],
      },
      {
        title: "Session and consent records",
        paragraphs: [
          "The service uses cookies for sign-in and security. Consent records can include your chosen settings, policy version, time, account or anonymous identifier, IP address, and browser information.",
          "Guest support access uses your ticket reference and email. Keep both private. Browser storage may remember that email for the current session and your cookie choices on this device.",
        ],
      },
      {
        title: "Retention and your choices",
        paragraphs: [
          "Information is retained as needed to provide the requested service, resolve support issues, maintain order records, and meet applicable obligations.",
          "Contact us to request access, correction, or deletion of your information. We may need to verify your identity, and some records may need to be retained. Use the newsletter page to manage marketing emails and Cookie settings to change optional preferences.",
        ],
      },
    ],
  },
  shippingPolicy: {
    title: "Shipping & delivery",
    summary: "From the final page to your doorstep.",
    sections: [
      {
        title: "Production and delivery",
        paragraphs: [
          "Personalised albums need production time before dispatch. The production estimate and delivery options for your item are shown when ordering or provided in your quotation.",
          "Delivery estimates begin at the stage stated in your order confirmation. Proof approval, payment confirmation, destination, and courier availability can affect the schedule.",
        ],
      },
      {
        title: "Charges and your address",
        paragraphs: [
          "Available destinations, delivery charges, and any offer are confirmed before payment. Provide a complete address, postal code, and reachable phone number.",
          "If an address needs changing, contact support promptly. Changes depend on whether the order has entered production or been handed to the courier.",
        ],
      },
      {
        title: "Tracking and delays",
        paragraphs: [
          "Tracking information is shared when it becomes available. Courier disruptions, weather, holidays, and access issues can affect estimated delivery dates.",
          "Contact support with your order reference if tracking has stopped updating or a parcel has not arrived.",
        ],
      },
      {
        title: "Damage or missing items",
        paragraphs: [
          "If a parcel arrives damaged or incomplete, keep its packaging and share clear photos and your order reference with support as soon as possible. We will investigate and explain the next steps.",
        ],
      },
    ],
  },
  refundPolicy: {
    title: "Returns & refunds",
    summary: "If something isn’t right, start a conversation with us.",
    sections: [
      {
        title: "Personalised products",
        paragraphs: [
          "Albums and prints made with your photos are created for you. Change-of-mind requests are handled according to the terms agreed for that product and its stage of production.",
          "This does not remove your applicable rights where an item is defective, damaged, incorrect, or materially different from what was agreed.",
        ],
      },
      {
        title: "Tell us what happened",
        paragraphs: [
          "Open a support request with your order reference, a description of the issue, and the email used for the order. Keep the item and packaging while we review your request.",
          "We may request photographs or additional details. Do not send a return until support has provided instructions and a return address.",
        ],
      },
      {
        title: "Resolution and payment",
        paragraphs: [
          "After reviewing the issue, we will explain the available resolution, which may include a correction, replacement, or refund as appropriate.",
          "Approved refunds are sent through the original payment method where supported. Support will confirm the amount and expected processing time; your bank or payment provider may need additional time.",
        ],
      },
      {
        title: "Custom and group orders",
        paragraphs: [
          "Where a project has an agreed quotation or production schedule, its specific terms also apply. Include that reference when contacting us.",
        ],
      },
    ],
  },
  cancellationPolicy: {
    title: "Cancellations & changes",
    summary: "Plans change. Let us know as early as possible.",
    sections: [
      {
        title: "Requesting a change",
        paragraphs: [
          "Contact support with your order reference and the change or cancellation you need. Sending a request does not itself cancel the order; support will confirm the outcome.",
        ],
      },
      {
        title: "Before and after production",
        paragraphs: [
          "We will check whether work has started and which changes remain possible. Personalised products may no longer be cancellable once production begins.",
          "After dispatch, an order follows the delivery and returns process. Applicable rights for defective or incorrect products remain unaffected.",
        ],
      },
      {
        title: "Approved cancellations",
        paragraphs: [
          "We will confirm the cancellation, any agreed charges for work already completed, and the amount and timing of any refund before closing the request.",
        ],
      },
    ],
  },
  cookiePolicy: {
    title: "Cookies & your choices",
    summary: "The small details that help the website work.",
    sections: [
      {
        title: "Essential cookies",
        paragraphs: [
          "Essential cookies support sign-in, session renewal, security checks, and consent records. They cannot be disabled through our preference panel. Blocking them in your browser may prevent forms or account access from working.",
        ],
      },
      {
        title: "Optional preferences",
        paragraphs: [
          "You can choose whether to allow preference, analytics, and marketing categories. These are off unless you enable them. A preference does not mean that a tracking service is currently installed.",
          "This storefront does not currently load optional analytics or advertising scripts. Any future integration must respect your saved choice.",
        ],
      },
      {
        title: "Browser storage",
        paragraphs: [
          "We remember cookie choices on this device. For convenience, your guest ticket email can be stored for the current browser session. Login tokens are kept in secure server-issued cookies, not local storage.",
        ],
      },
      {
        title: "Change your mind",
        paragraphs: [
          "Open Cookie settings in the footer to change optional categories. You can also clear cookies and storage through your browser. If the service is temporarily unavailable, a preference saved on this device may be synced later.",
        ],
      },
    ],
  },
  disclaimer: {
    title: "Product & website information",
    summary: "A few useful things to know before making it yours.",
    sections: [
      {
        title: "Images and previews",
        paragraphs: [
          "Product photographs and screen previews help explain the design and finish. Screen settings, photo resolution, paper, and printing can affect the appearance of a physical product.",
          "Check the specifications and any proof provided for your order. Contact us before approval if a detail is important to you.",
        ],
      },
      {
        title: "Content and availability",
        paragraphs: [
          "We aim to keep descriptions, options, and prices accurate. If we find an error affecting an enquiry or order, we will contact you to explain it and agree the next step.",
          "Website content is general product information. Service availability may change, and external websites operate under their own policies.",
        ],
      },
      {
        title: "Your rights",
        paragraphs: [
          "Read this information with the terms and the relevant product, delivery, and refund policies. Nothing here excludes rights that cannot be excluded under applicable law.",
        ],
      },
    ],
  },
};
export const legalNavigation = (Object.keys(policies) as PolicyKey[]).map((key) => ({
  key,
  href: LEGAL_POLICY_LINKS[key],
  label: policies[key].title,
}));
