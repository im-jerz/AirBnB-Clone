import axiosInstance from "./axiosInstance";

/**
 * Bookings API calls — mirrors backend/app/blueprints/bookings/routes.py
 * (see host_flow.md §4 and §16, host_dashboard_design.md §9 api/bookings.js)
 *
 * Every backend response has the shape:
 *   { success: true,  message: "...", data: {...} }
 *   { success: false, message: "...", errors: {...} }
 *
 * On error, axios throws — callers should catch and read
 * `error.response.data.message` / `error.response.data.errors`.
 */

/**
 * GET /api/host/bookings
 * @param {object} params - { status, property_id, q } e.g. { status: 'pending' }
 *   status accepts a single value or a comma-joined list, matching
 *   how the tabs in ActiveBookings / BookingHistory group statuses.
 */
export async function getBookings(params = {}) {
  const { data } = await axiosInstance.get("/api/host/bookings", { params });
  return data;
}

/**
 * GET /api/host/bookings/:id
 */
export async function getBooking(id) {
  const { data } = await axiosInstance.get(`/api/host/bookings/${id}`);
  return data;
}

/**
 * POST /api/host/bookings/:id/approve
 */
export async function approveBooking(id) {
  const { data } = await axiosInstance.post(`/api/host/bookings/${id}/approve`);
  return data;
}

/**
 * POST /api/host/bookings/:id/decline
 * @param {string|number} id
 * @param {string} reason - selected from DECLINE_REASONS dropdown
 */
export async function declineBooking(id, reason) {
  const { data } = await axiosInstance.post(`/api/host/bookings/${id}/decline`, { reason });
  return data;
}

/**
 * POST /api/host/bookings/:id/cancel
 * @param {string|number} id
 * @param {object} payload - { reason_key, reason_detail }
 *   reason_key is one of CANCELLATION_REASONS keys; reason_detail is
 *   the free-text elaboration (required when reason_key === "other").
 */
export async function cancelBooking(id, payload) {
  const { data } = await axiosInstance.post(`/api/host/bookings/${id}/cancel`, payload);
  return data;
}

/**
 * POST /api/host/bookings/:id/dispute
 * @param {string|number} id
 * @param {object} payload - { reason, evidence_urls }
 */
export async function disputeBooking(id, payload) {
  const { data } = await axiosInstance.post(`/api/host/bookings/${id}/dispute`, payload);
  return data;
}