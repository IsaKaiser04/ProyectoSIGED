import React, { useState } from 'react';
import { useUbicacion } from './hooks/useUbicacion';
import { PanelFiltros } from './components/PanelFiltros';
import { TabCanton } from './components/TabCanton';
import { TabProvincia } from './components/TabProvincia';
import { TabPais } from './components/TabPais';
import { TabParroquia } from './components/TabParroquia'; // 1. Importamos la pestaña real

export const UbicacionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pais' | 'provincia' | 'canton' | 'parroquia'>('pais');

  // 2. Añadimos cantonesFiltradosForm y parroquiaForm que extraemos del hook actualizado
  const {
    paises,
    provincias,
    cantones,
    parroquias,
    provinciasFiltradasFiltro,
    provinciasFiltradasForm,
    cantonesFiltradosForm, // <-- Agregado para la cascada del formulario
    paisForm,
    provinciaForm,
    cantonForm,
    parroquiaForm,          // <-- Agregado para controlar el submit y los inputs
    filtros,
  } = useUbicacion(activeTab);

  const tabLabel: Record<string, string> = {
    pais: 'Catálogo de Países',
    provincia: 'Catálogo de Provincias',
    canton: 'Catálogo de Cantones',
    parroquia: 'Catálogo de Parroquias',
  };

  return (
    <div className="dashboard-content" style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>

      {/* Encabezado */}
      <div className="content-heading" style={{ padding: '8px 0', marginBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '-0.3px' }}>
          {tabLabel[activeTab]}
        </h2>
      </div>

      {/* Tabs de navegación */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--outline-variant)',
        background: 'var(--surface-container-lowest)', borderRadius: '8px', marginBottom: '20px',
      }}>
        {((['pais', 'provincia', 'canton', 'parroquia'] as const)).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '12px 16px', border: 'none', background: 'transparent',
              fontSize: 'var(--font-body-sm)',
              fontWeight: activeTab === tab ? '700' : '500',
              color: activeTab === tab ? 'var(--primary)' : 'var(--on-surface-variant)',
              borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
              textTransform: 'capitalize', transition: 'all 0.2s ease', cursor: 'pointer',
            }}
          >
            {tab === 'pais' ? '🗺️ País' : tab === 'provincia' ? '📖 Provincia' : tab === 'canton' ? '🏢 Cantón' : '📍 Parroquia'}
          </button>
        ))}
      </div>

      {/* Grid principal: filtros (izquierda) + contenido (derecha) */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>

      {/* COLUMNA IZQUIERDA — Panel de filtros */}
      <PanelFiltros
        activeTab={activeTab}
        paises={paises}
        provinciasFiltradasFiltro={provinciasFiltradasFiltro}
        cantonesFiltradosFiltro={cantonesFiltradosForm} // <-- Le pasamos también la cascada de cantones calculada en el hook
        filtros={filtros}
      />
        {/* COLUMNA DERECHA — Formulario + Tabla del tab activo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>

          {activeTab === 'pais' && (
            <TabPais paises={paises} paisForm={paisForm} />
          )}

          {activeTab === 'provincia' && (
            <TabProvincia paises={paises} provincias={provincias} provinciaForm={provinciaForm} />
          )}

          {activeTab === 'canton' && (
            <TabCanton
              paises={paises}
              provinciasFiltradasForm={provinciasFiltradasForm}
              cantones={cantones}
              cantonForm={cantonForm}
            />
          )}

          {/* 3. Reemplazamos el recuadro estático por el componente real de Parroquia */}
          {activeTab === 'parroquia' && (
            <TabParroquia
              paises={paises}
              provinciasFiltradasForm={provinciasFiltradasForm}
              cantonesFiltradosForm={cantonesFiltradosForm || []}
              parroquias={parroquias || []}
              parroquiaForm={parroquiaForm}
            />
          )}

        </div>
      </div>
    </div>
  );
};