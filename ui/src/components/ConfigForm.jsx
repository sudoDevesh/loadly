import React, { useState } from 'react'

const defaultHeaders = JSON.stringify({ 'Content-Type': 'application/json' }, null, 2)
const defaultEndpoints = JSON.stringify([
  { url: 'https://httpbin.org/get', method: 'GET' },
  { url: 'https://httpbin.org/post', method: 'POST', body: { id: '{{uuid}}', ts: '{{timestamp}}' } }
], null, 2)

export default function ConfigForm({ disabled, onStart }) {
  const [concurrency, setConcurrency] = useState(10)
  const [duration, setDuration] = useState(30)
  const [headers, setHeaders] = useState(defaultHeaders)
  const [endpoints, setEndpoints] = useState(defaultEndpoints)

  const start = () => {
    try {
      const cfg = {
        concurrency: Number(concurrency),
        duration: Number(duration),
        headers: JSON.parse(headers || '{}'),
        endpoints: JSON.parse(endpoints || '[]')
      }
      onStart?.(cfg)
    } catch (e) {
      alert('Invalid JSON in headers or endpoints: ' + e.message)
    }
  }

  return (
    <>
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Test Settings</h3>

      <label>Concurrency (virtual users)</label>
      <input type="number" min={1} value={concurrency} onChange={e => setConcurrency(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />

      <label>Duration (seconds)</label>
      <input type="number" min={1} value={duration} onChange={e => setDuration(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />

      <label>Common Headers (JSON)</label>
      <textarea value={headers} onChange={e => setHeaders(e.target.value)} style={{ width: '100%', minHeight: 120, marginBottom: 8, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }} />

      <label>Endpoints (JSON array)</label>
      <textarea value={endpoints} onChange={e => setEndpoints(e.target.value)} style={{ width: '100%', minHeight: 180, marginBottom: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }} />

      <button onClick={start} disabled={disabled} style={{ padding: '10px 16px', borderRadius: 10, background: '#111827', color: 'white'}}>
        Start Testing
      </button>
    </div></>
  )
}
