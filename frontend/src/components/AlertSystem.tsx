import React, { useEffect, useState } from "react";
import type { AlertType } from "./AlertMessage";

type AlertState = {
  type: AlertType;
  title?: string;
  message: string;
};

type ConfirmState = {
  type: AlertType;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  resolve: (value: boolean) => void;
};

const config: Record<AlertType, { label: string; icon: string }> = {
  success: { label: "Confirmacion", icon: "✓" },
  error: { label: "Error", icon: "!" },
  warning: { label: "Datos incompletos", icon: "!" },
  info: { label: "Aviso", icon: "i" },
};

export const AlertSystem: React.FC = () => {
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  useEffect(() => {
    const handleAlert = (event: Event) => {
      const detail = (event as CustomEvent<AlertState>).detail;
      setAlert(detail);
    };

    const handleConfirm = (event: Event) => {
      const detail = (event as CustomEvent<ConfirmState>).detail;
      setConfirm(detail);
    };

    window.addEventListener("siged:alert", handleAlert);
    window.addEventListener("siged:confirm", handleConfirm);

    return () => {
      window.removeEventListener("siged:alert", handleAlert);
      window.removeEventListener("siged:confirm", handleConfirm);
    };
  }, []);

  useEffect(() => {
    if (!alert) return;
    const timeout = window.setTimeout(() => setAlert(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [alert]);

  const closeConfirm = (value: boolean) => {
    confirm?.resolve(value);
    setConfirm(null);
  };

  return (
    <>
      {alert && (
        <div className="alert-host">
          <div className={`alert-message alert-message--${alert.type}`} role="alert">
            <span className="alert-message__icon" aria-hidden="true">
              {config[alert.type].icon}
            </span>
            <div className="alert-message__body">
              <strong>{alert.title ?? config[alert.type].label}</strong>
              <span>{alert.message}</span>
            </div>
            <button className="alert-message__close" type="button" onClick={() => setAlert(null)} aria-label="Cerrar alerta">
              ×
            </button>
          </div>
        </div>
      )}

      {confirm && (
        <div className="confirm-dialog__backdrop" role="presentation">
          <div className={`confirm-dialog confirm-dialog--${confirm.type}`} role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
            <span className="confirm-dialog__icon" aria-hidden="true">
              {config[confirm.type].icon}
            </span>
            <div className="confirm-dialog__content">
              <h3 id="confirm-dialog-title">{confirm.title}</h3>
              <p>{confirm.message}</p>
            </div>
            <div className="confirm-dialog__actions">
              <button className="confirm-dialog__button confirm-dialog__button--cancel" type="button" onClick={() => closeConfirm(false)}>
                {confirm.cancelLabel}
              </button>
              <button className="confirm-dialog__button confirm-dialog__button--confirm" type="button" onClick={() => closeConfirm(true)}>
                {confirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
