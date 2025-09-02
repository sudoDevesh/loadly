import { useState } from "react";
import { Button } from "../elements/Button/Button";
import { Input } from "../elements/Input/Input";
import EndpointForm from "./EndpointForm";
import EndpointTable from "./EndpointTable";
import HeadersModal from "./HeaderModel";

const defaultEndpoints = [
  { url: "https://httpbin.org/get", method: "GET" },
  {
    url: "https://httpbin.org/post",
    method: "POST",
    body: { id: "{{uuid}}", ts: "{{timestamp}}" },
  },
];

export default function ConfigForm({ disabled, onStart }) {
  const [concurrency, setConcurrency] = useState(10);
  const [duration, setDuration] = useState(30);

  const [headers, setHeaders] = useState([
    { key: "Content-Type", value: "application/json" },
  ]);
  const [endpoints, setEndpoints] = useState(defaultEndpoints);

  const [showHeadersModal, setShowHeadersModal] = useState(false);
  const [showAddEndpointModal, setShowAddEndpointModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [error, setError] = useState("");

  const start = () => {
    try {
      const headerObj = headers.reduce((acc, h) => {
        if (h.key.trim()) acc[h.key] = h.value;
        return acc;
      }, {});
      onStart?.({
        concurrency: Number(concurrency),
        duration: Number(duration),
        headers: headerObj,
        endpoints,
      });
    } catch (e) {
      alert("Invalid JSON in endpoints: " + e.message);
    }
  };

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
      {/* Top Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>Test Settings</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <Button type="button" onClick={() => setShowHeadersModal(true)}>
            Manage Headers ({headers.length})
          </Button>
          <Button disabled={disabled} onClick={start}>
            Start Testing
          </Button>
        </div>
      </div>

      {/* Concurrency & Duration */}
      {/* Concurrency & Duration */}
      <div style={{ display: "flex", gap: "16px", margin: "16px 0" }}>
        <div style={{ flex: 1 }}>
          <Input
            type="number"
            min={1}
            label="Concurrency"
            value={concurrency}
            onChange={(e) => setConcurrency(e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Input
            type="number"
            min={1}
            label="Duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
      </div>

      {/* Endpoints */}
      <EndpointTable
        endpoints={endpoints}
        setEndpoints={setEndpoints}
        disabled={disabled}
        setEditingIndex={setEditingIndex}
        setShowAddEndpointModal={setShowAddEndpointModal}
      />

      {/* Modals */}
      {showHeadersModal && (
        <HeadersModal
          headers={headers}
          setHeaders={setHeaders}
          setShowHeadersModal={setShowHeadersModal}
          error={error}
          setError={setError}
        />
      )}

      {showAddEndpointModal && (
        <EndpointForm
          onSave={(ep) => {
            setEndpoints([...endpoints, ep]);
            setShowAddEndpointModal(false);
          }}
          onCancel={() => setShowAddEndpointModal(false)}
        />
      )}

      {editingIndex !== null && (
        <EndpointForm
          initial={endpoints[editingIndex]}
          onSave={(ep) => {
            const updated = [...endpoints];
            updated[editingIndex] = ep;
            setEndpoints(updated);
            setEditingIndex(null);
          }}
          onCancel={() => setEditingIndex(null)}
        />
      )}
    </div>
  );
}
