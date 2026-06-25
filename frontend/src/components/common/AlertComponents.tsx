interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Cargando...' }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}

interface ErrorAlertProps {
  error: string | null;
  onDismiss?: () => void;
}

export function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
  if (!error) return null;
  return (
    <div className="error-alert">
      <span>{error}</span>
      {onDismiss && (
        <button className="error-dismiss" onClick={onDismiss}>
          &times;
        </button>
      )}
    </div>
  );
}
