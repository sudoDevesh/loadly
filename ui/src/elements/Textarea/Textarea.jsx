import "./Textarea.css";

export function Textarea({ label, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <textarea {...props} className="form-textarea" />
    </div>
  );
}
