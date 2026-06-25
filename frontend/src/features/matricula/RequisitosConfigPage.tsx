import React, { useEffect, useState } from "react";
import { apiGet } from "../../services/apiClient";
import { showSuccess, showWarning } from "../../components/Toast";
import { Pagination } from "../../components/Pagination";
import {
  obtenerRequisitosConfig,
  crearRequisitoConfig,
  actualizarRequisitoConfig,
  eliminarRequisitoConfig,
} from "./services/requisitosConfigApi";
import type { MatriculaRequisito } from "../../types/entities/matricula";

const INPUT_STYLE: React.CSSProperties = {
  height: "38px", padding: "0 10px", borderRadius: "6px",
  border: "1px solid var(--outline-variant)", width: "100%", boxSizing: "border-box",
};
const LABEL_STYLE: React.CSSProperties = {
  fontSize: "13px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "4px", display: "block",
};
const TEXTAREA_STYLE: React.CSSProperties = {
  ...INPUT_STYLE, height: "auto", minHeight: "80px", padding: "10px", resize: "vertical",
};

export function RequisitosConfigPage() {
  const [items, setItems] = useState<MatriculaRequisito[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<MatriculaRequisito | null>(null);

  const [periodos, setPeriodos] = useState<any[]>([]);
  const [niveles, setNiveles] = useState<any[]>([]);
  const [catalogosLoading, setCatalogosLoading] = useState(true);

  const [form, setForm] = useState({
    nombre: "", descripcion: "", tipo: "Informativo", es_obligatorio: true,
    periodo_id: "", educacion_nivel_id: "",
  });

  const rowsPerPage = 10;

  const cargarItems = async () => {
    try {
      const data = await obtenerRequisitosConfig();
      setItems(data);
    } catch (err) {
      console.error("Error cargando requisitos config:", err);
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      const [pers, niv] = await Promise.all([
        apiGet<any[]>("/matricula/periodos/"),
        apiGet<any[]>("/planificacion/niveles/"),
      ]);
      setPeriodos(pers);
      setNiveles(niv);
    } catch (err) {
      console.error("Error cargando catálogos:", err);
    } finally {
      setCatalogosLoading(false);
    }
  };

  useEffect(() => {
    cargarItems();
    cargarCatalogos();
  }, []);

  const rows = items;
  const totalPages = Math.ceil(rows.length / rowsPerPage) || 1;
  const startIndex = (page - 1) * rowsPerPage;
  const paginados = rows.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => { setPage(1); }, [items.length]);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: "", descripcion: "", tipo: "Informativo", es_obligatorio: true, periodo_id: "", educacion_nivel_id: "" });
    setShowModal(true);
  };

  const abrirEditar = (r: MatriculaRequisito) => {
    setEditando(r);
    setForm({
      nombre: r.nombre,
      descripcion: r.descripcion,
      tipo: r.tipo,
      es_obligatorio: r.es_obligatorio,
      periodo_id: r.periodo_id?.toString() ?? "",
      educacion_nivel_id: r.educacion_nivel_id?.toString() ?? "",
    });
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleGuardar = async () => {
    const payload: any = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      tipo: form.tipo,
      es_obligatorio: form.es_obligatorio,
      periodo_id: form.periodo_id ? Number(form.periodo_id) : null,
      educacion_nivel_id: form.educacion_nivel_id ? Number(form.educacion_nivel_id) : null,
    };
    try {
      if (editando) {
        await actualizarRequisitoConfig(editando.id, payload);
        showSuccess("Requisito actualizado correctamente.");
      } else {
        await crearRequisitoConfig(payload);
        showSuccess("Requisito creado correctamente.");
      }
      setShowModal(false);
      cargarItems();
    } catch (err: any) {
      showWarning(err?.data ? JSON.stringify(err.data) : "Error al guardar el requisito.");
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm("¿Está seguro de eliminar este requisito?")) return;
    try {
      await eliminarRequisitoConfig(id);
      showSuccess("Requisito eliminado correctamente.");
      cargarItems();
    } catch {
      showWarning("No se pudo eliminar el requisito. Puede estar asociado a documentos entregados.");
    }
  };

  const badgeObligatorio = (oblig: boolean): React.CSSProperties => ({
    background: oblig ? "#fee2e2" : "#dcfce7",
    color: oblig ? "#991b1b" : "#166534",
    padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", display: "inline-block",
  });

  const badgeTipo = (tipo: string): React.CSSProperties => ({
    background: tipo === "Informativo" ? "#f3e8ff" : "#dbeafe",
    color: tipo === "Informativo" ? "#6b21a8" : "#1e40af",
    padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", display: "inline-block",
  });

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "16px 20px" }}>
        <h2 style={{ margin: 0, color: "var(--primary)" }}>Configuración de Requisitos</h2>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={abrirCrear}
          style={{ background: "var(--secondary)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
          + Nuevo Requisito
        </button>
      </div>

      <div style={{ background: "var(--surface-container-lowest)", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "hidden" }}>
        <div style={{ padding: "12px 20px", background: "var(--surface-container-low)", color: "var(--on-surface-variant)", fontSize: "14px", borderBottom: "1px solid var(--outline-variant)" }}>
          Mostrando {rows.length} requisitos configurados
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--primary)", color: "white" }}>
              <th style={{ padding: "12px", width: "60px" }}>NRO</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Nombre</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Tipo</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Obligatorio</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Periodo</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Nivel</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: "20px", textAlign: "center" }}>Cargando...</td></tr>
            ) : paginados.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "20px", textAlign: "center" }}>No hay requisitos configurados</td></tr>
            ) : (
              paginados.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                  <td style={{ padding: "12px", color: "var(--on-surface-variant)" }}>{startIndex + i + 1}</td>
                  <td style={{ padding: "12px" }}>
                    <div>{r.nombre}</div>
                    {r.descripcion && <div style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "2px" }}>{r.descripcion}</div>}
                  </td>
                  <td style={{ padding: "12px" }}><span style={badgeTipo(r.tipo)}>{r.tipo_display || r.tipo}</span></td>
                  <td style={{ padding: "12px" }}><span style={badgeObligatorio(r.es_obligatorio)}>{r.es_obligatorio ? "Sí" : "No"}</span></td>
                  <td style={{ padding: "12px", fontSize: "14px" }}>{r.periodo_nombre || (catalogosLoading ? "..." : "-")}</td>
                  <td style={{ padding: "12px", fontSize: "14px" }}>{r.educacion_nivel_nombre || (catalogosLoading ? "..." : "-")}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button onClick={() => abrirEditar(r)} title="Editar"
                      style={{ background: "transparent", border: "none", cursor: "pointer", marginRight: "8px", fontSize: "16px" }}>✏️</button>
                    <button onClick={() => handleEliminar(r.id)} title="Eliminar"
                      style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ width: "90%", maxWidth: "600px", background: "white", borderRadius: "10px", padding: "24px" }}>
            <h3 style={{ margin: "0 0 20px", color: "var(--primary)" }}>
              {editando ? "Editar Requisito" : "Nuevo Requisito"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={LABEL_STYLE}>Nombre</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} style={INPUT_STYLE} placeholder="Ej: Certificado de Matrícula" />
              </div>

              <div>
                <label style={LABEL_STYLE}>Descripción</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} style={TEXTAREA_STYLE} placeholder="Descripción del requisito (opcional)" />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={LABEL_STYLE}>Tipo</label>
                  <select name="tipo" value={form.tipo} onChange={handleChange} style={INPUT_STYLE}>
                    <option value="Informativo">Informativo</option>
                    <option value="Evidencia">Evidencia</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "flex-end", paddingBottom: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "var(--on-surface-variant)" }}>
                    <input name="es_obligatorio" type="checkbox" checked={form.es_obligatorio} onChange={handleChange} />
                    Obligatorio
                  </label>
                </div>
              </div>

              <div>
                <label style={LABEL_STYLE}>Periodo de Matrícula</label>
                <select name="periodo_id" value={form.periodo_id} onChange={handleChange} style={INPUT_STYLE} disabled={catalogosLoading}>
                  <option value="">{catalogosLoading ? "Cargando..." : periodos.length === 0 ? "No hay periodos" : "Seleccione..."}</option>
                  {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre || `${p.tipo_display || p.tipo} (${new Date(p.fecha_inicio).toLocaleDateString()})`}</option>)}
                </select>
              </div>

              <div>
                <label style={LABEL_STYLE}>Nivel de Educación</label>
                <select name="educacion_nivel_id" value={form.educacion_nivel_id} onChange={handleChange} style={INPUT_STYLE} disabled={catalogosLoading}>
                  <option value="">{catalogosLoading ? "Cargando..." : niveles.length === 0 ? "No hay niveles" : "Seleccione..."}</option>
                  {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button onClick={() => setShowModal(false)}
                style={{ background: "transparent", border: "1px solid var(--outline-variant)", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleGuardar}
                style={{ background: "var(--secondary)", color: "white", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                {editando ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
