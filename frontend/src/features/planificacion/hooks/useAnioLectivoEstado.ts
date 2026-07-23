import { useState, useEffect, useCallback } from 'react';

export interface DatosAnioLectivo {
  ofertasCount: number;
  gradosOfertadosCount: number;
  paralelosCount: number;
  estudiantesMatriculados: number;
  docentesAsignados: number;
  periodosConfigurados: number;
  esUnicoActivo: boolean;
}

export interface MensajesError {
  motivo: string;
  causas: string[];
}

export type ModalType =
  | 'none'
  | 'confirmarActivar'
  | 'confirmarDesactivar'
  | 'noPreparado'
  | 'unicoActivo'
  | 'errorServidor';

interface BannerState {
  tipo: 'success' | 'error';
  mensaje: string;
  detalle?: string;
}

interface UseAnioLectivoEstadoReturn {
  activo: boolean;
  modalType: ModalType;
  modalLoading: boolean;
  banner: BannerState | null;
  mensajesError: MensajesError | null;
  handleClick: () => void;
  confirmar: () => Promise<void>;
  cerrarModal: () => void;
  cerrarBanner: () => void;
}

export const useAnioLectivoEstado = (
  id: number,
  nombre: string,
  estadoInicial: boolean,
  datosAnio: DatosAnioLectivo,
  onCambioEstado: (id: number, nuevoEstado: boolean) => Promise<void>,
): UseAnioLectivoEstadoReturn => {
  const [activo, setActivo] = useState(estadoInicial);
  const [prevActivo, setPrevActivo] = useState(estadoInicial);
  const [modalType, setModalType] = useState<ModalType>('none');
  const [modalLoading, setModalLoading] = useState(false);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [mensajesError, setMensajesError] = useState<MensajesError | null>(null);
  const [accionPendiente, setAccionPendiente] = useState<boolean | null>(null);

  useEffect(() => {
    setActivo(estadoInicial);
    setPrevActivo(estadoInicial);
  }, [estadoInicial]);

  const validarListoParaActivar = (): { listo: boolean; faltan: string[] } => {
    const faltan: string[] = [];
    if (datosAnio.ofertasCount === 0) faltan.push('ofertas académicas');
    if (datosAnio.periodosConfigurados === 0) faltan.push('períodos académicos');
    if (datosAnio.gradosOfertadosCount === 0) faltan.push('grados ofertados');
    return { listo: faltan.length === 0, faltan };
  };

  const handleClick = useCallback(() => {
    const nuevoEstado = !activo;
    setActivo(nuevoEstado);
    setPrevActivo(activo);
    setAccionPendiente(nuevoEstado);

    if (nuevoEstado) {
      const { listo, faltan } = validarListoParaActivar();
      if (!listo) {
        setMensajesError({
          motivo: `El año lectivo no está completamente configurado.`,
          causas: faltan.map(f => `Falta: ${f}`),
        });
        setModalType('noPreparado');
        return;
      }
      setModalType('confirmarActivar');
    } else {
      if (datosAnio.esUnicoActivo) {
        setMensajesError({
          motivo: `"${nombre}" es el único año activo del sistema.`,
          causas: ['Debe activar otro año lectivo antes de desactivar este.'],
        });
        setModalType('unicoActivo');
        return;
      }
      setModalType('confirmarDesactivar');
    }
  }, [activo, datosAnio, nombre]);

  const cerrarModal = useCallback(() => {
    setModalType('none');
    setActivo(prevActivo);
    setAccionPendiente(null);
    setMensajesError(null);
  }, [prevActivo]);

  const confirmar = useCallback(async () => {
    if (accionPendiente === null) return;
    setModalLoading(true);
    try {
      await onCambioEstado(id, accionPendiente);
      setModalType('none');
      setModalLoading(false);
      setBanner({
        tipo: 'success',
        mensaje: `"${nombre}" ${accionPendiente ? 'activado' : 'desactivado'} exitosamente.`,
        detalle: accionPendiente
          ? 'Las matrículas y el seguimiento académico están habilitados.'
          : 'El año queda como historial.',
      });
      setPrevActivo(accionPendiente);
    } catch (err: any) {
      setModalType('errorServidor');
      setModalLoading(false);
      const msg = err?.message || err?.data?.detail || 'Error de conexión con el servidor';
      setMensajesError({
        motivo: `No se pudo ${accionPendiente ? 'activar' : 'desactivar'} "${nombre}".`,
        causas: [
          msg,
          'Verifique que el año no tenga datos inconsistentes.',
          'Si el problema persiste, contacte al administrador.',
        ],
      });
      setActivo(prevActivo);
    }
  }, [id, nombre, accionPendiente, onCambioEstado, prevActivo]);

  const cerrarBanner = useCallback(() => {
    setBanner(null);
  }, []);

  return {
    activo, modalType, modalLoading, banner, mensajesError,
    handleClick, confirmar, cerrarModal, cerrarBanner,
  };
};
