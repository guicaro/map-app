import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const MIAMI = { name: 'Miami, FL', lng: -80.1918, lat: 25.7617 }
const WPB = { name: 'West Palm Beach, FL', lng: -80.0534, lat: 26.7153 }

export default function Map() {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN
    if (!token) {
      setError('Missing Mapbox token. Set VITE_MAPBOX_TOKEN in .env')
      return
    }

    mapboxgl.accessToken = token
    const initialCenter = [(-80.1918 + -80.0534) / 2, (25.7617 + 26.7153) / 2]

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: 8,
    })

    const map = mapRef.current

    const miamiMarker = new mapboxgl.Marker({ color: '#e11d48' })
      .setLngLat([MIAMI.lng, MIAMI.lat])
      .setPopup(new mapboxgl.Popup().setText(MIAMI.name))
      .addTo(map)

    const wpbMarker = new mapboxgl.Marker({ color: '#2563eb' })
      .setLngLat([WPB.lng, WPB.lat])
      .setPopup(new mapboxgl.Popup().setText(WPB.name))
      .addTo(map)

    // Fit bounds after map load so canvas has size (prevents Firefox warning)
    const bounds = new mapboxgl.LngLatBounds()
    bounds.extend([MIAMI.lng, MIAMI.lat])
    bounds.extend([WPB.lng, WPB.lat])
    map.on('load', () => {
      map.resize()
      map.fitBounds(bounds, { padding: 60, duration: 800 })
    })

    // Resize map when the window changes to stay responsive
    const onResize = () => map.resize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      miamiMarker.remove()
      wpbMarker.remove()
      map.remove()
    }
  }, [])

  return (
    <div className="map-wrapper">
      {error && <div className="map-error">{error}</div>}
      <div ref={containerRef} className="map-container" />
    </div>
  )
}
