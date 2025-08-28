import React from 'react'

function Box({ title, value }) {
  return (
    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value ?? '—'}</div>
    </div>
  )
}

export default function Dashboard({ live, done }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Live Metrics</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <Box title="Total" value={live?.total?.toFixed?.(0)} />
        <Box title="Success" value={live?.success?.toFixed?.(0)} />
        <Box title="Failures" value={live?.failure?.toFixed?.(0)} />
        <Box title="RPS" value={live ? live.rps.toFixed(1) : '—'} />
        <Box title="Avg (ms)" value={live ? live.avg.toFixed(1) : '—'} />
        <Box title="p95 (ms)" value={live ? live.p95.toFixed(1) : '—'} />
        <Box title="RSS (MB)" value={live ? (live.memory.rss/1024/1024).toFixed(1) : '—'} />
        <Box title="Heap (MB)" value={live ? (live.memory.heapUsed/1024/1024).toFixed(1) : '—'} />
        <Box title="Elapsed (s)" value={live ? live.elapsedSec.toFixed(1) : '—'} />
      </div>

      <div style={{ marginTop: 16 }}>
        <h4 style={{ margin: '12px 0 6px' }}>Status Codes</h4>
        <pre style={{ background: '#0b1020', color: '#cde3ff', padding: 12, borderRadius: 10, maxHeight: 200, overflow: 'auto' }}>
{JSON.stringify(live?.codes || {}, null, 2)}
        </pre>
      </div>

      {done && (
        <div style={{ marginTop: 16 }}>
          <h3>Final Summary</h3>
          <pre style={{ background: '#0b1020', color: '#cde3ff', padding: 12, borderRadius: 10, maxHeight: 260, overflow: 'auto' }}>
{JSON.stringify(done, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
