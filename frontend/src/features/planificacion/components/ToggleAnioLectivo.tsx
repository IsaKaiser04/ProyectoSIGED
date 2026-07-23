import React from 'react';
import type { DatosAnioLectivo } from '../hooks/useAnioLectivoEstado';
import { useAnioLectivoEstado } from '../hooks/useAnioLectivoEstado';
import ModalConfirmacion from './ModalConfirmacion';
import BannerSuperior from './BannerSuperior';

interface ToggleAnioLectivoProps {
  id: number;
  nombre: string;
  estadoInicial: boolean;
  datosAnio: DatosAnioLectivo;
  onCambioEstado: (id: number, nuevoEstado: boolean) => Promise<void>;
}

const trackStyle = (on: boolean): React.CSSProperties => ({
  width: 48, height: 24, borderRadius: 12, position: 'relative' as const,
  cursor: 'pointer', transition: 'background 0.2s',
  background: on ? '#16a34a' : '#9ca3af', display: 'inline-block',
  verticalAlign: 'middle', flexShrink: 0,
});

const thumbStyle: React.CSSProperties = {
  width: 20, height: 20, borderRadius: '50%', background: '#fff',
  position: 'absolute', top: 2, transition: 'left 0.2s',
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
};

const ToggleAnioLectivo: React.FC<ToggleAnioLectivoProps> = ({
  id, nombre, estadoInicial, datosAnio, onCambioEstado,
}) => {
  const {
    activo, modalType, modalLoading, banner, mensajesError,
    handleClick, confirmar, cerrarModal, cerrarBanner,
  } = useAnioLectivoEstado(id, nombre, estadoInicial, datosAnio, onCambioEstado);

  return (
    <>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <div
          style={trackStyle(activo)}
          onClick={handleClick}
          title={activo ? 'Activo' : 'Inactivo'}
        >
          <div style={{ ...thumbStyle, left: activo ? 26 : 2 }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: activo ? '#166534' : '#6b7280' }}>
          {activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <ModalConfirmacion
        open={modalType === 'noPreparado'}
        variant="advertencia"
        titulo={`No se puede activar "${nombre}"`}
        textoConfirmar="Entendido"
        onConfirm={cerrarModal}
        onCancel={cerrarModal}
        hideCancel
      >
        <p style={{ margin: '0 0 12px', fontWeight: 500 }}>
          El año lectivo no está completamente configurado. Faltan:
        </p>
        {mensajesError?.causas.map((c, i) => (
          <p key={i} style={{ margin: '0 0 4px 8px' }}>• {c}</p>
        ))}
        <div style={{ marginTop: 12, padding: '10px 12px', background: '#fef3c7', borderRadius: 6, fontSize: 13, color: '#92400e' }}>
          Complete la configuración antes de activar.
        </div>
      </ModalConfirmacion>

      <ModalConfirmacion
        open={modalType === 'confirmarActivar'}
        variant="confirmacion"
        titulo={`¿Activar "${nombre}"?`}
        textoConfirmar="Activar"
        colorConfirmar="#16a34a"
        onConfirm={confirmar}
        onCancel={cerrarModal}
        loading={modalLoading}
      >
        <p style={{ margin: '0 0 12px', fontWeight: 500 }}>Este año tiene:</p>
        {datosAnio.ofertasCount > 0 && <p style={{ margin: '0 0 4px' }}>• {datosAnio.ofertasCount} oferta(s) académica(s)</p>}
        {datosAnio.gradosOfertadosCount > 0 && <p style={{ margin: '0 0 4px' }}>• {datosAnio.gradosOfertadosCount} grado(s) ofertados</p>}
        {datosAnio.paralelosCount > 0 && <p style={{ margin: '0 0 4px' }}>• {datosAnio.paralelosCount} paralelo(s)</p>}
        {datosAnio.periodosConfigurados > 0 && <p style={{ margin: '0 0 12px' }}>• {datosAnio.periodosConfigurados} período(s) académico(s)</p>}
        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '8px 0' }} />
        <p style={{ margin: '0 0 4px', fontWeight: 500 }}>Al activar:</p>
        <p style={{ margin: '0 0 2px' }}>• Se habilitarán matrículas</p>
        <p style={{ margin: '0 0 2px' }}>• Se habilitará asistencia y calificaciones</p>
        {datosAnio.esUnicoActivo === false && (
          <p style={{ margin: 0 }}>• El año anterior se desactivará automáticamente</p>
        )}
      </ModalConfirmacion>

      <ModalConfirmacion
        open={modalType === 'confirmarDesactivar'}
        variant={datosAnio.estudiantesMatriculados > 0 ? 'advertencia' : 'confirmacion'}
        titulo={
          datosAnio.estudiantesMatriculados > 0
            ? `Advertencia: "${nombre}" tiene estudiantes matriculados`
            : `¿Desactivar "${nombre}"?`
        }
        textoConfirmar="Desactivar"
        colorConfirmar="#dc2626"
        onConfirm={confirmar}
        onCancel={cerrarModal}
        loading={modalLoading}
      >
        {datosAnio.estudiantesMatriculados > 0 && (
          <>
            <p style={{ margin: '0 0 12px', fontWeight: 500 }}>Este año tiene:</p>
            {datosAnio.estudiantesMatriculados > 0 && (
              <p style={{ margin: '0 0 4px' }}>• {datosAnio.estudiantesMatriculados} estudiantes matriculados</p>
            )}
            {datosAnio.docentesAsignados > 0 && (
              <p style={{ margin: '0 0 12px' }}>• {datosAnio.docentesAsignados} docentes asignados</p>
            )}
            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '8px 0' }} />
          </>
        )}
        <p style={{ margin: '0 0 4px', fontWeight: 500 }}>Al desactivar:</p>
        <p style={{ margin: '0 0 2px' }}>• NO se podrán registrar nuevas matrículas</p>
        {datosAnio.docentesAsignados > 0 && (
          <p style={{ margin: '0 0 2px' }}>• Los docentes perderán acceso a sus aulas virtuales</p>
        )}
        <p style={{ margin: '0 0 2px' }}>• Las calificaciones y asistencias existentes se preservan</p>
        {datosAnio.estudiantesMatriculados === 0 && (
          <p style={{ margin: '0 0 2px' }}>• Los datos históricos se preservan</p>
        )}
      </ModalConfirmacion>

      <ModalConfirmacion
        open={modalType === 'unicoActivo'}
        variant="error"
        titulo="No se puede desactivar"
        textoConfirmar="Entendido"
        onConfirm={cerrarModal}
        onCancel={cerrarModal}
        hideCancel
      >
        <p style={{ margin: '0 0 8px', fontWeight: 500 }}>
          &ldquo;{nombre}&rdquo; es el único año activo del sistema.
        </p>
        <p style={{ margin: 0 }}>
          Debe activar otro año lectivo antes de desactivar este.
        </p>
      </ModalConfirmacion>

      <ModalConfirmacion
        open={modalType === 'errorServidor'}
        variant="error"
        titulo="Error al cambiar estado"
        textoConfirmar="Entendido"
        onConfirm={cerrarModal}
        onCancel={cerrarModal}
        hideCancel
      >
        <p style={{ margin: '0 0 8px', fontWeight: 500 }}>
          {mensajesError?.motivo || `Error al procesar la solicitud.`}
        </p>
        {mensajesError?.causas && (
          <>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: '#6b7280' }}>Posibles causas:</p>
            {mensajesError.causas.map((c, i) => (
              <p key={i} style={{ margin: '0 0 2px 8px', fontSize: 13 }}>• {c}</p>
            ))}
          </>
        )}
      </ModalConfirmacion>

      {banner && (
        <BannerSuperior
          tipo={banner.tipo}
          mensaje={`${banner.mensaje} ${banner.detalle || ''}`}
          onClose={cerrarBanner}
          autoClose={4000}
        />
      )}
    </>
  );
};

export default ToggleAnioLectivo;
