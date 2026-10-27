"use client";
import { Button } from "@/components/base/buttons/button";
export default function ProductError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="font-display text-3xl">We could not load this product</h1>
      <p className="my-6 text-muted">Please try again in a moment.</p>
      <Button onPress={reset}>Try again</Button>
    </div>
  );
}
