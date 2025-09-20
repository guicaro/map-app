import React, { useRef, useState } from 'react'

export default function ReportButton() {
  const fileInputRef = useRef(null)
  const pendingPositionRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [toasts, setToasts] = useState([])

  const API_BASE = 'https://render.com/strikenet'

  const addToast = (type, message, timeout = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((arr) => [...arr, { id, type, message }])
    window.setTimeout(() => {
      setToasts((arr) => arr.filter((t) => t.id !== id))
    }, timeout)
  }

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
    try {
      const coords = await getPosition()
      pendingPositionRef.current = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      }
      fileInputRef.current?.click()
    } catch (e) {
      addToast('error', e?.message || 'Could not get location permission')
    }
  }

  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const pos = pendingPositionRef.current
    if (!pos) {
      addToast('error', 'Missing location for report')
      return
    }
    setSubmitting(true)
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
      addToast('success', 'Report submitted!')
      e.target.value = '' // reset input
    } catch (err) {
      addToast('error', err?.message || 'Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)',
      transform: 'translateX(-50%)',
      zIndex: 20,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Toasts (auto-dismiss) */}
      <div aria-live="polite" style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: 'min(92vw, 420px)'
      }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: 8,
            border: `1px solid ${t.type === 'error' ? '#ef4444' : '#22c55e'}`,
            background: t.type === 'error' ? '#7f1d1d' : '#14532d',
            color: t.type === 'error' ? '#fecaca' : '#bbf7d0',
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)'
          }}>
            <span style={{ marginRight: 12 }}>{t.message}</span>
            <button onClick={() => setToasts((arr) => arr.filter((x) => x.id !== t.id))} style={{
              background: 'transparent',
              color: 'inherit',
              border: 'none',
              fontSize: 16,
              cursor: 'pointer'
            }}>✕</button>
          </div>
        ))}
      </div>
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
    </div>
  )
}
