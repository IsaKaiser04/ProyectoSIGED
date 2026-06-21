import type { AlertType } from "./AlertMessage";

type AlertOptions = {
  type?: AlertType;
  title?: string;
  message: string;
};

type ConfirmOptions = {
  type?: AlertType;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export const showAlert = ({ type = "info", title, message }: AlertOptions) => {
  window.dispatchEvent(
    new CustomEvent("siged:alert", {
      detail: { type, title, message },
    })
  );
};

export const confirmAction = ({
  type = "warning",
  title = "Confirmar accion",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
}: ConfirmOptions): Promise<boolean> => {
  return new Promise((resolve) => {
    window.dispatchEvent(
      new CustomEvent("siged:confirm", {
        detail: { type, title, message, confirmLabel, cancelLabel, resolve },
      })
    );
  });
};
