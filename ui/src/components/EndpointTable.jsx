import { MdAdd, MdDeleteOutline, MdOpenInFull } from "react-icons/md";
import { Button } from "../elements/Button/Button";

const methodColors = {
  GET: "var(--color-get)",
  POST: "var(--color-post)",
  PUT: "var(--color-put)",
  DELETE: "var(--color-delete)",
  PATCH: "var(--color-patch)",
  OPTIONS: "var(--color-options)",
  HEAD: "var(--color-head)",
};

export default function EndpointTable({ endpoints, setEndpoints, disabled, setEditingIndex, setShowAddEndpointModal }) {
  const removeEndpoint = (i) => setEndpoints(endpoints.filter((_, idx) => idx !== i));

  const methodBadgeStyle = (method) => ({
    padding: "4px 8px",
    borderRadius: 6,
    color: "var(--color-white)",
    fontWeight: 600,
    fontSize: 12,
    backgroundColor: methodColors[method] || "var(--color-options)",
    display: "inline-block",
    minWidth: 50,
    textAlign: "center",
  });

  return (
    <div style={{ marginTop: 20 }}>
      {/* Header Row */}
      <div style={headerRowStyle}>
        <h4 style={{ margin: 0 }}>Endpoints</h4>
        <Button
          variant="secondary"
          onClick={() => setShowAddEndpointModal(true)}
          style={iconButtonStyle}
        >
          <MdAdd size={20} />
        </Button>
      </div>

      {/* Table */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Method</th>
            <th style={thStyle}>URL</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map((ep, i) => (
            <tr key={i}>
              <td style={tdStyle}>
                <span style={methodBadgeStyle(ep.method)}>
                  {ep.method}
                </span>
              </td>
              <td style={tdStyle}>{ep.url}</td>
              <td style={{ ...tdStyle, display: "flex", justifyContent: "center", gap: 8 }}>
                <Button variant="blank" style={iconButtonStyle} onClick={() => setEditingIndex(i)}>
                  <MdOpenInFull size={18} />
                </Button>
                <Button variant="blank" style={iconButtonStyle} onClick={() => removeEndpoint(i)}>
                  <MdDeleteOutline size={18} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ----- Styles -----
const headerRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  border: "1px solid var(--color-table-border)",
};

const thStyle = {
  border: "1px solid var(--color-table-border)",
  padding: "10px 8px",
  textAlign: "left",
  background: "var(--color-table-header-bg)",
  fontWeight: 600,
};

const tdStyle = {
  border: "1px solid var(--color-table-border)",
  padding: "10px 8px",
  verticalAlign: "middle",
  wordBreak: "break-word",
};

const iconButtonStyle = {
  padding: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
