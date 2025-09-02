import { useState } from "react";
import Box from "../elements/Box/Box";
import { Button } from "../elements/Button/Button";

export default function Dashboard({ live, done }) {
  const [showSummary, setShowSummary] = useState(false);

  return (
    <div
      style={{
        border: "1px solid var(--color-table-border)",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <h3 style={{ margin: 0 }}>Live Metrics</h3>
        {done && (
          <Button
            variant="secondary"
            onClick={() => setShowSummary(true)}
            style={{
              padding: "6px 10px",
              fontSize: "0.8rem",
              height: "fit-content",
            }}
          >
            Show Final Summary
          </Button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        <Box title="Total" value={live?.total?.toFixed?.(0)} />
        <Box title="Success" value={live?.success?.toFixed?.(0)} />
        <Box title="Failures" value={live?.failure?.toFixed?.(0)} />
        <Box title="RPS" value={live ? live.rps.toFixed(1) : "—"} />
        <Box title="Avg (ms)" value={live ? live.avg.toFixed(1) : "—"} />
        <Box title="p95 (ms)" value={live ? live.p95.toFixed(1) : "—"} />
        <Box
          title="RSS (MB)"
          value={live ? (live.memory.rss / 1024 / 1024).toFixed(1) : "—"}
        />
        <Box
          title="Heap (MB)"
          value={live ? (live.memory.heapUsed / 1024 / 1024).toFixed(1) : "—"}
        />
        <Box
          title="Elapsed (s)"
          value={live ? live.elapsedSec.toFixed(1) : "—"}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <h4 style={{ margin: "12px 0 6px" }}>Status Codes</h4>
        <pre
          style={{
            background: "#0b1020",
            color: "#cde3ff",
            padding: 12,
            borderRadius: 10,
            maxHeight: 200,
            overflow: "auto",
          }}
        >
          {JSON.stringify(live?.codes || {}, null, 2)}
        </pre>
      </div>

      {/* Modal for Final Summary */}
      {showSummary && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h3>Final Summary</h3>
            <pre
              style={{
                background: "#0b1020",
                color: "#cde3ff",
                padding: 12,
                borderRadius: 10,
                maxHeight: 260,
                overflow: "auto",
              }}
            >
              {JSON.stringify(done, null, 2)}
            </pre>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 16,
              }}
            >
              <Button onClick={() => setShowSummary(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Modal Styles
const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "var(--color-modal-overlay)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  background: "var(--color-modal-bg)",
  borderRadius: 12,
  padding: 20,
  width: "600px",
  maxHeight: "80vh",
  overflowY: "auto",
};
