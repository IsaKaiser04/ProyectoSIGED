import React, { useState, useRef } from 'react';

interface JustificacionFormProps {
  asistenciaId: number;
  onGuardar: (asistenciaId: number, motivo: string, archivo: File) => Promise<boolean>;
  onCancel: () => void;
  guardando: boolean;
}

const JustificacionForm: React.FC<JustificacionFormProps> = ({
  asistenciaId,
  onGuardar,
  onCancel,
  guardando,
}) => {
  const [motivo, setMotivo] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    if (!motivo.trim()) {
      setErrorLocal('El motivo es obligatorio');
      return;
    }
    if (!archivo) {
      setErrorLocal('Debe adjuntar el documento de evidencia (PDF)');
      return;
    }

    const exito = await onGuardar(asistenciaId, motivo.trim(), archivo);
    if (!exito) {
      setErrorLocal('Error al enviar la justificación');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        <strong>Nota:</strong> La justificación será revisada por Secretaría. 
        Debe adjuntar un documento de respaldo (médico, personal, etc.).
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de la justificación *</label>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ej: El estudiante acudió al médico por control de salud..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          disabled={guardando}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Documento de evidencia * (PDF/Imagen, máx 5MB)</label>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={guardando}
        />
        {archivo && (
          <p className="mt-1 text-xs text-green-600">✓ {archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)</p>
        )}
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
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {guardando && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          Enviar Justificación
        </button>
      </div>
    </form>
  );
};

export default JustificacionForm;
