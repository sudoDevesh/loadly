import React, { useEffect, useMemo, useRef, useState } from 'react'
import ConfigForm from './components/ConfigForm'
import Dashboard from './components/Dashboard'

export default function App() {
  const [ws, setWs] = useState(null)
  const [connected, setConnected] = useState(false)
  const [live, setLive] = useState(null)
  const [done, setDone] = useState(null)

  useEffect(() => {
    const socket = new WebSocket(`ws://${location.host}`)
    socket.onopen = () => setConnected(true)
    socket.onclose = () => setConnected(false)
    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'update') setLive(msg.data)
      if (msg.type === 'result') setDone(msg.data)
    }
    setWs(socket)
    return () => socket.close()
  }, [])

  const startTest = (config) => {
    setLive(null); setDone(null)
    ws?.send(JSON.stringify({ type: 'start', data: config }))
  }

  return (
    <div className="min-h-screen p-6" style={{ fontFamily: 'Inter, system-ui, Arial' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Loadly ⚡</h1>
      <p style={{ color: '#6b7280' }}>Lightweight API load testing with live analytics</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <ConfigForm disabled={!connected} onStart={startTest} />
        <Dashboard live={live} done={done} />
      </div>
    </div>
  )
}
