// Shared API configuration for the booking endpoint and the invoice page.
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/+$/, "");

export const API_KEY = import.meta.env.VITE_BOOKING_API_KEY || "";

// Custom header required by POST /book. It forces a CORS preflight and filters
// out naive script/curl requests.
export const BOOKING_REQUEST_HEADER = "X-Requested-With";
export const BOOKING_REQUEST_HEADER_VALUE = "AureHotelBooking";

export function invoicePath(hashId) {
  return `/invoice/${hashId}`;
}

export async function fetchInvoice(hashId, signal) {
  const response = await fetch(`${API_BASE_URL}/bookings/${hashId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    const error = new Error(data?.message || "Unable to load the invoice.");
    error.status = response.status;
    throw error;
  }

  return data.data;
}
