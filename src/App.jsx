import React, { useEffect, useState } from 'react'
import Map from './components/Map.jsx'
import supabase from './utils/supabase'

export default function App() {
  const [species, setSpecies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    const fetchSpecies = async () => {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase.from('species').select('*')
      if (!isMounted) return
      if (error) {
        setError(error.message || 'Failed to load species')
      } else {
        setSpecies(Array.isArray(data) ? data : [])
      }
      setLoading(false)
    }
    fetchSpecies()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>South Florida Map</h1>
        <p>Markers: Miami and West Palm Beach</p>
      </header>
      <main className="app-main">
        <Map />
        <section style={{ marginTop: 24 }}>
          <h2>Species</h2>
          {loading && <p>Loading species…</p>}
          {error && (
            <p style={{ color: 'crimson' }}>Error loading species: {error}</p>
          )}
          {!loading && !error && (
            species.length > 0 ? (
              <div style={{
                maxHeight: 240,
                overflow: 'auto',
                background: '#111',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #333'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(species, null, 2)}
                </pre>
              </div>
            ) : (
              <p>No species found.</p>
            )
          )}
        </section>
      </main>
      <footer className="app-footer">
        <span>Map data © Mapbox © OpenStreetMap</span>
      </footer>
    </div>
  )
}
