"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import CdnImage from "@/components/CdnImage";
import StudioGuidance from "./StudioGuidance";
import { formatPrice } from "@/lib/site-content";
import {
  buildCatalogueEnquiry,
  initialSelections,
  selectedPrice,
  type Product,
} from "@/lib/catalogue-model";

export default function ProductOptions({ product }: { product: Product }) {
  const router = useRouter();
  const [selections, setSelections] = useState(() => initialSelections(product));
  const [quantity, setQuantity] = useState("1");
  const [personalText, setPersonalText] = useState("");
  const [error, setError] = useState("");
  const config = product.configuration;
  const studioAvailable =
    ["album", "book"].includes(config.format) && config.allowPhotoUpload;
  const pageGroup = config.groups.find((group) => group.kind === "pages");
  const pages = Number(
    /^(\d+)\s+pages?$/i.exec(
      pageGroup?.options.find((option) => option.id === selections[pageGroup.id])
        ?.label || "",
    )?.[1],
  );
  const quantityNumber = Number(quantity);
  const complete = config.groups.every(
    (group) => !group.required || !!selections[group.id],
  );
  function enquire(event: FormEvent) {
    event.preventDefault();
    if (!complete) {
      setError("Choose an option in each required group.");
      return;
    }
    if (!Number.isInteger(quantityNumber) || quantityNumber < 1 || quantityNumber > 99) {
      setError("Choose a quantity from 1 to 99.");
      return;
    }
    if (studioAvailable) {
      const origin =
        process.env.NEXT_PUBLIC_STUDIO_URL ||
        (process.env.NODE_ENV === "development"
          ? "http://localhost:3001"
          : "https://studio.albumo.in");
      const destination = new URL("/start", origin);
      destination.search = new URLSearchParams({
        product: product.id,
        choices: JSON.stringify(selections),
        quantity: String(quantityNumber),
        text: personalText,
      }).toString();
      window.location.assign(destination.href);
    } else
      router.push(
        buildCatalogueEnquiry(product, selections, quantityNumber, personalText),
      );
  }
  return (
    <form onSubmit={enquire} className="space-y-6 border-t border-line pt-7">
      <div className="rounded-lg bg-surface p-4 text-sm leading-relaxed">
        <p className="font-semibold">
          {config.personalizationEnabled ? "Make it personal" : "Available as shown"}
        </p>
        {config.allowPhotoUpload && (
          <p className="mt-1 text-muted">
            {studioAvailable
              ? "Upload your favourites in Studio, or invite friends to add theirs with a private QR link."
              : "Add your own photographs. We will arrange photo collection after your enquiry."}
          </p>
        )}
        {config.instructions && (
          <p className="mt-2 whitespace-pre-line text-muted">{config.instructions}</p>
        )}
      </div>
      {config.groups.map((group) => (
        <fieldset key={group.id}>
          <legend className="mb-3 text-base font-semibold">
            {group.label}{" "}
            <span className="text-sm font-normal text-muted">
              {group.required ? "(required)" : "(optional)"}
            </span>
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {!group.required && (
              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-line p-3 text-sm">
                <input
                  type="radio"
                  name={group.id}
                  checked={!selections[group.id]}
                  onChange={() => setSelections({ ...selections, [group.id]: "" })}
                />
                No selection
              </label>
            )}
            {group.options.map((choice) => (
              <label
                key={choice.id}
                className="relative flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4 text-sm has-[:checked]:border-berry has-[:checked]:bg-rose/10"
              >
                <input
                  type="radio"
                  required={group.required}
                  name={group.id}
                  value={choice.id}
                  checked={selections[group.id] === choice.id}
                  onChange={() => {
                    setSelections({ ...selections, [group.id]: choice.id });
                    setError("");
                  }}
                  className="mt-1 accent-berry"
                />
                <span className="min-w-0 flex-1">
                  {choice.imageUrl && (
                    <span className="relative mb-3 block aspect-[4/3] overflow-hidden rounded-md">
                      <CdnImage
                        src={choice.imageUrl}
                        alt={choice.label}
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </span>
                  )}
                  <span className="block font-medium">{choice.label}</span>
                  {choice.width && choice.height && (
                    <span className="mt-1 block text-muted">
                      {choice.width} x {choice.height} {choice.unit}
                    </span>
                  )}
                  {choice.description && (
                    <span className="mt-1 block leading-relaxed text-muted">
                      {choice.description}
                    </span>
                  )}
                  <span className="mt-2 block font-medium">
                    {choice.priceAdjustmentCents
                      ? "+ " + formatPrice(choice.priceAdjustmentCents / 100)
                      : "Included"}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {config.allowText && (
        <TextArea
          label="Your personal text (optional)"
          value={personalText}
          onChange={setPersonalText}
          maxLength={300}
          rows={3}
          hint="For a cover title, name or short message. We will confirm the design with you."
        />
      )}
      <Input
        label="Quantity"
        type="number"
        name="quantity"
        value={quantity}
        onChange={setQuantity}
        min={1}
        max={99}
        step={1}
        isRequired
      />
      <div
        aria-live="polite"
        className="rounded-[24px] border border-line/70 bg-surface p-5"
      >
        <p className="text-sm text-muted">
          {complete ? "Indicative total" : "Price for current selections"}
        </p>
        <p className="mt-1 text-2xl font-semibold">
          {formatPrice(
            (selectedPrice(product, selections) *
              (Number.isInteger(quantityNumber) && quantityNumber > 0
                ? quantityNumber
                : 1)) /
              100,
          )}
        </p>
        <p className="mt-2 text-sm text-muted">
          {studioAvailable
            ? "Design your draft now. Final print price and delivery are confirmed before ordering."
            : "Final price and delivery confirmed with your enquiry."}
        </p>
      </div>
      {config.productionDays && (
        <p className="text-sm text-muted">
          Production: approximately {config.productionDays} business days after design
          approval. Delivery is additional.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-berry">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full">
        {studioAvailable ? "Design Now" : "Enquire about this product"}
      </Button>
      <p className="text-center text-sm text-muted">
        {studioAvailable && pages
          ? `${pages} pages / At least ${Math.ceil(pages * 1.2)} photos, ${Math.ceil(pages * 1.3)} recommended. Your selected options travel with you.`
          : "Your selected options will be included."}
      </p>
      {studioAvailable && <StudioGuidance productId={product.id} />}
    </form>
  );
}
