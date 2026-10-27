"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { FormNotice } from "@/components/forms/FormUI";
import { errorMessage } from "@/lib/api-client";
import { useResource } from "@/lib/use-resource";
import { ui } from "@/lib/ui";
import { cx } from "@/lib/cx";
import { AccountIcon } from "./AccountIcon";
import { accountApi } from "./account.service";
import type { Address } from "./types";

const AddressDialog = dynamic(() => import("./AddressDialog"), {
  loading: () => (
    <p role="status" className="mt-4 text-sm text-muted">
      Opening address editor...
    </p>
  ),
});

export default function AddressBook({
  userId,
  preview = false,
  onViewAll,
}: {
  userId: string;
  preview?: boolean;
  onViewAll?: () => void;
}) {
  const addresses = useResource("account-addresses:" + userId, accountApi.getAddresses);
  const [dialog, setDialog] = useState<{
    address: Address | null;
    deleting?: boolean;
  } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const lock = useRef(false);
  const shown = preview
    ? addresses.data?.filter((address) => address.isDefault).slice(0, 1) || []
    : addresses.data || [];

  async function makeDefault(address: Address) {
    if (lock.current) return;
    lock.current = true;
    setBusy(address.id);
    setError("");
    setNotice("");
    try {
      await accountApi.setDefaultAddress(address.id);
      setNotice("Your default address has been updated.");
      addresses.reload();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(null);
    }
  }

  return (
    <section aria-labelledby="address-book-title" className={cx(ui.card, "p-5 sm:p-7")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="address-book-title"
            className="text-xl font-medium tracking-[-0.035em] sm:text-2xl"
          >
            {preview ? "Your delivery address" : "Address book"}
          </h2>
        </div>
        {preview ? (
          <Button color="tertiary" onPress={onViewAll} className="-mr-2 text-berry">
            Manage <span aria-hidden="true">↗</span>
          </Button>
        ) : (
          <Button
            color="secondary"
            isDisabled={!!busy}
            onPress={() => setDialog({ address: null })}
            className="px-4"
          >
            <span className="flex items-center gap-2">
              <AccountIcon name="plus" className="size-4" />
              Add address
            </span>
          </Button>
        )}
      </div>
      <div className="mt-5 space-y-4">
        <FormNotice error>{addresses.error || error}</FormNotice>
        <FormNotice>{notice}</FormNotice>
        {addresses.error && (
          <Button color="secondary" onPress={addresses.reload}>
            Try again
          </Button>
        )}
        {addresses.loading ? (
          <p role="status" className="rounded-2xl bg-surface p-5 text-sm text-muted">
            Loading your saved addresses...
          </p>
        ) : !addresses.error && shown.length === 0 ? (
          <div className="flex items-start gap-4 rounded-[20px] border border-dashed border-line bg-surface/60 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sand text-muted">
              <AccountIcon name="addresses" />
            </span>
            <div>
              <h3 className="text-sm font-medium">
                {addresses.data?.length
                  ? "Choose a default address."
                  : "No saved addresses."}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {addresses.data?.length
                  ? "Your saved addresses are ready. Pick one to use by default."
                  : "Add a delivery address for your next order."}
              </p>
              <Button
                color="tertiary"
                className="mt-2 -ml-3 text-berry"
                onPress={
                  preview && addresses.data?.length
                    ? onViewAll
                    : () => setDialog({ address: null })
                }
              >
                {addresses.data?.length ? "Choose an address" : "Add your first address"}
                <span aria-hidden="true"> →</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className={preview ? "grid gap-4" : "grid gap-4 xl:grid-cols-2"}>
            {shown.map((address) => (
              <article
                key={address.id}
                className="flex min-w-0 flex-col rounded-[20px] border border-line bg-surface/50 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-medium break-words">{address.name}</h3>
                  {address.isDefault && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sage px-2.5 py-1 text-[11px] font-medium">
                      <AccountIcon name="check" className="size-3" />
                      Default
                    </span>
                  )}
                </div>
                <address className="mt-3 text-sm leading-6 break-words text-muted not-italic">
                  {address.line1}
                  <br />
                  {address.line2 && (
                    <>
                      {address.line2}
                      <br />
                    </>
                  )}
                  {address.city}, {address.state} {address.pincode}
                  <br />
                  {address.country}
                </address>
                <p className="mt-3 text-sm text-muted">{address.phone}</p>
                {!preview && (
                  <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-line pt-3">
                    <Button
                      color="tertiary"
                      className="-ml-3"
                      isDisabled={!!busy}
                      onPress={() => setDialog({ address })}
                    >
                      Edit
                    </Button>
                    <Button
                      color="tertiary"
                      isDisabled={!!busy}
                      onPress={() => setDialog({ address, deleting: true })}
                    >
                      Remove
                    </Button>
                    {!address.isDefault && (
                      <Button
                        color="tertiary"
                        className="text-berry sm:ml-auto"
                        isLoading={busy === address.id}
                        isDisabled={!!busy && busy !== address.id}
                        onPress={() => void makeDefault(address)}
                      >
                        {busy === address.id ? "Updating..." : "Set as default"}
                      </Button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
      {dialog && (
        <AddressDialog
          address={dialog.address}
          deleting={dialog.deleting}
          onClose={() => setDialog(null)}
          onSave={async (input) => {
            if (dialog.address) await accountApi.updateAddress(dialog.address.id, input);
            else await accountApi.createAddress(input);
            setError("");
            setNotice(
              dialog.address
                ? "Your address has been updated."
                : "Your new address is saved.",
            );
            addresses.reload();
          }}
          onDelete={async () => {
            if (!dialog.address) return;
            await accountApi.deleteAddress(dialog.address.id);
            setError("");
            setNotice("The saved address has been removed.");
            addresses.reload();
          }}
        />
      )}
    </section>
  );
}
