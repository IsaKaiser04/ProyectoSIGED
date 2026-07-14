import React, { useEffect, useState } from "react";
import { apiGet } from "../../services/apiClient";
import { showSuccess, showWarning } from "../../components/Toast";
import { Pagination } from "../../components/Pagination";
import {
  obtenerPeriodos,
  crearPeriodo,
  actualizarPeriodo,
  eliminarPeriodo,
} from "./services/periodosMatriculaApi";
import type { MatriculaPeriodo } from "../../types/entities/matricula";

const INPUT_STYLE: React.CSSProperties = {
  height: "38px", padding: "0 10px", borderRadius: "6px",
  border: "1px solid var(--outline-variant)", width: "100%", boxSizing: "border-box",
};
const LABEL_STYLE: React.CSSProperties = {
  fontSize: "13px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "4px", display: "block",
};

export function PeriodosMatriculaPage() {
  const [periodos, setPeriodos] = useState<MatriculaPeriodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<MatriculaPeriodo | null>(null);

  const [niveles, setNiveles] = useState<any[]>([]);
  const [aniosLectivos, setAniosLectivos] = useState<any[]>([]);
  const [catalogosLoading, setCatalogosLoading] = useState(true);

  const [form, setForm] = useState({
    nombre: "", tipo: "Ordinaria", fecha_inicio: "", fecha_fin: "",
    educacion_nivel_id: "", anio_lectivo_id: "",
  });

  const rowsPerPage = 10;

  const cargarPeriodos = async () => {
    try {
      const data = await obtenerPeriodos();
      setPeriodos(data);
    } catch (err) {
      console.error("Error cargando periodos:", err);
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      const [niv, anios] = await Promise.all([
        apiGet<any[]>("/planificacion/niveles/"),
        apiGet<any[]>("/planificacion/anios-lectivos/"),
      ]);
      setNiveles(niv);
      setAniosLectivos(anios);
    } catch (err) {
      console.error("Error cargando catálogos:", err);
    } finally {
      setCatalogosLoading(false);
    }
  };

  useEffect(() => {
    cargarPeriodos();
    cargarCatalogos();
  }, []);

  const periodosFiltrados = periodos.filter(p => !filtroTipo || p.tipo === filtroTipo);
  const totalPages = Math.ceil(periodosFiltrados.length / rowsPerPage) || 1;
  const startIndex = (page - 1) * rowsPerPage;
  const periodosPaginados = periodosFiltrados.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => { setPage(1); }, [filtroTipo]);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: "", tipo: "Ordinaria", fecha_inicio: "", fecha_fin: "", educacion_nivel_id: "", anio_lectivo_id: "" });
    setShowModal(true);
  };

  const abrirEditar = (p: MatriculaPeriodo) => {
    setEditando(p);
    setForm({
      nombre: p.nombre,
      tipo: p.tipo,
      fecha_inicio: p.fecha_inicio.slice(0, 10),
      fecha_fin: p.fecha_fin.slice(0, 10),
      educacion_nivel_id: p.educacion_nivel_id?.toString() ?? "",
      anio_lectivo_id: p.anio_lectivo_id?.toString() ?? "",
    });
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGuardar = async () => {
    const payload: any = {
      nombre: form.nombre,
      tipo: form.tipo,
      fecha_inicio: form.fecha_inicio ? new Date(form.fecha_inicio).toISOString() : undefined,
      fecha_fin: form.fecha_fin ? new Date(form.fecha_fin).toISOString() : undefined,
      educacion_nivel_id: form.educacion_nivel_id ? Number(form.educacion_nivel_id) : null,
      anio_lectivo_id: form.anio_lectivo_id ? Number(form.anio_lectivo_id) : null,
    };
    try {
      if (editando) {
        await actualizarPeriodo(editando.id, payload);
        showSuccess("Periodo actualizado correctamente.");
      } else {
        await crearPeriodo(payload);
        showSuccess("Periodo creado correctamente.");
      }
      setShowModal(false);
      cargarPeriodos();
    } catch (err: any) {
      showWarning(err?.data ? JSON.stringify(err.data) : "Error al guardar el periodo.");
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm("¿Está seguro de eliminar este periodo de matrícula?")) return;
    try {
      await eliminarPeriodo(id);
      showSuccess("Periodo eliminado correctamente.");
      cargarPeriodos();
    } catch {
      showWarning("No se pudo eliminar el periodo. Puede tener matrículas asociadas.");
    }
  };

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "16px 20px" }}>
        <h2 style={{ margin: 0, color: "var(--primary)" }}>Periodos de Matrícula</h2>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <strong style={{ color: "var(--on-surface-variant)", fontSize: "14px" }}>Filtrar:</strong>
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
            style={{ height: "38px", padding: "0 10px", borderRadius: "6px", border: "1px solid var(--outline-variant)" }}>
            <option value="">Todos los tipos</option>
            <option value="Ordinaria">Ordinaria</option>
            <option value="Extraordinaria">Extraordinaria</option>
            <option value="Especial">Especial</option>
          </select>
        </div>
        <button onClick={abrirCrear}
          style={{ background: "var(--secondary)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
          + Nuevo Periodo
        </button>
      </div>

      <div style={{ background: "var(--surface-container-lowest)", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "hidden" }}>
        <div style={{ padding: "12px 20px", background: "var(--surface-container-low)", color: "var(--on-surface-variant)", fontSize: "14px", borderBottom: "1px solid var(--outline-variant)" }}>
          Mostrando {periodosFiltrados.length} de {periodos.length} periodos
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--primary)", color: "white" }}>
              <th style={{ padding: "12px", width: "60px" }}>NRO</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Nombre</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Tipo</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Inicio</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Fin</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Nivel</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Año Lectivo</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding: "20px", textAlign: "center" }}>Cargando...</td></tr>
            ) : periodosPaginados.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: "20px", textAlign: "center" }}>No existen periodos de matrícula</td></tr>
            ) : (
              periodosPaginados.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                  <td style={{ padding: "12px", color: "var(--on-surface-variant)" }}>{startIndex + i + 1}</td>
                  <td style={{ padding: "12px" }}>{p.nombre}</td>
                  <td style={{ padding: "12px" }}><span style={{
                    background: p.tipo === "Ordinaria" ? "#dcfce7" : p.tipo === "Extraordinaria" ? "#fef9c3" : "#f3e8ff",
                    color: p.tipo === "Ordinaria" ? "#166534" : p.tipo === "Extraordinaria" ? "#854d0e" : "#6b21a8",
                    padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", display: "inline-block",
                  }}>{p.tipo_display || p.tipo}</span></td>
                  <td style={{ padding: "12px", fontSize: "14px" }}>{new Date(p.fecha_inicio).toLocaleDateString()}</td>
                  <td style={{ padding: "12px", fontSize: "14px" }}>{new Date(p.fecha_fin).toLocaleDateString()}</td>
                  <td style={{ padding: "12px", fontSize: "14px" }}>{p.educacion_nivel_nombre || (catalogosLoading ? "..." : "-")}</td>
                  <td style={{ padding: "12px", fontSize: "14px" }}>{p.anio_lectivo_nombre || (catalogosLoading ? "..." : "-")}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button onClick={() => abrirEditar(p)} title="Editar"
                      style={{ background: "transparent", border: "none", cursor: "pointer", marginRight: "8px", fontSize: "16px" }}>✏️</button>
                    <button onClick={() => handleEliminar(p.id)} title="Eliminar"
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
              {editando ? "Editar Periodo" : "Nuevo Periodo de Matrícula"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={LABEL_STYLE}>Nombre</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} style={INPUT_STYLE} placeholder="Ej: Periodo 2025-2026" />
              </div>

              <div>
                <label style={LABEL_STYLE}>Tipo</label>
                <select name="tipo" value={form.tipo} onChange={handleChange} style={INPUT_STYLE}>
                  <option value="Ordinaria">Ordinaria</option>
                  <option value="Extraordinaria">Extraordinaria</option>
                  <option value="Especial">Especial</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={LABEL_STYLE}>Fecha Inicio</label>
                  <input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={handleChange} style={INPUT_STYLE} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={LABEL_STYLE}>Fecha Fin</label>
                  <input name="fecha_fin" type="date" value={form.fecha_fin} onChange={handleChange} style={INPUT_STYLE} />
                </div>
              </div>

              <div>
                <label style={LABEL_STYLE}>Nivel de Educación</label>
                <select name="educacion_nivel_id" value={form.educacion_nivel_id} onChange={handleChange} style={INPUT_STYLE} disabled={catalogosLoading}>
                  <option value="">{catalogosLoading ? "Cargando..." : niveles.length === 0 ? "No hay niveles disponibles" : "Seleccione..."}</option>
                  {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                </select>
              </div>

              <div>
                <label style={LABEL_STYLE}>Año Lectivo</label>
                <select name="anio_lectivo_id" value={form.anio_lectivo_id} onChange={handleChange} style={INPUT_STYLE} disabled={catalogosLoading}>
                  <option value="">{catalogosLoading ? "Cargando..." : aniosLectivos.length === 0 ? "No hay años lectivos disponibles" : "Seleccione..."}</option>
                  {aniosLectivos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
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
