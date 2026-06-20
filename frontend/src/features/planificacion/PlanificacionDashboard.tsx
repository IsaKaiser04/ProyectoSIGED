import React, { useState } from "react";
import { usePlanificacion } from "./hooks/usePlanificacion";
import { crearAnioLectivo, crearParalelo, actualizarParalelo } from "./services/planificacionApi";

export default function PlanificacionDashboard() {
  const { anios, paralelos, loading, refrescar } = usePlanificacion();
  const [tab, setTab] = useState<"anios" | "paralelos">("anios");
  
  const [showModalAnio, setShowModalAnio] = useState(false);
  const [showModalParalelo, setShowModalParalelo] = useState(false);
  const [editingParalelo, setEditingParalelo] = useState<any | null>(null);

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "20px" }}>
        <h2 style={{ margin: 0, color: "var(--primary)" }}>Gestión Académica y Planificación</h2>
        <p style={{ marginTop: "8px", color: "var(--on-surface-variant)" }}>Administre los años lectivos, oferta de grados y la capacidad de cupos de los paralelos.</p>
      </div>

      <div style={{ display: "flex", gap: "10px", borderBottom: "2px solid var(--outline-variant)" }}>
        <button onClick={() => setTab("anios")} style={{ padding: "10px 20px", background: tab === "anios" ? "var(--primary)" : "transparent", color: tab === "anios" ? "white" : "var(--on-surface)", border: "none", borderBottom: tab === "anios" ? "3px solid var(--primary)" : "none", cursor: "pointer", fontWeight: "600" }}>Años Lectivos</button>
        <button onClick={() => setTab("paralelos")} style={{ padding: "10px 20px", background: tab === "paralelos" ? "var(--primary)" : "transparent", color: tab === "paralelos" ? "white" : "var(--on-surface)", border: "none", borderBottom: tab === "paralelos" ? "3px solid var(--primary)" : "none", cursor: "pointer", fontWeight: "600" }}>Paralelos y Cupos</button>
      </div>

      {loading ? (
        <div style={{ padding: "20px", textAlign: "center" }}>Cargando datos...</div>
      ) : (
        <>
          {tab === "anios" && (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                <button onClick={() => setShowModalAnio(true)} style={{ background: "var(--secondary)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>+ Nuevo Año Lectivo</button>
              </div>
              <div style={{ background: "white", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--primary)", color: "white" }}>
                      <th style={{ padding: "12px" }}>Nombre</th>
                      <th style={{ padding: "12px" }}>Inicio</th>
                      <th style={{ padding: "12px" }}>Fin</th>
                      <th style={{ padding: "12px" }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anios.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: "20px", textAlign: "center" }}>No hay años lectivos configurados.</td></tr>
                    ) : (
                      anios.map(a => (
                        <tr key={a.id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                          <td style={{ padding: "12px" }}>{a.nombre || `${a.fecha_inicio} - ${a.fecha_fin}`}</td>
                          <td style={{ padding: "12px" }}>{a.fecha_inicio}</td>
                          <td style={{ padding: "12px" }}>{a.fecha_fin}</td>
                          <td style={{ padding: "12px" }}>
                            <span style={{ background: a.is_active ? "#dcfce7" : "#fee2e2", color: a.is_active ? "#166534" : "#991b1b", padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600" }}>
                              {a.is_active ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "paralelos" && (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                <button onClick={() => { setEditingParalelo(null); setShowModalParalelo(true); }} style={{ background: "var(--secondary)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>+ Nuevo Paralelo</button>
              </div>
              <div style={{ background: "white", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--primary)", color: "white" }}>
                      <th style={{ padding: "12px" }}>ID</th>
                      <th style={{ padding: "12px" }}>Nombre Paralelo</th>
                      <th style={{ padding: "12px" }}>Jornada</th>
                      <th style={{ padding: "12px" }}>Cupos Ocupados</th>
                      <th style={{ padding: "12px" }}>Cupo Máximos</th>
                      <th style={{ padding: "12px" }}>Disponibles</th>
                      <th style={{ padding: "12px" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paralelos.length === 0 ? (
                      <tr><td colSpan={7} style={{ padding: "20px", textAlign: "center" }}>No hay paralelos configurados.</td></tr>
                    ) : (
                      paralelos.map(p => {
                        const cuposMax = p.cupos_maximo || 0;
                        const cuposOcu = p.cupos_ocupados || 0;
                        const disponibles = cuposMax - cuposOcu;
                        return (
                          <tr key={p.id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                            <td style={{ padding: "12px" }}>{p.id}</td>
                            <td style={{ padding: "12px" }}>{p.nombre || `Paralelo ${p.id}`}</td>
                            <td style={{ padding: "12px" }}>{p.jornada || "N/A"}</td>
                            <td style={{ padding: "12px" }}>{cuposOcu}</td>
                            <td style={{ padding: "12px" }}>{cuposMax}</td>
                            <td style={{ padding: "12px" }}>
                              <span style={{ color: disponibles <= 0 ? "#dc2626" : "#16a34a", fontWeight: "700" }}>{disponibles <= 0 ? "LLENO" : disponibles}</span>
                            </td>
                            <td style={{ padding: "12px" }}>
                              <button onClick={() => { setEditingParalelo(p); setShowModalParalelo(true); }} style={{ background: "#2563eb", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}>Editar Cupos</button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL AÑO LECTIVO */}
      {showModalAnio && <ModalAnioLectivo onClose={() => setShowModalAnio(false)} onSave={async (data) => { await crearAnioLectivo(data); setShowModalAnio(false); refrescar(); }} />}

      {/* MODAL PARALELO */}
      {showModalParalelo && <ModalParalelo paralelo={editingParalelo} onClose={() => setShowModalParalelo(false)} onSave={async (data) => { 
        if (editingParalelo) { await actualizarParalelo(editingParalelo.id, data); } 
        else { await crearParalelo(data); } 
        setShowModalParalelo(false); refrescar(); 
      }} />}
    </div>
  );
}

const ModalAnioLectivo = ({ onClose, onSave }: any) => {
  const [data, setData] = useState({ nombre: "", fecha_inicio: "", fecha_fin: "", is_active: true });
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
      <div style={{ background: "white", padding: "24px", borderRadius: "10px", width: "400px" }}>
        <h3 style={{ marginTop: 0 }}>Nuevo Año Lectivo</h3>
        <input style={{ width: "100%", marginBottom: "12px", padding: "8px" }} placeholder="Nombre (Ej: 2025-2026)" value={data.nombre} onChange={e => setData({...data, nombre: e.target.value})} />
        <input style={{ width: "100%", marginBottom: "12px", padding: "8px" }} type="date" value={data.fecha_inicio} onChange={e => setData({...data, fecha_inicio: e.target.value})} />
        <input style={{ width: "100%", marginBottom: "12px", padding: "8px" }} type="date" value={data.fecha_fin} onChange={e => setData({...data, fecha_fin: e.target.value})} />
        <label><input type="checkbox" checked={data.is_active} onChange={e => setData({...data, is_active: e.target.checked})} /> Activo</label>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", border: "1px solid var(--outline)", borderRadius: "6px" }}>Cancelar</button>
          <button onClick={() => onSave(data)} style={{ padding: "8px 16px", background: "var(--primary)", color: "white", border: "none", borderRadius: "6px" }}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

const ModalParalelo = ({ paralelo, onClose, onSave }: any) => {
  const [data, setData] = useState({ nombre: paralelo?.nombre || "", jornada: paralelo?.jornada || "MATUTINA", cupos_maximo: paralelo?.cupos_maximo || 35 });
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
      <div style={{ background: "white", padding: "24px", borderRadius: "10px", width: "400px" }}>
        <h3 style={{ marginTop: 0 }}>{paralelo ? "Editar Cupos de Paralelo" : "Nuevo Paralelo"}</h3>
        <input style={{ width: "100%", marginBottom: "12px", padding: "8px" }} placeholder="Nombre (Ej: Paralelo A)" value={data.nombre} onChange={e => setData({...data, nombre: e.target.value})} disabled={!!paralelo} />
        <select style={{ width: "100%", marginBottom: "12px", padding: "8px" }} value={data.jornada} onChange={e => setData({...data, jornada: e.target.value})} disabled={!!paralelo}>
          <option value="MATUTINA">Matutina</option>
          <option value="VESPERTINA">Vespertina</option>
          <option value="NOCTURNA">Nocturna</option>
        </select>
        <label style={{ display: "block", marginBottom: "6px" }}>Cupos Máximos</label>
        <input style={{ width: "100%", marginBottom: "12px", padding: "8px" }} type="number" value={data.cupos_maximo} onChange={e => setData({...data, cupos_maximo: Number(e.target.value)})} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", border: "1px solid var(--outline)", borderRadius: "6px" }}>Cancelar</button>
          <button onClick={() => onSave(data)} style={{ padding: "8px 16px", background: "var(--primary)", color: "white", border: "none", borderRadius: "6px" }}>Guardar</button>
        </div>
      </div>
    </div>
  );
};
