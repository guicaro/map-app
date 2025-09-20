import React from 'react'
import Map from './components/Map.jsx'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>South Florida Map</h1>
        <p>Markers: Miami and West Palm Beach</p>
      </header>
      <main className="app-main">
        <Map />
      </main>
      <footer className="app-footer">
        <span>Map data © Mapbox © OpenStreetMap</span>
      </footer>
    </div>
  )
}
