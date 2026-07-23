import React, { useState, useEffect, useCallback } from 'react';
import ModalConfirmacion from './ModalConfirmacion';

interface Dependencias {
  ofertas?: number;
  estudiantes?: number;
}

interface Props {
  id: number;
  nombre: string;
  estadoInicial: boolean;
  tipo: 'plan' | 'anio' | 'oferta';
  onConfirmar: (id: number, estado: boolean) => Promise<void>;
  dependencias?: Dependencias;
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999,
  animation: 'fadeIn 0.2s ease',
};

const box: React.CSSProperties = {
  background: '#fff', borderRadius: 8, padding: 24,
  maxWidth: 400, width: '90%',
  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
};

const btnBase: React.CSSProperties = {
  padding: '10px 24px', borderRadius: 8, border: 'none',
  fontWeight: 600, fontSize: 14, cursor: 'pointer',
};

const track = (on: boolean): React.CSSProperties => ({
  width: 48, height: 24, borderRadius: 12, position: 'relative' as const,
  cursor: 'pointer', transition: 'background 0.2s',
  background: on ? '#16a34a' : '#9ca3af', display: 'inline-block',
  verticalAlign: 'middle',
});

const thumb: React.CSSProperties = {
  width: 20, height: 20, borderRadius: '50%', background: '#fff',
  position: 'absolute', top: 2, transition: 'left 0.2s',
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
};

const msgConfig = {
  plan: {
    entity: 'plan',
    entityArticle: 'Este plan',
    desactivar: 'No se podrán crear nuevas ofertas',
    activar: 'Se habilitará la creación de nuevas ofertas',
    activarExtra: 'El plan anterior se desactivará automáticamente',
  },
  anio: {
    entity: 'año lectivo',
    entityArticle: 'Este año lectivo',
    desactivar: 'No se podrán crear nuevas ofertas para este año lectivo',
    activar: 'Se habilitará la creación de nuevas ofertas',
    activarExtra: 'El año anterior se desactivará automáticamente',
  },
  oferta: {
    entity: 'oferta académica',
    entityArticle: 'Esta oferta académica',
    desactivar: 'No se podrán realizar nuevas matrículas',
    activar: 'Se habilitarán nuevas matrículas',
    activarExtra: '',
  },
};

const ToggleConConfirmacion: React.FC<Props> = ({
  id, nombre, estadoInicial, tipo, onConfirmar, dependencias,
}) => {
  const [activo, setActivo] = useState(estadoInicial);
  const [prevActivo, setPrevActivo] = useState(estadoInicial);
  const [showModal, setShowModal] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState(false);
  const [banner, setBanner] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);
  const [animandoBanner, setAnimandoBanner] = useState(false);
  const [errorModal, setErrorModal] = useState<{ mensaje: string; detalle?: string } | null>(null);

  useEffect(() => {
    setActivo(estadoInicial);
    setPrevActivo(estadoInicial);
  }, [estadoInicial]);

  const abrirModal = () => {
    const nuevo = !activo;
    setActivo(nuevo);
    setPrevActivo(activo);
    setNuevoEstado(nuevo);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setActivo(prevActivo);
  };

  const confirmar = async () => {
    setShowModal(false);
    try {
      await onConfirmar(id, nuevoEstado);
      setBanner({
        tipo: 'success',
        mensaje: `"${nombre}" ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
      });
      setPrevActivo(nuevoEstado);
    } catch (err: any) {
      setActivo(prevActivo);
      const data = err?.data;
      let mensaje = `Error al ${nuevoEstado ? 'activar' : 'desactivar'} "${nombre}"`;
      let detalle: string | undefined;
      if (data) {
        const msg = data.non_field_errors?.[0] || data.detail || data.mensaje;
        if (typeof data === 'object' && !Array.isArray(data)) {
          const fieldErrors = Object.entries(data)
            .filter(([k]) => k !== 'non_field_errors' && k !== 'detail')
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
            .join('; ');
          if (fieldErrors) detalle = fieldErrors;
        }
        if (msg) mensaje = msg;
      }
      setErrorModal({ mensaje, detalle });
    }
  };

  const cerrarBanner = useCallback(() => {
    setAnimandoBanner(true);
    setTimeout(() => {
      setBanner(null);
      setAnimandoBanner(false);
    }, 300);
  }, []);

  useEffect(() => {
    if (banner && !animandoBanner) {
      const timer = setTimeout(cerrarBanner, 3000);
      return () => clearTimeout(timer);
    }
  }, [banner, animandoBanner, cerrarBanner]);

  const msg = msgConfig[tipo];
  const esDesactivar = !nuevoEstado;
  const tieneDeps = dependencias && (dependencias.ofertas || dependencias.estudiantes);

  return (
    <>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <div style={track(activo)} onClick={abrirModal} title={activo ? 'Activo' : 'Inactivo'}>
          <div style={{ ...thumb, left: activo ? 26 : 2 }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: activo ? '#166534' : '#6b7280' }}>
          {activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {showModal && (
        <div style={overlay} onClick={cerrarModal}>
          <div style={box} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600, color: '#1f2937' }}>
              {esDesactivar ? `¿Desactivar "${nombre}"?` : `¿Activar "${nombre}"?`}
            </h3>

            {esDesactivar && tieneDeps ? (
              <div style={{ marginBottom: 20, fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 12px', fontWeight: 500 }}>{msg.entityArticle} tiene:</p>
                {dependencias!.ofertas ? (
                  <p style={{ margin: '0 0 6px' }}>• {dependencias!.ofertas} ofertas académicas activas</p>
                ) : null}
                {dependencias!.estudiantes ? (
                  <p style={{ margin: '0 0 12px' }}>• {dependencias!.estudiantes} estudiantes matriculados</p>
                ) : null}
                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '8px 0' }} />
                <p style={{ margin: '0 0 6px', fontWeight: 500 }}>Al desactivar:</p>
                <p style={{ margin: '0 0 4px' }}>• {msg.desactivar}</p>
                <p style={{ margin: 0 }}>• Las ofertas existentes se mantienen</p>
              </div>
            ) : esDesactivar ? (
              <div style={{ marginBottom: 20, fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>
                <p style={{ margin: 0 }}>
                  Al desactivar {msg.desactivar.charAt(0).toLowerCase() + msg.desactivar.slice(1)}.
                </p>
              </div>
            ) : (
              <div style={{ marginBottom: 20, fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 8px', fontWeight: 500 }}>Al activar:</p>
                <p style={{ margin: '0 0 4px' }}>• {msg.activar}</p>
                {msg.activarExtra ? (
                  <p style={{ margin: 0 }}>• {msg.activarExtra}</p>
                ) : null}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={cerrarModal}
                style={{ ...btnBase, background: '#f3f4f6', color: '#374151' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmar}
                style={{
                  ...btnBase,
                  background: esDesactivar ? '#dc2626' : '#16a34a',
                  color: '#fff',
                }}
              >
                {esDesactivar ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalConfirmacion
        open={!!errorModal}
        variant="error"
        titulo={`No se pudo ${nuevoEstado ? 'activar' : 'desactivar'} "${nombre}"`}
        textoConfirmar="Entendido"
        onConfirm={() => setErrorModal(null)}
        onCancel={() => setErrorModal(null)}
        hideCancel
      >
        <p style={{ margin: '0 0 8px', fontWeight: 500 }}>{errorModal?.mensaje}</p>
        {errorModal?.detalle && (
          <div style={{ marginTop: 12, padding: '10px 12px', background: '#fef2f2', borderRadius: 6, fontSize: 13, color: '#991b1b', border: '1px solid #fecaca' }}>
            {errorModal.detalle}
          </div>
        )}
      </ModalConfirmacion>

      {banner?.tipo === 'success' && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999999,
            height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, color: '#fff', fontSize: 15, fontWeight: 500,
            background: '#16a34a',
            animation: animandoBanner ? 'bannerUp 0.3s ease forwards' : 'bannerDown 0.3s ease',
          }}
        >
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 22, height: 22, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              fontSize: 13, fontWeight: 700,
            }}
          >
            ✓
          </span>
          {banner.mensaje}
          <button
            onClick={cerrarBanner}
            style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
              cursor: 'pointer', fontSize: 16, padding: '2px 10px', borderRadius: 4,
              lineHeight: '24px',
            }}
          >
            ✕
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes bannerDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes bannerUp {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(-100%); opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default ToggleConConfirmacion;
