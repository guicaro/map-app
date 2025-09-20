import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Temporary mock data while backend API is unavailable
const MOCK_REPORTS = [
  {
    species_name: 'iguana',
    latitude: 26.3683,
    longitude: -80.1289,
    image_file_name: 'iguana0001.jpg',
    invasive: true,
  },
  {
    species_name: 'iguana',
    latitude: 26.1224,
    longitude: -80.1373,
    image_file_name: 'iguana0002.jpg',
    invasive: true,
  },
  {
    species_name: 'iguana',
    latitude: 25.7296,
    longitude: -80.2428,
    image_file_name: 'iguana0003.jpg',
    invasive: true,
  },
  {
    species_name: 'iguana',
    latitude: 26.7153,
    longitude: -80.0534,
    image_file_name: 'iguana0004.jpg',
    invasive: true,
  },
]

export default function Map() {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null) // selected report for modal

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN
    if (!token) {
      setError('Missing Mapbox token. Set VITE_MAPBOX_TOKEN in .env')
      return
    }

    mapboxgl.accessToken = token
    const initialCenter = [-80.1918, 25.7617] // default South Florida center

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: 8,
    })

    const map = mapRef.current

    const addReportMarkers = async () => {
      // Use mock data locally for now
      const reports = MOCK_REPORTS
      const bounds = new mapboxgl.LngLatBounds()
      reports.forEach((row) => {
        const lat = typeof row.latitude === 'string' ? parseFloat(row.latitude) : row.latitude
        const lng = typeof row.longitude === 'string' ? parseFloat(row.longitude) : row.longitude
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          const marker = new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .addTo(map)

          marker.getElement().addEventListener('click', () => setSelected(row))
          markersRef.current.push(marker)
          bounds.extend([lng, lat])
        }
      })

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 60, duration: 800 })
      }
    }

    map.on('load', () => {
      map.resize()
      addReportMarkers()
    })

    // Resize map when the window changes to stay responsive
    const onResize = () => map.resize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      markersRef.current.forEach((m) => m.remove())
      map.remove()
    }
  }, [])

  return (
    <div className="map-wrapper">
      {error && <div className="map-error">{error}</div>}
      <div ref={containerRef} className="map-container" />
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(480px, 92vw)',
              background: '#0f1428',
              border: '1px solid #243356',
              borderRadius: 10,
              padding: 16,
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Report Details</h3>
              <button onClick={() => setSelected(null)} style={{
                background: 'transparent',
                color: '#e5e7eb',
                border: 'none',
                fontSize: 18,
                cursor: 'pointer'
              }}>✕</button>
            </div>
            <div style={{ marginTop: 12, lineHeight: 1.6 }}>
              <div><strong>Species:</strong> {selected.species_name ?? 'Unknown'}</div>
              <div><strong>Invasive:</strong> {String(selected.invasive ?? 'unknown')}</div>
              {Number.isFinite(parseFloat(selected?.latitude)) && Number.isFinite(parseFloat(selected?.longitude)) && (
                <div style={{ color: '#9ca3af' }}>
                  {parseFloat(selected.longitude).toFixed(5)}, {parseFloat(selected.latitude).toFixed(5)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
