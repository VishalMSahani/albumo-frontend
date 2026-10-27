"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/base/buttons/button";
import { inputClass } from "@/components/forms/FormUI";
import { errorMessage } from "@/lib/api-client";
import { ui } from "@/lib/ui";
import { partnerCategories, type PartnerType } from "./partner-content";
import { getPartnerDirectory, type PartnerDirectoryResult } from "./partner.service";

export default function PartnerDirectory({ partnerType }: { partnerType?: PartnerType }) {
  const [type, setType] = useState<PartnerType | "">(partnerType || "");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [response, setResponse] = useState<{
    key: string;
    result: PartnerDirectoryResult | null;
    error: string;
  }>({ key: "", result: null, error: "" });
  const requestKey = JSON.stringify([type, query, page, attempt]);
  const busy = response.key !== requestKey;
  const { result, error } = response;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    getPartnerDirectory(
      { partnerType: type || undefined, search: query, page },
      AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]),
    )
      .then((data) => {
        if (active) setResponse({ key: requestKey, result: data, error: "" });
      })
      .catch((failure) => {
        if (active)
          setResponse({ key: requestKey, result: null, error: errorMessage(failure) });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [type, query, page, requestKey]);

  function filter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setQuery(search.trim());
  }

  return (
    <section
      id="discover"
      className={ui.section + " scroll-mt-28"}
      aria-labelledby="directory-title"
    >
      <div className={ui.container}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className={ui.eyebrow}>For your next chapter</span>
            <h2 id="directory-title" className={ui.heading}>
              {partnerType
                ? "Meet your next " +
                  (partnerType === "PHOTOGRAPHER" ? "photographer." : "partner.")
                : "Find the people behind your next memory."}
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Discover businesses in the Albumo network. Explore their work, then connect
              directly through their website.
            </p>
          </div>
          <a href="#apply" className={ui.textLink}>
            Bring your business here
          </a>
        </div>
        <form
          onSubmit={filter}
          aria-label="Find partners"
          className="mt-8 grid items-end gap-4 rounded-[28px] border border-line/60 bg-surface p-5 sm:flex sm:flex-wrap"
        >
          {!partnerType && (
            <label className="grid gap-2 text-sm font-medium sm:min-w-52 sm:flex-1">
              Partner type
              <select
                value={type}
                onChange={(event) => {
                  setType(event.target.value as PartnerType | "");
                  setPage(1);
                }}
                className={inputClass}
              >
                <option value="">All partners</option>
                {partnerCategories.map((category) => (
                  <option key={category.type} value={category.type}>
                    {category.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="grid gap-2 text-sm font-medium sm:min-w-52 sm:flex-1">
            Business name or city
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              maxLength={160}
              placeholder="Try a city or business name"
              className={inputClass}
              type="search"
            />
          </label>
          <Button type="submit" color="dark">
            Find partners
          </Button>
        </form>
        <div aria-live="polite" aria-busy={busy} className="mt-8">
          {busy ? (
            <p className="py-10 text-muted" role="status">
              Finding partners…
            </p>
          ) : error ? (
            <div className="rounded-[28px] border border-line p-7">
              <h3 className="text-lg font-medium">We couldn’t load the directory.</h3>
              <p className="mt-2 text-base text-muted">{error}</p>
              <Button
                color="secondary"
                className="mt-5"
                onPress={() => setAttempt((value) => value + 1)}
              >
                Try again
              </Button>
            </div>
          ) : result?.partners.length ? (
            <>
              <p className="mb-5 text-sm text-muted">
                {result.pagination.total}{" "}
                {result.pagination.total === 1 ? "partner" : "partners"} found
              </p>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {result.partners.map((partner) => (
                  <article
                    key={partner.id}
                    className="flex min-w-0 flex-col rounded-[28px] border border-line p-6 sm:p-7"
                  >
                    <p className="text-xs font-semibold tracking-wide text-berry uppercase">
                      {
                        partnerCategories.find(
                          (category) => category.type === partner.partnerType,
                        )?.title
                      }
                    </p>
                    <h3 className="mt-4 font-sans text-2xl font-medium tracking-tight wrap-break-word">
                      {partner.publicName}
                    </h3>
                    <p className="mt-2 text-sm text-muted">{partner.publicCity}</p>
                    <p className="mt-4 mb-6 text-base leading-7 wrap-break-word text-muted">
                      {partner.publicDescription}
                    </p>
                    <a
                      href={partner.publicWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={ui.textLink + " mt-auto self-start"}
                      aria-label={
                        "Visit " + partner.publicName + " website (opens in a new tab)"
                      }
                    >
                      Visit website <span aria-hidden="true">↗</span>
                    </a>
                  </article>
                ))}
              </div>
              {result.pagination.totalPages > 1 && (
                <nav
                  aria-label="Partner directory pages"
                  className="mt-8 flex flex-wrap items-center gap-4"
                >
                  <Button
                    color="secondary"
                    isDisabled={page <= 1}
                    onPress={() => setPage((value) => value - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {page} of {result.pagination.totalPages}
                  </span>
                  <Button
                    color="secondary"
                    isDisabled={page >= result.pagination.totalPages}
                    onPress={() => setPage((value) => value + 1)}
                  >
                    Next
                  </Button>
                </nav>
              )}
            </>
          ) : (
            <div className="rounded-[28px] border border-dashed border-line px-6 py-12 text-center">
              <h3 className="font-sans text-2xl font-medium tracking-tight">
                {query
                  ? "No partners match your search yet."
                  : "New connections are on their way."}
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-muted">
                {query
                  ? "Try another business name or city, or explore a different partner type."
                  : "We’re building this part of the network. Reviewed partner profiles will appear here as businesses join."}
              </p>
              <a href="#apply" className={ui.textLink + " mt-5"}>
                Be part of the network
              </a>
            </div>
          )}
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-6 text-muted">
          Bookings and services are arranged directly with each partner. Your Albumo
          orders stay with Albumo.
        </p>
      </div>
    </section>
  );
}
