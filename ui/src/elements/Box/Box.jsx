
export default function Box({ title, value }) {
  return (
    <div
      style={{
        background: "var(--color-table-header-bg)",
        border: `1px solid var(--color-table-border)`,
        borderRadius: "var(--border-radius, 10px)",
        padding: "var(--spacing, 12px)",
      }}
    >
      <div style={{ fontSize: "12px", color: "var(--color-head)" }}>{title}</div>
      <div style={{ fontSize: "20px", fontWeight: 700 }}>{value ?? "—"}</div>
    </div>
  );
}
