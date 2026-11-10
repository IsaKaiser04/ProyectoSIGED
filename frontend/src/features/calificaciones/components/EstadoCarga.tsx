import { aviso, btnSecundario, tarjeta } from "./estilos";

export function Cargando({ texto = "Cargando..." }: { texto?: string }) {
  return <div style={{ ...tarjeta, color: "var(--on-surface-variant)" }}>{texto}</div>;
}

export function ErrorCarga({ mensaje, onReintentar }: { mensaje: string; onReintentar: () => void }) {
  return (
    <div style={{ ...aviso("error"), alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }} role="alert">
      <span>⚠️ {mensaje}</span>
      <button type="button" onClick={onReintentar} style={{ ...btnSecundario, height: 34 }}>
        🔄 Reintentar
      </button>
    </div>
  );
}
