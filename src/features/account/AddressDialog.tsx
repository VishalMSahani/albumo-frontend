"use client";

import { useRef, useState, type FormEvent } from "react";
import { Heading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { Field, FormNotice } from "@/components/forms/FormUI";
import { errorMessage } from "@/lib/api-client";
import type { Address, AddressInput } from "./types";

export default function AddressDialog({
  address,
  deleting = false,
  onClose,
  onSave,
  onDelete,
}: {
  address: Address | null;
  deleting?: boolean;
  onClose: () => void;
  onSave: (input: AddressInput) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);

  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
      onClose();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) || "").trim();
    void run(() =>
      onSave({
        name: value("name"),
        phone: value("phone"),
        line1: value("line1"),
        line2: value("line2"),
        city: value("city"),
        state: value("state"),
        pincode: value("pincode"),
        country: value("country"),
        isDefault: form.get("isDefault") === "on",
      }),
    );
  }

  return (
    <ModalOverlay
      isOpen
      isDismissable={!busy}
      isKeyboardDismissDisabled={busy}
      onOpenChange={(open) => {
        if (!open && !lock.current) onClose();
      }}
      className="bg-ink/30 supports-backdrop-filter:backdrop-blur-sm"
    >
      <Modal className="max-w-xl rounded-[28px]">
        <Dialog role={deleting ? "alertdialog" : "dialog"}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Heading
                slot="title"
                className="text-2xl leading-tight font-medium tracking-[-0.04em] sm:text-3xl"
              >
                {deleting
                  ? "Remove this address?"
                  : address
                    ? "Edit address"
                    : "Add address"}
              </Heading>
            </div>
            <Button
              color="tertiary"
              isDisabled={busy}
              onPress={onClose}
              aria-label="Close address dialog"
              className="min-w-11 shrink-0 px-2"
            >
              ×
            </Button>
          </div>
          {deleting ? (
            <div className="mt-5 space-y-5">
              <p className="text-sm text-muted">
                This removes the saved address for {address?.name}. It won’t cancel any
                orders. You can add the address again later.
              </p>
              <div className="rounded-2xl bg-surface p-4 text-sm">
                <p>{address?.line1}</p>
                <p>
                  {address?.city}, {address?.state} {address?.pincode}
                </p>
              </div>
              <FormNotice error>{error}</FormNotice>
              <div className="flex flex-wrap justify-end gap-3">
                <Button color="secondary" autoFocus isDisabled={busy} onPress={onClose}>
                  Keep address
                </Button>
                <Button isLoading={busy} onPress={() => void run(onDelete)}>
                  {busy ? "Removing..." : "Remove address"}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={save} className="mt-5 grid gap-5">
              <p className="text-sm text-muted">Fields marked * are required.</p>
              <fieldset disabled={busy} className="grid min-w-0 gap-4 sm:grid-cols-2">
                <Field
                  label="Recipient name *"
                  name="name"
                  defaultValue={address?.name || ""}
                  autoComplete="shipping name"
                  maxLength={100}
                  required
                  autoFocus
                />
                <Field
                  label="Phone number *"
                  name="phone"
                  type="tel"
                  defaultValue={address?.phone || ""}
                  autoComplete="shipping tel"
                  maxLength={20}
                  required
                />
                <Field
                  label="Address line 1 *"
                  name="line1"
                  defaultValue={address?.line1 || ""}
                  autoComplete="shipping address-line1"
                  maxLength={255}
                  placeholder="House / flat, building, street"
                  required
                  className="sm:col-span-2"
                />
                <Field
                  label="Address line 2"
                  name="line2"
                  defaultValue={address?.line2 || ""}
                  autoComplete="shipping address-line2"
                  maxLength={255}
                  placeholder="Area, landmark (optional)"
                  className="sm:col-span-2"
                />
                <Field
                  label="City *"
                  name="city"
                  defaultValue={address?.city || ""}
                  autoComplete="shipping address-level2"
                  maxLength={100}
                  required
                />
                <Field
                  label="State *"
                  name="state"
                  defaultValue={address?.state || ""}
                  autoComplete="shipping address-level1"
                  maxLength={100}
                  required
                />
                <Field
                  label="PIN code *"
                  name="pincode"
                  defaultValue={address?.pincode || ""}
                  autoComplete="shipping postal-code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  minLength={6}
                  hint="Six-digit postal code."
                  required
                />
                <Field
                  label="Country *"
                  name="country"
                  defaultValue={address?.country || "India"}
                  autoComplete="shipping country-name"
                  maxLength={100}
                  required
                />
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    defaultChecked={address?.isDefault || false}
                    className="size-4 shrink-0 accent-berry"
                  />
                  Make this my default address
                </label>
              </fieldset>
              <FormNotice error>{error}</FormNotice>
              <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5">
                <Button color="secondary" isDisabled={busy} onPress={onClose}>
                  Cancel
                </Button>
                <Button type="submit" color="dark" isLoading={busy}>
                  {busy ? "Saving..." : "Save address"}
                </Button>
              </div>
            </form>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
