import { useState, useEffect, useRef } from "react";
import { Button } from "../elements/Button/Button";
import { Input } from "../elements/Input/Input";
import EndpointForm from "./EndpointForm";
import EndpointTable from "./EndpointTable";
import HeadersModal from "./HeaderModel";

// ✅ react-icons
import {
  FiSave,
  FiDownload,
  FiUpload,
  FiSettings,
  FiPlay,
} from "react-icons/fi";

const CONFIG_KEY = "loadly_config";
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

  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.concurrency) setConcurrency(parsed.concurrency);
        if (parsed.duration) setDuration(parsed.duration);
        if (parsed.headers) setHeaders(parsed.headers);
        if (parsed.endpoints) setEndpoints(parsed.endpoints);
      } catch (err) {
        console.error("Failed to parse saved config:", err);
      }
    }
  }, []);

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

  const currentConfig = () => ({
    concurrency,
    duration,
    headers,
    endpoints,
  });

  const saveConfig = () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(currentConfig(), null, 2));
    alert("✅ Config saved locally!");
  };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(currentConfig(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "loadly-config.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.concurrency) setConcurrency(parsed.concurrency);
        if (parsed.duration) setDuration(parsed.duration);
        if (parsed.headers) setHeaders(parsed.headers);
        if (parsed.endpoints) setEndpoints(parsed.endpoints);
        localStorage.setItem(CONFIG_KEY, JSON.stringify(parsed, null, 2));
        alert("✅ Config imported!");
      } catch (err) {
        alert("❌ Failed to parse config: " + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
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
          <Button
            type="button"
            title={`Manage Headers (${headers.length})`}
            onClick={() => setShowHeadersModal(true)}
          >
            Manage Headers ({headers.length})
          </Button>

          <Button
            type="button"
            variant="blank"
            title="Save Local"
            onClick={saveConfig}
          >
            <FiSave size={18} />
          </Button>

          <Button
            type="button"
            variant="blank"
            title="Export JSON"
            onClick={exportConfig}
          >
            <FiDownload size={18} />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={importConfig}
            style={{ display: "none" }}
          />
          <Button
            type="button"
            variant="blank"
            title="Import JSON"
            onClick={() => fileInputRef.current?.click()}
          >
            <FiUpload size={18} />
          </Button>

          <Button
            disabled={disabled}
            variant="blank"
            title="Start Testing"
            onClick={start}
          >
            <FiPlay size={18} />
          </Button>
        </div>
      </div>

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
