import { api } from "@/lib/api-client";
import type { AccountOrder, Address, AddressInput, AlbumProjectList } from "./types";

const addressPath = (id: string) => `/api/addresses/${encodeURIComponent(id)}`;
const orderPath = (id: string) => `/api/orders/${encodeURIComponent(id)}`;
const requestOptions = (signal?: AbortSignal) => (signal ? { signal } : {});

/** Identity is supplied by the cookie session, never a caller-provided owner ID. */
export const accountApi = {
  getAddresses: (signal?: AbortSignal): Promise<Address[]> =>
    api.get<Address[]>("/api/addresses", requestOptions(signal)),
  createAddress: (input: AddressInput, signal?: AbortSignal): Promise<Address> =>
    api.post<Address>("/api/addresses", input, requestOptions(signal)),
  // PATCH intentionally requires the complete input, matching backend validation.
  updateAddress: async (
    id: string,
    input: AddressInput,
    signal?: AbortSignal,
  ): Promise<Address> =>
    (
      await api.request<Address>(addressPath(id), {
        ...requestOptions(signal),
        method: "PATCH",
        body: input,
      })
    ).data,
  deleteAddress: async (id: string, signal?: AbortSignal): Promise<void> => {
    // The DELETE response has success/message but no data field.
    await api.request<void>(addressPath(id), {
      ...requestOptions(signal),
      method: "DELETE",
    });
  },
  setDefaultAddress: (id: string, signal?: AbortSignal): Promise<Address> =>
    api.post<Address>(`${addressPath(id)}/default`, {}, requestOptions(signal)),
  listOrders: (signal?: AbortSignal): Promise<AccountOrder[]> =>
    api.get<AccountOrder[]>("/api/orders/my", requestOptions(signal)),
  getOrder: (id: string, signal?: AbortSignal): Promise<AccountOrder> =>
    api.get<AccountOrder>(orderPath(id), requestOptions(signal)),
  listAlbums: (cursor?: string, signal?: AbortSignal): Promise<AlbumProjectList> =>
    api.get<AlbumProjectList>(
      `/api/studio/projects?archived=false&limit=12${cursor ? `&after=${encodeURIComponent(cursor)}` : ""}`,
      requestOptions(signal),
    ),
};
