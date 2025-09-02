import "./Input.css";

export function Input({ label, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input {...props} className="form-input" />
    </div>
  );
}
