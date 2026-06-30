import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchHostProfile } from '../api/listings'

function ArrowLeftIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function BadgeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function MapPinIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export default function HostProfile() {
  const { id } = useParams()
  const [host, setHost] = useState(null)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetchHostProfile(id)
      .then((data) => {
        setHost(data.host)
        setProperties(data.properties)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400 text-sm">Loading host profile...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !host) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-gray-500 text-sm">Host not found.</p>
            <Link to="/" className="text-teal text-sm font-medium hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-charcoal mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Link>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="flex flex-col items-center md:items-start md:w-80 shrink-0">
            <img
              src={host.avatar || 'https://via.placeholder.com/96'}
              alt={host.name}
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
            <h1 className="text-xl font-semibold text-charcoal">{host.name}</h1>
            {host.isSuperhost && (
              <span className="flex items-center gap-1 text-teal font-medium text-sm mt-1">
                <BadgeIcon className="w-4 h-4" />
                Superhost
              </span>
            )}
            <p className="text-sm text-gray-400 mt-1">
              Joined in {host.joined}
            </p>
            {host.listingsCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {host.listingsCount} {host.listingsCount === 1 ? 'listing' : 'listings'}
              </p>
            )}
          </div>

          <div className="flex-1">
            {host.bio && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-charcoal mb-3">About {host.name}</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{host.bio}</p>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-charcoal mb-4">
                {host.name}'s listings
              </h2>

              {properties.length === 0 ? (
                <p className="text-gray-400 text-sm">No active listings yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <Link
                      key={property.id}
                      to={`/properties/${property.id}`}
                      className="group block"
                    >
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                        <img
                          src={property.image || 'https://via.placeholder.com/400x300'}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-charcoal text-sm truncate group-hover:underline">
                            {property.name}
                          </h3>
                          {property.rating > 0 && (
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              ★ {property.rating.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3" />
                          {property.location}
                        </p>
                        <p className="text-xs text-gray-500">
                          {property.type || 'Entire place'} · {property.guests} guests
                        </p>
                        <p className="text-sm font-semibold text-charcoal">
                          ₱{property.price?.toLocaleString()} <span className="font-normal text-gray-400 text-xs">night</span>
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
