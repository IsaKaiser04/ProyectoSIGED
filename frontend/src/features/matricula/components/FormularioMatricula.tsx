import React, { useState } from "react";
import { crearMatricula } from "../services/matriculaApi";

interface Props {
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export const FormularioMatricula: React.FC<Props> = ({ onSaveSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    estudiante_id: "",
    paralelo_id: "",
    representante_id: "",
    matricula_periodo: "",
    tiene_discapacidad: false,
    tipo_discapacidad: "",
    grado_discapacidad: ""
  });
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setEnviando(true);
      const payload = {
        ...formData,
        estudiante_id: Number(formData.estudiante_id),
        paralelo_id: Number(formData.paralelo_id),
        representante_id: Number(formData.representante_id),
        matricula_periodo: Number(formData.matricula_periodo)
      };
      await crearMatricula(payload);
      alert("Solicitud de matrícula creada correctamente.");
      onSaveSuccess();
    } catch (error) {
      console.error("Error al crear matrícula:", error);
      alert("Error al registrar la matrícula.");
    } finally {
      setEnviando(false);
    }
  };

  const fieldStyle: React.CSSProperties = { width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px", border: "1px solid var(--outline-variant)", background: "var(--surface)", color: "var(--on-surface)" };
  const labelStyle: React.CSSProperties = { display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--on-surface)" };

  return (
    <form onSubmit={handleSubmit} style={{ background: "var(--surface-container-lowest)", borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ padding: "20px", borderBottom: "1px solid var(--outline-variant)" }}>
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "22px", fontWeight: "700" }}>Nueva Solicitud de Matrícula</h2>
      </div>

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ background: "var(--surface-container-low)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "20px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "16px", color: "var(--primary)" }}>1. Datos del Estudiante y Asignación</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            <div>
              <label style={labelStyle}>ID Estudiante</label>
              <input type="number" name="estudiante_id" style={fieldStyle} value={formData.estudiante_id} onChange={handleChange} required />
            </div>
            <div>
              <label style={labelStyle}>ID Representante</label>
              <input type="number" name="representante_id" style={fieldStyle} value={formData.representante_id} onChange={handleChange} required />
            </div>
            <div>
              <label style={labelStyle}>ID Paralelo</label>
              <input type="number" name="paralelo_id" style={fieldStyle} value={formData.paralelo_id} onChange={handleChange} required />
            </div>
            <div>
              <label style={labelStyle}>ID Periodo de Matrícula</label>
              <input type="number" name="matricula_periodo" style={fieldStyle} value={formData.matricula_periodo} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div style={{ background: "var(--surface-container-low)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "20px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "16px", color: "var(--primary)" }}>2. Información de Apoyo (DECE)</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <input type="checkbox" name="tiene_discapacidad" checked={formData.tiene_discapacidad} onChange={handleChange} />
            <label style={{ ...labelStyle, marginBottom: 0 }}>¿Tiene alguna discapacidad o necesidad educativa?</label>
          </div>
          
          {formData.tiene_discapacidad && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Tipo de Discapacidad</label>
                <input type="text" name="tipo_discapacidad" style={fieldStyle} value={formData.tipo_discapacidad} onChange={handleChange} />
              </div>
              <div>
                <label style={labelStyle}>Grado de Discapacidad</label>
                <input type="text" name="grado_discapacidad" style={fieldStyle} value={formData.grado_discapacidad} onChange={handleChange} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "20px", borderTop: "1px solid var(--outline-variant)", background: "var(--surface-container-low)" }}>
        <button type="button" onClick={onCancel} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--outline)", background: "var(--surface)", cursor: "pointer" }}>Cancelar</button>
        <button type="submit" disabled={enviando} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "var(--secondary)", color: "white", fontWeight: "600", cursor: "pointer" }}>
          {enviando ? "Guardando..." : "Crear Solicitud"}
        </button>
      </div>
    </form>
  );
};
