import { Loader2, TriangleAlert } from "lucide-react";
import { aviso, btnSecundario } from "./estilos";

export function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 32, color: "var(--on-surface-variant)" }}>
      <Loader2 size={18} style={{ animation: "cal-girar 0.8s linear infinite" }} />
      {texto}
    </div>
  );
}

export function ErrorCarga({ mensaje, onReintentar }: { mensaje: string; onReintentar: () => void }) {
  return (
    <div style={{ ...aviso("error"), alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }} role="alert">
      <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
        <TriangleAlert size={16} /> {mensaje}
      </span>
      <button type="button" onClick={onReintentar} style={{ ...btnSecundario, padding: "6px 14px" }}>
        Reintentar
      </button>
    </div>
  );
}
