import React, { useState } from 'react';
import { IncidenciaTipo } from '../services/asistenciaApi';

interface IncidenciaFormProps {
  asistenciaId?: number;
  matriculaId?: number;
  onGuardar: (data: {
    asunto: string;
    detalle: string;
    tipo: IncidenciaTipo;
    asistencia?: number;
    matricula?: number;
    notificar: boolean;
    archivo?: File;
  }) => Promise<boolean>;
  onCancel: () => void;
  guardando: boolean;
}

const IncidenciaForm: React.FC<IncidenciaFormProps> = ({
  asistenciaId,
  matriculaId,
  onGuardar,
  onCancel,
  guardando,
}) => {
  const [asunto, setAsunto] = useState('');
  const [detalle, setDetalle] = useState('');
  const [tipo, setTipo] = useState<IncidenciaTipo>('ASISTENCIAL');
  const [notificar, setNotificar] = useState(true);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    if (!asunto.trim()) {
      setErrorLocal('El asunto es obligatorio');
      return;
    }

    const exito = await onGuardar({
      asunto: asunto.trim(),
      detalle: detalle.trim(),
      tipo,
      asistencia: asistenciaId,
      matricula: matriculaId,
      notificar,
      archivo: archivo || undefined,
    });

    if (!exito) {
      setErrorLocal('Error al guardar la incidencia');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Asunto *</label>
        <input
          type="text"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Ej: Alumno no presentó tarea"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={guardando}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Incidencia</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as IncidenciaTipo)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={guardando}
        >
          <option value="ASISTENCIAL">Asistencial</option>
          <option value="COMPORTAMIENTO">Comportamiento</option>
          <option value="ACADEMICO">Académico</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Detalle</label>
        <textarea
          value={detalle}
          onChange={(e) => setDetalle(e.target.value)}
          placeholder="Describa la incidencia..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          disabled={guardando}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Evidencia (PDF/Imagen, máx 5MB)</label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={guardando}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="notificar"
          checked={notificar}
          onChange={(e) => setNotificar(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          disabled={guardando}
        />
        <label htmlFor="notificar" className="text-sm text-gray-700">
          Notificar al representante
        </label>
      </div>

      {errorLocal && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
          {errorLocal}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={guardando}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando}
          className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
        >
          {guardando && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          Registrar Incidencia
        </button>
      </div>
    </form>
  );
};

export default IncidenciaForm;
