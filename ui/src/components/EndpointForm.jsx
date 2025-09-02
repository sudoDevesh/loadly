import { useState } from "react";
import { Button } from "../elements/Button/Button";
import { Input } from "../elements/Input/Input";
import { Select } from "../elements/Select/Select";
import { Textarea } from "../elements/Textarea/Textarea";

export default function EndpointForm({ initial, onSave, onCancel }) {
  const [url, setUrl] = useState(initial?.url || "");
  const [method, setMethod] = useState(initial?.method || "GET");
  const [body, setBody] = useState(
    initial?.body ? JSON.stringify(initial.body, null, 2) : ""
  );
  const [error, setError] = useState("");

  const save = () => {
    // Validate URL
    try {
      new URL(url);
    } catch {
      setError("Invalid URL format");
      return;
    }

    // Validate JSON body
    try {
      const parsedBody = body ? JSON.parse(body) : undefined;
      onSave({ url, method, ...(parsedBody ? { body: parsedBody } : {}) });
    } catch (e) {
      setError("Invalid JSON in body: " + e.message);
      return;
    }

    setError("");
  };

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <h3>{initial ? "Edit Endpoint" : "Add Endpoint"}</h3>
        <Input label="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        <Select
          label="Method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          options={["GET", "POST", "PUT", "PATCH", "DELETE"]}
        />
        <Textarea
          placeholder="Optional JSON body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          style={{
            width: "100%",
            fontFamily: "monospace",
            fontSize: 13,
            marginTop: 8,
          }}
        />
        {error && (
          <div style={{ color: "var(--color-error)", fontSize: 13, marginTop: 8 }}>
            {error}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </div>
    </div>
  );
}

// ----- Styles -----
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
  width: "500px",
};
