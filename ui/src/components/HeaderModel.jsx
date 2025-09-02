import { useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { Button } from "../elements/Button/Button";
import { Input } from "../elements/Input/Input";

export default function HeadersModal({
  headers,
  setHeaders,
  setShowHeadersModal,
  error,
  setError,
}) {
  const removeDuplicateHeaders = (hdrs) => {
    const seen = new Set();
    const filtered = [];
    let duplicatesFound = false;

    for (const h of hdrs) {
      const key = h.key.trim().toLowerCase();
      if (!key) {
        filtered.push(h);
        continue;
      }
      if (seen.has(key)) {
        duplicatesFound = true;
        continue;
      }
      seen.add(key);
      filtered.push(h);
    }
    return { filtered, duplicatesFound };
  };

  const close = () => {
    setHeaders((prev) => {
      const { filtered, duplicatesFound } = removeDuplicateHeaders(prev);
      if (duplicatesFound) setError("Duplicate headers removed");
      return filtered;
    });
    setShowHeadersModal(false);
  };

  const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);
  const updateHeader = (i, field, value) =>
    setHeaders(
      headers.map((h, idx) => (idx === i ? { ...h, [field]: value } : h))
    );
  const removeHeader = (i) => setHeaders(headers.filter((_, idx) => idx !== i));

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 2000);
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <h3>Manage Headers</h3>
        {headers.map((h, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <Input
                placeholder="Key"
                value={h.key}
                onChange={(e) => updateHeader(i, "key", e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                placeholder="Value"
                value={h.value}
                onChange={(e) => updateHeader(i, "value", e.target.value)}
              />
            </div>
            <Button variant="blank" onClick={() => removeHeader(i)}>
              <RxCross2 />
            </Button>
          </div>
        ))}

        {error && (
          <div style={{ color: "var(--color-error)", fontSize: 13, marginTop: 8 }}>
            {error}
          </div>
        )}

        <Button onClick={addHeader}>+ Add Header</Button>
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}
        >
          <Button onClick={close}>Close</Button>
        </div>
      </div>
    </div>
  );
}

// Inline styles using root variables
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
