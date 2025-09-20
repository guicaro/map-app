import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import supabase from '../utils/supabase'

export default function Map() {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const [error, setError] = useState(null)

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
      // Fetch all reports: latitude, longitude, file_name
      const { data, error } = await supabase
        .from('reports')
        .select('latitude, longitude, file_name')

      if (error) {
        setError(error.message || 'Failed to load reports from Supabase')
        return
      }

      const reports = Array.isArray(data) ? data : []
      const bounds = new mapboxgl.LngLatBounds()

      reports.forEach((row) => {
        const lat = typeof row.latitude === 'string' ? parseFloat(row.latitude) : row.latitude
        const lng = typeof row.longitude === 'string' ? parseFloat(row.longitude) : row.longitude
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          // Resolve public URL for the image from storage bucket
          const fileName = row.file_name
          let imageUrl = ''
          if (fileName) {
            const { data: urlData } = supabase.storage
              .from('animalPhotos')
              .getPublicUrl(fileName)
            imageUrl = urlData?.publicUrl || ''
          }

          const img = document.createElement('img')
          img.src = imageUrl
          img.alt = fileName || 'animal photo'
          img.style.maxWidth = '200px'
          img.style.maxHeight = '150px'
          img.style.display = 'block'

          const caption = document.createElement('div')
          caption.textContent = fileName || ''
          caption.style.marginTop = '6px'
          caption.style.fontSize = '12px'

          const content = document.createElement('div')
          content.style.maxWidth = '220px'
          if (imageUrl) content.appendChild(img)
          if (fileName) content.appendChild(caption)

          const marker = new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup({ offset: 12 }).setDOMContent(content))
            .addTo(map)

          markersRef.current.push(marker)
          bounds.extend([lng, lat])
        }
      })

      // If any markers were added, fit to them
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
    </div>
  )
}
