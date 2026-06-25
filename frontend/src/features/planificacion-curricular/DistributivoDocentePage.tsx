import React, { useEffect, useState } from "react";
import { apiGet } from "../../services/apiClient";
import {
  obtenerDistributivos,
  crearDistributivo,
  actualizarDistributivo,
  eliminarDistributivo,
  obtenerAsignaturasDistributivo,
  crearAsignaturaDistributivo,
  eliminarAsignaturaDistributivo
} from "./services/distributivosApi";
import { horariosPorDistributivo, crearHorario, eliminarHorario } from "./services/horariosApi";
import { obtenerJornadas } from "./services/jornadasApi";

type Vista = "lista" | "nuevo" | "editar" | "asignaturas" | "horarios";

export default function DistributivoDocentePage() {
  const [distributivos, setDistributivos] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [aniosLectivos, setAniosLectivos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<Vista>("lista");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({ anio_lectivo: "", docente: "", observacion: "" });
  const [asignaturas, setAsignaturas] = useState<any[]>([]);
  const [asignaturasOfertadas, setAsignaturasOfertadas] = useState<any[]>([]);
  const [gradosOfertados, setGradosOfertados] = useState<any[]>([]);
  const [paralelos, setParalelos] = useState<any[]>([]);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [jornadas, setJornadas] = useState<any[]>([]);
  const [horarioForm, setHorarioForm] = useState({
    distributivo_asignatura: "",
    jornada_hora: "",
    hora_inicio: "",
    hora_fin: "",
    tipo_horario: "CLASE",
    dia_semana: "LUNES",
    observacion: ""
  });
  const [asignaturaForm, setAsignaturaForm] = useState({ asignatura_ofertada: "", paralelo: "", observacion: "" });
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [dists, docs, anios] = await Promise.all([
        obtenerDistributivos(),
        apiGet<any[]>("/actoresAcademicos/docentes/"),
        apiGet<any[]>("/planificacion/anios-lectivos/")
      ]);
      setDistributivos(dists);
      setDocentes(docs);
      setAniosLectivos(anios);
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirNuevo = () => {
    setForm({ anio_lectivo: "", docente: "", observacion: "" });
    setSelectedId(null);
    setError("");
    setVista("nuevo");
  };

  const abrirEditar = (d: any) => {
    setForm({ anio_lectivo: d.anio_lectivo, docente: d.docente, observacion: d.observacion });
    setSelectedId(d.id);
    setError("");
    setVista("editar");
  };

  const abrirAsignaturas = async (id: number) => {
    setSelectedId(id);
    setError("");
    try {
      const [asigs, ofertadas, grados, parals] = await Promise.all([
        obtenerAsignaturasDistributivo(id),
        apiGet<any[]>("/planificacion/asignaturas-ofertadas/"),
        apiGet<any[]>("/planificacion/grados-ofertados/"),
        apiGet<any[]>("/planificacion/paralelos/")
      ]);
      setAsignaturas(asigs);
      setAsignaturasOfertadas(ofertadas);
      setGradosOfertados(grados);
      setParalelos(parals);
    } catch {}
    setAsignaturaForm({ asignatura_ofertada: "", paralelo: "", observacion: "" });
    setVista("asignaturas");
  };

  const abrirHorarios = async (distributivoId: number) => {
    setSelectedId(distributivoId);
    setError("");
    try {
      const [hrs, jrns, asigs, ofertadas, grados, parals] = await Promise.all([
        horariosPorDistributivo(distributivoId),
        obtenerJornadas(),
        obtenerAsignaturasDistributivo(distributivoId),
        apiGet<any[]>("/planificacion/asignaturas-ofertadas/"),
        apiGet<any[]>("/planificacion/grados-ofertados/"),
        apiGet<any[]>("/planificacion/paralelos/")
      ]);
      setHorarios(hrs);
      setJornadas(jrns);
      setAsignaturas(asigs);
      setAsignaturasOfertadas(ofertadas);
      setGradosOfertados(grados);
      setParalelos(parals);
    } catch {}
    setHorarioForm({
      distributivo_asignatura: "",
      jornada_hora: "",
      hora_inicio: "",
      hora_fin: "",
      tipo_horario: "CLASE",
      dia_semana: "LUNES",
      observacion: ""
    });
    setVista("horarios");
  };

  const guardar = async () => {
    setError("");
    const payload = {
      anio_lectivo: Number(form.anio_lectivo) || null,
      docente: Number(form.docente) || null,
      observacion: form.observacion
    };
    try {
      if (selectedId) {
        await actualizarDistributivo(selectedId, payload);
      } else {
        await crearDistributivo(payload);
      }
      await cargarDatos();
      setVista("lista");
    } catch (err: any) {
      setError(err?.response?.data ? JSON.stringify(err.response.data) : "Error al guardar");
    }
  };

  const eliminar = async (id: number) => {
    if (!window.confirm("¿Eliminar este distributivo?")) return;
    try {
      await eliminarDistributivo(id);
      await cargarDatos();
    } catch {}
  };

  const agregarAsignatura = async () => {
    if (!asignaturaForm.asignatura_ofertada || !asignaturaForm.paralelo) return;
    setError("");
    try {
      await crearAsignaturaDistributivo({
        distributivo: selectedId,
        asignatura_ofertada: Number(asignaturaForm.asignatura_ofertada),
        paralelo: Number(asignaturaForm.paralelo),
        observacion: asignaturaForm.observacion
      });
      const asigs = await obtenerAsignaturasDistributivo(selectedId!);
      setAsignaturas(asigs);
      setAsignaturaForm({ asignatura_ofertada: "", paralelo: "", observacion: "" });
    } catch (err: any) {
      setError(err?.response?.data ? JSON.stringify(err.response.data) : "Error al agregar asignatura");
    }
  };

  const quitarAsignatura = async (id: number) => {
    if (!window.confirm("¿Quitar esta asignatura del distributivo?")) return;
    try {
      await eliminarAsignaturaDistributivo(id);
      const asigs = await obtenerAsignaturasDistributivo(selectedId!);
      setAsignaturas(asigs);
    } catch {}
  };

  const agregarHorario = async () => {
    if (!horarioForm.distributivo_asignatura || !horarioForm.jornada_hora) return;
    setError("");
    try {
      await crearHorario({
        distributivo: selectedId,
        distributivo_asignatura: Number(horarioForm.distributivo_asignatura),
        jornada_hora: Number(horarioForm.jornada_hora),
        hora_inicio: horarioForm.hora_inicio,
        hora_fin: horarioForm.hora_fin,
        tipo_horario: horarioForm.tipo_horario,
        dia_semana: horarioForm.dia_semana,
        observacion: horarioForm.observacion
      });
      const hrs = await horariosPorDistributivo(selectedId!);
      setHorarios(hrs);
      setHorarioForm((prev) => ({
        ...prev,
        distributivo_asignatura: "",
        jornada_hora: "",
        hora_inicio: "",
        hora_fin: "",
        observacion: ""
      }));
    } catch (err: any) {
      setError(err?.response?.data ? JSON.stringify(err.response.data) : "Error al agregar horario");
    }
  };

  const quitarHorario = async (id: number) => {
    if (!window.confirm("¿Eliminar este horario?")) return;
    try {
      await eliminarHorario(id);
      const hrs = await horariosPorDistributivo(selectedId!);
      setHorarios(hrs);
    } catch {}
  };

  const obtenerGradoNombre = (gradoOfertadoId: number) => {
    const g = gradosOfertados.find((x) => x.id === gradoOfertadoId);
    return g ? g.nombre : `Grado #${gradoOfertadoId}`;
  };

  const obtenerFullAsignaturaNombre = (horarioItem: any) => {
    const da = asignaturas.find((x) => x.id === horarioItem.distributivo_asignatura);
    const asignatura = da ? da.asignatura_ofertada_nombre : (horarioItem.asignatura_nombre || "Materia");
    const ao = da ? asignaturasOfertadas.find((x) => x.id === da.asignatura_ofertada) : null;
    const gradoNombre = ao ? obtenerGradoNombre(ao.gradoOfertado) : (horarioItem.grado_nombre || "Grado");
    const paraleloNombre = da ? (da.paralelo_nombre || "Ninguno") : (horarioItem.paralelo_nombre || "Ninguno");
    return `${asignatura} — ${gradoNombre} (${paraleloNombre})`;
  };

  // Styles definitions
  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 6,
    fontWeight: 600,
    fontSize: "var(--font-body-sm)",
    color: "var(--on-surface)"
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    height: "42px",
    padding: "0 12px",
    borderRadius: "8px",
    border: "1px solid var(--outline-variant)",
    background: "var(--surface)",
    color: "var(--on-surface)",
    fontSize: "14px"
  };

  const btnPrimario: React.CSSProperties = {
    background: "var(--secondary)",
    color: "#fff",
    border: "none",
    padding: "10px 24px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "var(--font-body-sm)"
  };

  const btnSecundario: React.CSSProperties = {
    background: "white",
    color: "var(--on-surface)",
    border: "1px solid var(--outline-variant)",
    padding: "8px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "var(--font-body-sm)"
  };

  const btnAsignar: React.CSSProperties = {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    marginRight: "6px"
  };

  const btnGestionar: React.CSSProperties = {
    background: "var(--secondary)",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    marginRight: "6px"
  };

  const btnEditarSimple: React.CSSProperties = {
    background: "transparent",
    color: "var(--on-surface)",
    border: "1px solid var(--outline-variant)",
    padding: "5px 12px",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    marginRight: "6px"
  };

  const btnEliminarSimple: React.CSSProperties = {
    background: "#fee2e2",
    color: "#ba1a1a",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer"
  };

  const btnProgramar: React.CSSProperties = {
    background: "var(--secondary)",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
    width: "100%",
    marginTop: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  };

  const container: React.CSSProperties = {
    background: "var(--surface-container-lowest)",
    border: "1px solid var(--outline-variant)",
    borderRadius: 8,
    overflow: "hidden"
  };

  const th: React.CSSProperties = {
    padding: 12,
    textAlign: "left",
    fontWeight: 600,
    fontSize: "var(--font-body-sm)",
    color: "#fff",
    background: "var(--primary)"
  };

  const td: React.CSSProperties = {
    padding: 12,
    fontSize: "var(--font-body-sm)",
    color: "var(--on-surface)",
    borderBottom: "1px solid var(--outline-variant)"
  };

  // Timetable Matrix Data
  const diasSemana = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];
  const slotsUnicos = Array.from(
    new Set(
      horarios
        .map((h) => {
          const ini = (h.hora_inicio || "").substring(0, 5);
          const fin = (h.hora_fin || "").substring(0, 5);
          return ini && fin ? `${ini} - ${fin}` : "";
        })
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  if (loading) return <div style={{ padding: 24 }}>Cargando...</div>;

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div
        style={{
          background: "var(--surface-container-lowest)",
          border: "1px solid var(--outline-variant)",
          borderRadius: "8px",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "var(--font-headline-md)" }}>
          Distributivo Docente
        </h2>
        {vista === "lista" && (
          <button onClick={abrirNuevo} style={btnPrimario}>
            + Nuevo Distributivo
          </button>
        )}
      </div>

      {vista === "nuevo" || vista === "editar" ? (
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            border: "1px solid var(--outline-variant)"
          }}
        >
          <h3 style={{ margin: "0 0 16px", color: "var(--primary)" }}>
            {vista === "nuevo" ? "Nuevo Distributivo" : "Editar Distributivo"}
          </h3>
          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "13px"
              }}
            >
              {error}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Año Lectivo *</label>
              <select
                style={fieldStyle}
                value={form.anio_lectivo}
                onChange={(e) => setForm((p) => ({ ...p, anio_lectivo: e.target.value }))}
              >
                <option value="">Seleccione...</option>
                {aniosLectivos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Docente *</label>
              <select
                style={fieldStyle}
                value={form.docente}
                onChange={(e) => setForm((p) => ({ ...p, docente: e.target.value }))}
              >
                <option value="">Seleccione...</option>
                {docentes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombres} {d.apellidos}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Observación</label>
            <textarea
              style={{ ...fieldStyle, height: "80px", padding: "8px 12px" }}
              value={form.observacion}
              onChange={(e) => setForm((p) => ({ ...p, observacion: e.target.value }))}
            />
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={guardar}
              style={{
                background: "var(--primary)",
                color: "white",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Guardar
            </button>
            <button
              onClick={() => setVista("lista")}
              style={{
                background: "white",
                border: "1px solid var(--outline)",
                padding: "10px 24px",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : vista === "asignaturas" ? (
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            border: "1px solid var(--outline-variant)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, color: "var(--primary)" }}>Asignación de Materias</h3>
            <button
              onClick={() => setVista("lista")}
              style={btnSecundario}
            >
              ↩️ Volver
            </button>
          </div>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "13px"
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
              <div style={{ width: "35%" }}>
                <label style={labelStyle}>Asignatura Ofertada *</label>
                <select
                  style={fieldStyle}
                  value={asignaturaForm.asignatura_ofertada}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAsignaturaForm((p) => ({ ...p, asignatura_ofertada: val, paralelo: "" }));
                  }}
                >
                  <option value="">Seleccione una asignatura...</option>
                  {asignaturasOfertadas.map((ao) => {
                    const gradoName = obtenerGradoNombre(ao.gradoOfertado);
                    return (
                      <option key={ao.id} value={ao.id}>
                        {ao.nombre} — {gradoName}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div style={{ width: "35%" }}>
                <label style={labelStyle}>Paralelo *</label>
                <select
                  style={fieldStyle}
                  value={asignaturaForm.paralelo}
                  onChange={(e) => setAsignaturaForm((p) => ({ ...p, paralelo: e.target.value }))}
                  disabled={!asignaturaForm.asignatura_ofertada}
                >
                  <option value="">Seleccione paralelo...</option>
                  {(() => {
                    const selectedAO = asignaturasOfertadas.find((ao) => ao.id === Number(asignaturaForm.asignatura_ofertada));
                    const filteredParalelos = selectedAO
                      ? paralelos.filter((p) => {
                          const belongsToGrado = p.gradoOfertado === selectedAO.gradoOfertado;
                          const alreadyAssigned = asignaturas.some(
                            (a) => a.asignatura_ofertada === selectedAO.id && a.paralelo === p.id
                          );
                          return belongsToGrado && !alreadyAssigned;
                        })
                      : [];
                    return filteredParalelos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.jornada})
                      </option>
                    ));
                  })()}
                </select>
              </div>
              <button
                onClick={agregarAsignatura}
                style={{
                  ...btnPrimario,
                  width: "30%",
                  height: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                ➕ Agregar Asignatura
              </button>
            </div>
          </div>

          <h4 style={{ margin: "0 0 12px", color: "var(--primary)" }}>Materias Agregadas</h4>
          <div style={container}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Materia / Asignatura</th>
                  <th style={th}>Grado / Paralelo</th>
                  <th style={{ ...th, textAlign: "center" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {asignaturas.map((a: any) => {
                  const ao = asignaturasOfertadas.find((x) => x.id === a.asignatura_ofertada);
                  const gradoNombre = ao ? obtenerGradoNombre(ao.gradoOfertado) : "—";
                  return (
                    <tr key={a.id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                      <td style={{ ...td, fontWeight: 600 }}>{a.asignatura_ofertada_nombre}</td>
                      <td style={td}>{gradoNombre} — {a.paralelo_nombre || "—"}</td>
                      <td style={{ ...td, textAlign: "center" }}>
                        <button
                          onClick={() => quitarAsignatura(a.id)}
                          style={{
                            background: "#fee2e2",
                            color: "#ba1a1a",
                            border: "none",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          ❌ Quitar
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {asignaturas.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ ...td, padding: "24px", textAlign: "center", color: "var(--on-surface-variant)" }}>
                      Sin asignaturas asignadas a este docente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : vista === "horarios" ? (
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            border: "1px solid var(--outline-variant)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, color: "var(--primary)" }}>Gestionar Horario Docente</h3>
            <button
              onClick={() => setVista("lista")}
              style={btnSecundario}
            >
              ↩️ Volver
            </button>
          </div>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "13px"
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              background: "var(--surface-container-low)",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid var(--outline-variant)",
              marginBottom: "24px"
            }}
          >
            <div>
              <h4 style={{ margin: "0 0 16px", color: "var(--primary)" }}>Detalles del Horario</h4>

              <div style={{ marginBottom: "12px" }}>
                <label style={labelStyle}>Asignatura *</label>
                <select
                  style={fieldStyle}
                  value={horarioForm.distributivo_asignatura}
                  onChange={(e) => setHorarioForm((p) => ({ ...p, distributivo_asignatura: e.target.value }))}
                >
                  <option value="">Seleccione la materia...</option>
                  {asignaturas.map((a: any) => {
                    const ao = asignaturasOfertadas.find((x) => x.id === a.asignatura_ofertada);
                    const gradoNombre = ao ? obtenerGradoNombre(ao.gradoOfertado) : (a.grado_nombre || "Grado");
                    const paraleloNombre = a.paralelo_nombre || "Ninguno";
                    return (
                      <option key={a.id} value={a.id}>
                        {a.asignatura_ofertada_nombre} — {gradoNombre} — {paraleloNombre}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={labelStyle}>Jornada / Turno *</label>
                <select
                  style={fieldStyle}
                  value={horarioForm.jornada_hora}
                  onChange={(e) => setHorarioForm((p) => ({ ...p, jornada_hora: e.target.value }))}
                >
                  <option value="">Seleccione el turno...</option>
                  {jornadas.map((j: any) => (
                    <option key={j.id} value={j.id}>
                      {j.nombre} ({j.hora_inicio} - {j.hora_fin})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={labelStyle}>Día *</label>
                  <select
                    style={fieldStyle}
                    value={horarioForm.dia_semana}
                    onChange={(e) => setHorarioForm((p) => ({ ...p, dia_semana: e.target.value }))}
                  >
                    <option value="LUNES">Lunes</option>
                    <option value="MARTES">Martes</option>
                    <option value="MIERCOLES">Miércoles</option>
                    <option value="JUEVES">Jueves</option>
                    <option value="VIERNES">Viernes</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Tipo *</label>
                  <select
                    style={fieldStyle}
                    value={horarioForm.tipo_horario}
                    onChange={(e) => setHorarioForm((p) => ({ ...p, tipo_horario: e.target.value }))}
                  >
                    <option value="CLASE">Clase</option>
                    <option value="COMPLEMENTARIA">Complementaria</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h4 style={{ margin: "0 0 16px", color: "var(--primary)" }}>Rango de Horas</h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={labelStyle}>Hora Inicio *</label>
                    <input
                      type="time"
                      style={fieldStyle}
                      value={horarioForm.hora_inicio}
                      onChange={(e) => setHorarioForm((p) => ({ ...p, hora_inicio: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Hora Fin *</label>
                    <input
                      type="time"
                      style={fieldStyle}
                      value={horarioForm.hora_fin}
                      onChange={(e) => setHorarioForm((p) => ({ ...p, hora_fin: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <button onClick={agregarHorario} style={btnProgramar}>
                📅 Programar en Agenda
              </button>
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <h4 style={{ margin: "0 0 12px", color: "var(--primary)" }}>Agenda Semanal Visual</h4>

            {horarios.length === 0 ? (
              <div
                style={{
                  background: "var(--surface-container-low)",
                  border: "1px solid var(--outline-variant)",
                  borderRadius: "8px",
                  padding: "32px",
                  textAlign: "center",
                  color: "var(--on-surface-variant)"
                }}
              >
                No hay clases programadas en la agenda semanal para este docente. Utilice el formulario superior para añadir clases.
              </div>
            ) : (
              <div style={{ ...container, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                  <thead>
                    <tr>
                      <th style={{ ...th, width: "150px", textAlign: "center" }}>Hora</th>
                      <th style={th}>Lunes</th>
                      <th style={th}>Martes</th>
                      <th style={th}>Miércoles</th>
                      <th style={th}>Jueves</th>
                      <th style={th}>Viernes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slotsUnicos.map((slot) => (
                      <tr key={slot} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                        <td
                          style={{
                            ...td,
                            fontWeight: "bold",
                            background: "var(--surface-container-low)",
                            color: "var(--primary)",
                            textAlign: "center",
                            verticalAlign: "middle"
                          }}
                        >
                          {slot}
                        </td>
                        {diasSemana.map((dia) => {
                          const items = horarios.filter((h) => {
                            const ini = (h.hora_inicio || "").substring(0, 5);
                            const fin = (h.hora_fin || "").substring(0, 5);
                            const hSlot = `${ini} - ${fin}`;
                            return hSlot === slot && h.dia_semana.toUpperCase() === dia;
                          });

                          return (
                            <td key={dia} style={{ ...td, verticalAlign: "top", padding: "8px", width: "18%" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {items.map((h: any) => {
                                  const labelMateria = obtenerFullAsignaturaNombre(h);
                                  return (
                                    <div
                                      key={h.id}
                                      style={{
                                        background: h.tipo_horario === "CLASE" ? "#eff6ff" : "#fef3c7",
                                        color: h.tipo_horario === "CLASE" ? "#1d4ed8" : "#b45309",
                                        border: `1px solid ${h.tipo_horario === "CLASE" ? "#bfdbfe" : "#fde68a"}`,
                                        padding: "8px",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        position: "relative",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "3px",
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                                      }}
                                    >
                                      <button
                                        onClick={() => quitarHorario(h.id)}
                                        style={{
                                          position: "absolute",
                                          top: "4px",
                                          right: "4px",
                                          background: "transparent",
                                          border: "none",
                                          color: "#ba1a1a",
                                          cursor: "pointer",
                                          fontSize: "12px",
                                          fontWeight: "bold",
                                          padding: "0 2px"
                                        }}
                                        title="Quitar clase"
                                      >
                                        ✕
                                      </button>
                                      <div style={{ fontWeight: 700, paddingRight: "14px", wordBreak: "break-word" }}>
                                        {labelMateria}
                                      </div>
                                      {h.jornada_nombre && (
                                        <div style={{ fontSize: "10px", opacity: 0.8, fontStyle: "italic" }}>
                                          {h.jornada_nombre}
                                        </div>
                                      )}
                                      <div
                                        style={{
                                          fontSize: "9px",
                                          fontWeight: 600,
                                          textTransform: "uppercase",
                                          alignSelf: "flex-start",
                                          background: h.tipo_horario === "CLASE" ? "#dbeafe" : "#fef3c7",
                                          padding: "1px 4px",
                                          borderRadius: "3px",
                                          marginTop: "2px"
                                        }}
                                      >
                                        {h.tipo_horario}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "var(--surface-container-lowest)",
            borderRadius: "8px",
            border: "1px solid var(--outline-variant)",
            overflow: "hidden"
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--primary)", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Docente</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Año Lectivo</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Observación</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {distributivos.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "20px", textAlign: "center" }}>
                    No hay distributivos registrados
                  </td>
                </tr>
              ) : (
                distributivos.map((d) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                    <td style={{ padding: "12px" }}>
                      <strong>{d.docente_nombre}</strong>
                    </td>
                    <td style={{ padding: "12px" }}>{d.anio_lectivo_nombre}</td>
                    <td style={{ padding: "12px" }}>{d.observacion}</td>
                    <td style={{ padding: "12px", textAlign: "center", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => abrirAsignaturas(d.id)}
                        style={btnAsignar}
                        title="Asignar Materias"
                      >
                        📚 Asignar Materias
                      </button>
                      <button
                        onClick={() => abrirHorarios(d.id)}
                        style={btnGestionar}
                        title="Gestionar Horario"
                      >
                        ⏰ Gestionar Horario
                      </button>
                      <button
                        onClick={() => abrirEditar(d)}
                        style={btnEditarSimple}
                        title="Editar"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => eliminar(d.id)}
                        style={btnEliminarSimple}
                        title="Eliminar"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
