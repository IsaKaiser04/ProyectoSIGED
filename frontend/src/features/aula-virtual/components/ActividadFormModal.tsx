import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Actividad, ActividadPayload } from "../../../types/entities";

interface Props {
  abierto: boolean;
  editando: Actividad | null;
  onCerrar: () => void;
  onGuardar: (payload: ActividadPayload, id?: number) => Promise<void>;
}

export function ActividadFormModal({ abierto, editando, onCerrar, onGuardar }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (editando) {
      setNombre(editando.nombre);
      setDescripcion(editando.descripcion || "");
      setFechaFin(editando.fecha_fin || "");
    } else {
      setNombre("");
      setDescripcion("");
      setFechaFin("");
    }
  }, [editando, abierto]);

  if (!abierto) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setEnviando(true);
    try {
      await onGuardar(
        {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          fecha_fin: fechaFin || undefined,
          distributivo_asignatura: editando?.distributivo_asignatura ?? 0,
        },
        editando?.id,
      );
      onCerrar();
    } finally {
      setEnviando(false);
    }
  };

  const esEdicion = !!editando;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      {/* Glassmorphic Card Premium con micro-animaciones */}
      <div className="glassmorphic-card w-full max-w-md mx-4 group">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <h3 className="text-lg font-bold text-[#00192d]">
            {esEdicion ? "Editar Actividad" : "Nueva Actividad"}
          </h3>
          <button onClick={onCerrar} className="text-[#94a3b8] hover:text-[#00192d]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#00192d] mb-1">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: TAREA 1: ENSAYO CRÍTICO"
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#00192d] placeholder-[#94a3b8] focus:outline-none focus:border-[#0066ff]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#00192d] mb-1">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                placeholder="Instrucciones o detalles de la actividad"
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#00192d] placeholder-[#94a3b8] focus:outline-none focus:border-[#0066ff] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#00192d] mb-1">Fecha Límite</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#00192d] focus:outline-none focus:border-[#0066ff]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] rounded-b-xl">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#64748b] hover:bg-[#e2e8f0] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando || !nombre.trim()}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#0066ff] hover:bg-[#0052cc] transition-colors shadow-sm disabled:opacity-50"
            >
              {enviando ? "Guardando..." : esEdicion ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
