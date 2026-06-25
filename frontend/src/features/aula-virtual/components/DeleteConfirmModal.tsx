import { X, AlertTriangle } from "lucide-react";
import type { Actividad } from "../../../types/entities";

interface Props {
  abierto: boolean;
  actividad: Actividad | null;
  onCerrar: () => void;
  onConfirmar: (id: number) => Promise<void>;
}

export function DeleteConfirmModal({ abierto, actividad, onCerrar, onConfirmar }: Props) {
  if (!abierto || !actividad) return null;

  const handleDelete = async () => {
    await onConfirmar(actividad.id);
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      {/* Glassmorphic Card Premium con micro-animaciones */}
      <div className="glassmorphic-card w-full max-w-sm mx-4 group">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#ba1a1a]" />
            <h3 className="text-lg font-bold text-[#00192d]">Eliminar Actividad</h3>
          </div>
          <button onClick={onCerrar} className="text-[#94a3b8] hover:text-[#00192d]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-[#64748b]">
            ¿Está seguro de eliminar la actividad <strong className="text-[#00192d]">{actividad.nombre}</strong>?
          </p>
          <p className="text-xs text-[#94a3b8] mt-2">Esta acción no se puede deshacer.</p>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] rounded-b-xl">
          <button
            onClick={onCerrar}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#64748b] hover:bg-[#e2e8f0] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#ba1a1a] hover:bg-[#991515] transition-colors shadow-sm"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
