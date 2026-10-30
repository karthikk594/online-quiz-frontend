// src/components/Alert.jsx
// Displays success, error, or info messages with an icon and animation.

/**
 * Props:
 *   type    – 'success' | 'error' | 'info'
 *   message – string to display
 */
export default function Alert({ type = 'info', message }) {
  if (!message) return null;

  const icons = {
    success: '✅',
    error:   '❌',
    info:    'ℹ️',
  };

  return (
    <div className={`alert alert-${type}`} role="alert">
      <span>{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}
