import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import ProductGallery from "@/components/products/ProductGallery";
import ProductOptions from "@/components/products/ProductOptions";
import { getProductDetails } from "@/lib/product-details";
import { formatPrice } from "@/lib/site-content";
import { getCatalogue } from "@/lib/catalogue";
import { ui } from "@/lib/ui";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { products, available } = await getCatalogue();
  if (!available) throw new Error("Catalogue unavailable");
  const product = products.find((item) => item.slug === slug || item.id === slug);
  if (!product) notFound();

  return {
    title: product.title,
    description: `${product.description} Explore sizes, details and personalisation with Albumo. From ${formatPrice(product.price)}.`,
    openGraph: {
      title: `${product.title} | Albumo`,
      description: product.description,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { products, available } = await getCatalogue();
  if (!available) throw new Error("Catalogue unavailable");
  const product = products.find((item) => item.slug === slug || item.id === slug);
  if (!product) notFound();

  const details = getProductDetails(product);
  const studioAvailable = ['album', 'book'].includes(product.configuration.format) && product.configuration.allowPhotoUpload;
  const relatedProducts = [
    ...products.filter(
      (item) => item.id !== product.id && item.category === product.category,
    ),
    ...products.filter((item) => item.category !== product.category),
  ].slice(0, 3);
  const facts = [
    { label: "Made for", value: details.bestFor },
    { label: "Materials", value: details.material },
    { label: "A little detail", value: details.feature },
  ];
  const questions = [
    {
      title: "Make it yours",
      answer: studioAvailable ? 'Choose Design Now to collect your photos, invite friends with a private QR, and create your book in Albumo Studio.' :
        "Bring your favourite photographs and a few words that mean something to you. Share your ideas when you enquire, and we’ll help you choose a direction.",
    },
    {
      title: "Photos & print quality",
      answer:
        "Choose original, high-resolution photos where you can. Avoid screenshots and heavily compressed images. If you’re unsure about a photograph, ask us before ordering.",
    },
    {
      title: "Delivery & timing",
      answer:
        "Tell us your delivery location and any special date in your enquiry so we can confirm production and delivery timing.",
    },
  ].filter((question) =>
    question.title === "Make it yours"
      ? product.configuration.personalizationEnabled
      : question.title === "Photos & print quality"
        ? product.configuration.allowPhotoUpload
        : true,
  );

  return (
    <>
      <section className={`${ui.container} pt-7 pb-16 lg:pb-24`}>
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-3 text-sm text-muted sm:mb-10"
        >
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/products" className="hover:text-ink">
            Shop all
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-ink">
            {product.title}
          </span>
        </nav>

        <div className="grid items-start gap-10 min-[901px]:grid-cols-[1.15fr_1fr] min-[1100px]:gap-20">
          <div data-reveal className="min-w-0 min-[901px]:sticky min-[901px]:top-32">
            <ProductGallery key={product.id} product={product} />
            <p className="mt-5 text-center text-sm text-muted">
              A little less digital. A little more forever.
            </p>
          </div>
          <div data-reveal data-reveal-delay="100" className="min-w-0">
            <span className={ui.eyebrow}>
              {product.superCategoryName} / {product.categoryName}
            </span>
            <h1 className="max-w-xl font-sans text-[clamp(38px,4vw,56px)] leading-[1.08] font-medium tracking-[-0.045em]">
              {product.title}
            </h1>
            <p className="mt-4 text-base text-muted">{product.description}</p>
            <div className="mt-7 flex flex-wrap items-baseline gap-3">
              <span className="text-sm text-muted">From</span>
              <span className="text-3xl tracking-tight">
                {formatPrice(product.price)}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              {studioAvailable ? 'Choose your size and finish, then make it yours in Studio. Final print pricing is confirmed before ordering.' : 'Choose your size and finish below. We confirm the final price with your enquiry.'}
            </p>

            <ProductOptions key={product.id} product={product} />
            <div className="mt-8">
              {questions.map((question) => (
                <details
                  key={question.title}
                  className="group border-t border-line last:border-b"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                    {question.title}
                    <span
                      className="text-lg font-normal transition-transform group-open:rotate-45 motion-reduce:transition-none"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="pb-5 text-sm leading-relaxed text-muted">
                    {question.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        data-reveal
        className="bg-surface py-12 sm:py-16"
        aria-label="Product at a glance"
      >
        <dl
          className={`${ui.container} grid gap-8 min-[701px]:grid-cols-3 min-[701px]:gap-12`}
        >
          {facts.map((fact) => (
            <div key={fact.label} className="border-l border-line pl-6">
              <dt className="mb-3 text-xs font-semibold tracking-[0.15em] text-muted uppercase">
                {fact.label}
              </dt>
              <dd className="max-w-72 text-[25px] leading-snug font-medium tracking-tight">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {(product.specifications.length > 0 ||
        product.warranty ||
        product.countryOfOrigin) && (
        <section data-reveal className={ui.section}>
          <div className={ui.container}>
            <h2 className="mb-6 font-display text-3xl">The details</h2>
            <dl className="grid gap-5 sm:grid-cols-2">
              {product.specifications.map((row) => (
                <div key={row.label} className="border-b border-line pb-4">
                  <dt className="text-sm font-semibold">{row.label}</dt>
                  <dd className="mt-2 text-base whitespace-pre-line text-muted">
                    {row.value}
                  </dd>
                </div>
              ))}
              {product.countryOfOrigin && (
                <div>
                  <dt className="text-sm font-semibold">Country of origin</dt>
                  <dd className="mt-2 text-muted">{product.countryOfOrigin}</dd>
                </div>
              )}
              {product.warranty && (
                <div>
                  <dt className="text-sm font-semibold">Warranty & care</dt>
                  <dd className="mt-2 whitespace-pre-line text-muted">
                    {product.warranty}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </section>
      )}
      <section data-reveal className={ui.section}>
        <div className={ui.container}>
          <SectionHeading
            eyebrow="A few more ways to keep it"
            href="/products"
            linkLabel="The whole collection"
          >
            More stories.
            <br />
            <em>More possibilities.</em>
          </SectionHeading>
          <div className="grid gap-10 min-[601px]:grid-cols-3 min-[601px]:gap-7">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
