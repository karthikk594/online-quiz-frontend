// src/components/Spinner.jsx
// Simple centered loading spinner

export default function Spinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <p className="text-muted">{message}</p>
    </div>
  );
}
