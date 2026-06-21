import { HOST_API_URL } from './config'

export async function fetchListings(params = {}) {
  const query = new URLSearchParams(params).toString()
  const url = `${HOST_API_URL}/api/listings${query ? `?${query}` : ''}`
  const res = await fetch(url)
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.data.properties
}

export async function fetchFeaturedListings() {
  const res = await fetch(`${HOST_API_URL}/api/listings/featured`)
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.data.properties
}

export async function fetchListingDetail(id) {
  const res = await fetch(`${HOST_API_URL}/api/listings/${id}`)
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.data.property
}
