import "./Button.css";

export function Button({ children, variant = "primary", ...props }) {
  const appliedVariant = variant || "primary"; // fallback safety

  return (
    <button {...props} className={`btn btn-${appliedVariant}`}>
      {children}
    </button>
  );
}
