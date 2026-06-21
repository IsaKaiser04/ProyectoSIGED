import React, { useState, useEffect } from 'react';
import { useAnioLectivo } from '../hooks/useAnioLectivo';
import { useOferta } from '../hooks/useOferta';
import { FormAnioLectivo } from '../componentes/anioLectivoOfertaAcademica/FormAnioLectivo';
import { TablaAnioLectivo } from '../componentes/anioLectivoOfertaAcademica/TablaAnioLectivo';
import { FormOfertaAcademica } from '../componentes/anioLectivoOfertaAcademica/FormOfertaAcademica';
import { TablaOfertaAcademica } from '../componentes/anioLectivoOfertaAcademica/TablaOfertaAcademica';

export const DashboardAniosLectivosOfertaAcademica: React.FC = () => {
  const [seccionActiva, setSeccionActiva] = useState<'anios' | 'oferta'>('anios');
  const [filtroTexto, setFiltroTexto] = useState('');

  const { 
    anios, cargarAnios, handleAgregarAnio, handleEliminarAnio,
    nuevoAnio, setNuevoAnio, fechaInicio, setFechaInicio, fechaFin, setFechaFin, 
    esActivoAnio, setEsActivoAnio, institucionAnio, setInstitucionAnio 
  } = useAnioLectivo();

  const { 
    ofertas, cargarOfertas, handleAgregarOferta,
    nuevaOferta, setNuevaOferta, anioOferta, setAnioOferta
  } = useOferta();

  useEffect(() => {
    cargarAnios();
    cargarOfertas();
  }, [cargarAnios, cargarOfertas]);

  return (
    <div className="page-content">
      <div className="topbar-title-group" style={{ marginBottom: '24px' }}>
        <h2>Gestión Académica</h2>
        <p>Configuración de periodos lectivos y estructura de oferta educativa</p>
      </div>

      <div className="tabs-container">
        <div 
          className={`tab-item ${seccionActiva === 'anios' ? 'active' : ''}`} 
          onClick={() => setSeccionActiva('anios')}
        >
          🏫 Años Lectivos
        </div>
        <div 
          className={`tab-item ${seccionActiva === 'oferta' ? 'active' : ''}`} 
          onClick={() => setSeccionActiva('oferta')}
        >
          📖 Oferta Académica
        </div>
      </div>

      <div className="search-input-wrapper" style={{ marginBottom: '20px' }}>
        <input 
          className="search-input"
          placeholder="Buscar..." 
          value={filtroTexto} 
          onChange={(e) => setFiltroTexto(e.target.value)} 
        />
      </div>

      {seccionActiva === 'anios' ? (
        <>
          <FormAnioLectivo 
            nuevoAnio={nuevoAnio} setNuevoAnio={setNuevoAnio}
            fechaInicio={fechaInicio} setFechaInicio={setFechaInicio}
            fechaFin={fechaFin} setFechaFin={setFechaFin}
            esActivoAnio={esActivoAnio} setEsActivoAnio={setEsActivoAnio}
            institucionAnio={institucionAnio} setInstitucionAnio={setInstitucionAnio}
            handleAgregarAnio={handleAgregarAnio}
          />
          <TablaAnioLectivo 
            anios={anios.filter(a => a.nombre.toLowerCase().includes(filtroTexto.toLowerCase()))} 
            handleEliminarAnio={handleEliminarAnio} 
          />
        </>
      ) : (
        <>
          <FormOfertaAcademica 
            nuevaOferta={nuevaOferta} setNuevaOferta={setNuevaOferta}
            anioOferta={anioOferta} setAnioOferta={setAnioOferta}
            handleAgregarOferta={handleAgregarOferta}
            anios={anios}
          />
          <TablaOfertaAcademica 
            ofertas={ofertas.filter(o => o.nombre.toLowerCase().includes(filtroTexto.toLowerCase()))} 
          />
        </>
      )}
    </div>
  );
};