import axiosInstance from "./axiosInstance";

/**
 * Properties API calls — mirrors backend/app/blueprints/properties/routes.py
 *
 * Every backend response has the shape:
 *   { success: true,  message: "...", data: {...} }
 *   { success: false, message: "...", errors: {...} }
 *
 * On error, axios throws — callers should catch and read
 * `error.response.data.message` / `error.response.data.errors`.
 */

/**
 * GET /api/host/properties
 * @param {object} params - { status, sort } e.g. { status: 'active', sort: 'price' }
 */
export async function getProperties(params = {}) {
  const { data } = await axiosInstance.get("/api/host/properties", { params });
  return data;
}

/**
 * GET /api/host/properties/:id
 */
export async function getProperty(id) {
  const { data } = await axiosInstance.get(`/api/host/properties/${id}`);
  return data;
}

/**
 * POST /api/host/properties
 * multipart/form-data — required for photo uploads.
 *
 * @param {object} payload - full property draft (basics, location, capacity,
 *   amenities, rules, pricing, cancellation_policy)
 * @param {File[]} photos
 */
export async function createProperty(payload, photos = []) {
  const formData = new FormData();
  formData.append("payload", JSON.stringify(payload));
  photos.forEach((file) => formData.append("photos", file));

  const { data } = await axiosInstance.post("/api/host/properties", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * PUT /api/host/properties/:id
 * @param {string|number} id
 * @param {object} payload
 * @param {File[]} newPhotos - any newly added photos (existing ones referenced by URL/id in payload)
 */
export async function updateProperty(id, payload, newPhotos = []) {
  const formData = new FormData();
  formData.append("payload", JSON.stringify(payload));
  newPhotos.forEach((file) => formData.append("photos", file));

  const { data } = await axiosInstance.put(`/api/host/properties/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * PATCH /api/host/properties/:id/status
 * @param {string|number} id
 * @param {"active"|"inactive"} status
 */
export async function togglePropertyStatus(id, status) {
  const { data } = await axiosInstance.patch(`/api/host/properties/${id}/status`, { status });
  return data;
}

/**
 * Saves an in-progress "Add Property" draft (auto-save every 30s per spec).
 * POST /api/host/properties/draft
 */
export async function savePropertyDraft(payload) {
  const { data } = await axiosInstance.post("/api/host/properties/draft", { payload });
  return data;
}
