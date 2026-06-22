import React from "react";
import type { ErrorInfo } from "../../utils/errorHandler";

interface ErrorAlertProps {
  error: ErrorInfo | string | null;
  onDismiss?: () => void;
  variant?: "error" | "warning" | "info";
  dismissible?: boolean;
}

/**
 * Componente reutilizable para mostrar errores de forma controlada y amigable
 * Incluye estilos defensivos para evitar que textos largos rompan el layout
 */
export function ErrorAlert({
  error,
  onDismiss,
  variant = "error",
  dismissible = true
}: ErrorAlertProps) {
  if (!error) return null;

  const message = typeof error === "string" ? error : error.message;

  return (
    <div className={`error-alert error-alert--${variant} error-container`}>
      <p className="state-message">{message}</p>
      {dismissible && onDismiss && (
        <button 
          type="button" 
          className="text-button"
          onClick={onDismiss}
          aria-label="Descartar mensaje de error"
        >
          Descartar
        </button>
      )}
    </div>
  );
}

interface LoadingSpinnerProps {
  message?: string;
  fullHeight?: boolean;
}

/**
 * Componente de carga reutilizable
 */
export function LoadingSpinner({
  message = "Cargando...",
  fullHeight = false
}: LoadingSpinnerProps) {
  return (
    <div 
      className={`loading-container error-container ${fullHeight ? "loading-fullheight" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="spinner" />
      <p className="state-message">{message}</p>
    </div>
  );
}

interface EmptyStateProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Componente para estado vacío
 */
export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="empty-state-container error-container">
      <p className="state-message">{message}</p>
      {action && (
        <button 
          type="button" 
          className="primary-button"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface StatusMessageProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onDismiss?: () => void;
}

/**
 * Componente para mensajes de estado genéricos
 */
export function StatusMessage({
  message,
  type = "info",
  onDismiss
}: StatusMessageProps) {
  return (
    <div 
      className={`status-message status-message--${type} error-container`}
      role="alert"
    >
      <p className="state-message">{message}</p>
      {onDismiss && (
        <button 
          type="button" 
          className="text-button"
          onClick={onDismiss}
          aria-label={`Cerrar mensaje de ${type}`}
        >
          ×
        </button>
      )}
    </div>
  );
}
