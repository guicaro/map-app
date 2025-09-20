import React, { useRef, useState } from 'react'

export default function ReportButton() {
  const fileInputRef = useRef(null)
  const pendingPositionRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const API_BASE = 'https://render.com/strikenet'

  const getPosition = () =>
    new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation not supported'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      )
    })

  const onClick = async () => {
    setError(null)
    setSuccess(null)
    try {
      const coords = await getPosition()
      pendingPositionRef.current = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      }
      fileInputRef.current?.click()
    } catch (e) {
      setError(e?.message || 'Could not get location permission')
    }
  }

  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const pos = pendingPositionRef.current
    if (!pos) {
      setError('Missing location for report')
      return
    }
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('latitude', String(pos.latitude))
      form.append('longitude', String(pos.longitude))

      const res = await fetch(`${API_BASE}/report`, {
        method: 'POST',
        body: form,
      })
      if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`)
      setSuccess('Report submitted!')
      e.target.value = '' // reset input
    } catch (err) {
      setError(err?.message || 'Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'absolute', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 20 }}>
      <button
        onClick={onClick}
        disabled={submitting}
        style={{
          width: 96,
          height: 96,
          borderRadius: '9999px',
          border: 'none',
          background: '#ef4444',
          color: 'white',
          fontWeight: 700,
          fontSize: 16,
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(239,68,68,0.4)',
        }}
        title="Report"
      >
        {submitting ? 'Sending…' : 'Report'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
      {(error || success) && (
        <div style={{
          marginTop: 10,
          textAlign: 'center',
          fontSize: 13,
          color: error ? '#fecaca' : '#bbf7d0',
          background: error ? '#7f1d1d' : '#14532d',
          border: `1px solid ${error ? '#ef4444' : '#22c55e'}`,
          padding: '6px 10px',
          borderRadius: 6,
        }}>
          {error || success}
        </div>
      )}
    </div>
  )
}

