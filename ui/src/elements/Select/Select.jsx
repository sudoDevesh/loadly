import "./Select.css";

export function Select({ label, options = [], ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select {...props} className="form-input">
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
