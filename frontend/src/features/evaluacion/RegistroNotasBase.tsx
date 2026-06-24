import { useState, useEffect } from "react";
import { obtenerMisAsignaturas } from "../vinculacion-curricular/services/vinculacionApi";
import type { DistributivoAsignaturaConPca } from "../../types/entities/distributivo";

export const RegistroNotasBase: React.FC = () => {
  const [asignaturas, setAsignaturas] = useState<DistributivoAsignaturaConPca[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerMisAsignaturas()
      .then((data) => setAsignaturas(data || []))
      .catch(() => setAsignaturas([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="content-heading" style={{ padding: "24px" }}>
      <h2>Registro de Notas</h2>
      <p style={{ marginTop: "8px", color: "var(--on-surface-variant)" }}>
        Módulo de calificaciones — Pr&oacute;ximamente podr&aacute; registrar notas parciales, finales y promedios.
      </p>

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <h4 style={{ margin: 0, color: "var(--primary)" }}>Mis Asignaturas</h4>
        {loading ? (
          <p style={{ color: "var(--on-surface-variant)", fontSize: 14 }}>Cargando...</p>
        ) : asignaturas.length === 0 ? (
          <p style={{ color: "var(--on-surface-variant)", fontSize: 14 }}>
            No tienes asignaturas asignadas en este per&iacute;odo.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, fontSize: "var(--font-body-sm)", color: "#fff", background: "var(--primary)" }}>Asignatura</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, fontSize: "var(--font-body-sm)", color: "#fff", background: "var(--primary)" }}>Grado</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, fontSize: "var(--font-body-sm)", color: "#fff", background: "var(--primary)" }}>Paralelo</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, fontSize: "var(--font-body-sm)", color: "#fff", background: "var(--primary)" }}>Estado PCA</th>
              </tr>
            </thead>
            <tbody>
              {asignaturas.map((a) => (
                <tr key={a.id}>
                  <td style={{ padding: "10px 14px", fontSize: "var(--font-body-sm)", color: "var(--on-surface)", borderBottom: "1px solid var(--outline-variant)", fontWeight: 600 }}>{a.asignatura_ofertada_nombre}</td>
                  <td style={{ padding: "10px 14px", fontSize: "var(--font-body-sm)", color: "var(--on-surface)", borderBottom: "1px solid var(--outline-variant)" }}>{a.grado_nombre}</td>
                  <td style={{ padding: "10px 14px", fontSize: "var(--font-body-sm)", color: "var(--on-surface)", borderBottom: "1px solid var(--outline-variant)" }}>{a.paralelo_nombre}</td>
                  <td style={{ padding: "10px 14px", fontSize: "var(--font-body-sm)", color: "var(--on-surface)", borderBottom: "1px solid var(--outline-variant)" }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                      background: a.pca_estado === "APROBADO" ? "#dcfce7" : a.pca_estado === "POR_APROBAR" ? "#fef3c7" : "#e2e8f0",
                      color: a.pca_estado === "APROBADO" ? "#166534" : a.pca_estado === "POR_APROBAR" ? "#92400e" : "#475569",
                    }}>
                      {a.pca_estado_display || "Sin PCA"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
