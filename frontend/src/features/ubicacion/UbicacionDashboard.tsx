import React, { useState } from 'react';
import { useUbicacion } from './hooks/useUbicacion';
import { PanelFiltros } from './components/PanelFiltros';
import { TabCanton } from './components/TabCanton';
import { TabProvincia } from './components/TabProvincia';
import { TabPais } from './components/TabPais';
import { TabParroquia } from './components/TabParroquia';
import { FormularioPais } from './components/FormularioPais';
import { FormularioProvincia } from './components/FormularioProvincia';
import { FormularioCanton } from './components/FormularioCanton';
import { FormularioParroquia } from './components/FormularioParroquia';
import { Pagination } from '../../components/Pagination';

export const UbicacionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pais' | 'provincia' | 'canton' | 'parroquia'>('pais');
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const {
    paises,
    provincias,
    cantones,
    parroquias,
    provinciasFiltradasFiltro,
    provinciasFiltradasForm,
    cantonesFiltradosForm,
    paisForm,
    provinciaForm,
    cantonForm,
    parroquiaForm,
    filtros,
    refresh,
  } = useUbicacion(activeTab);

  const dataAtual = activeTab === 'pais' ? paises : activeTab === 'provincia' ? provincias : activeTab === 'canton' ? cantones : (parroquias || []);
  const totalPages = Math.ceil(dataAtual.length / rowsPerPage) || 1;
  const startIndex = (page - 1) * rowsPerPage;
  const dataPaginated = dataAtual.slice(startIndex, startIndex + rowsPerPage);

  React.useEffect(() => { setPage(1); }, [activeTab]);

  const tabLabel: Record<string, string> = {
    pais: 'Catálogo de Países',
    provincia: 'Catálogo de Provincias',
    canton: 'Catálogo de Cantones',
    parroquia: 'Catálogo de Parroquias',
  };

  const btnLabel: Record<string, string> = {
    pais: '+ Nuevo País',
    provincia: '+ Nueva Provincia',
    canton: '+ Nuevo Cantón',
    parroquia: '+ Nueva Parroquia',
  };

  const handleSaveSuccess = () => {
    setShowForm(false);
    refresh();
  };

  const modalOverlay: React.CSSProperties = {
    position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.4)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
  };
  const modalContent: React.CSSProperties = {
    width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
    background: 'white', borderRadius: '10px',
  };

  const renderForm = () => {
    const props = { onSaveSuccess: handleSaveSuccess, onCancel: () => setShowForm(false), paises };
    switch (activeTab) {
      case 'pais': return <FormularioPais {...props} />;
      case 'provincia': return <FormularioProvincia {...props} />;
      case 'canton': return <FormularioCanton {...props} />;
      case 'parroquia': return <FormularioParroquia {...props} />;
    }
  };

  return (
    <div className="dashboard-content" style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>
      <div className="content-heading" style={{ padding: '8px 0', marginBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '-0.3px' }}>
          {tabLabel[activeTab]}
        </h2>
      </div>

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setShowForm(true)}
            style={{ background: 'var(--secondary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
          >
            {btnLabel[activeTab]}
          </button>
        </div>

        <PanelFiltros
          activeTab={activeTab}
          paises={paises}
          provinciasFiltradasFiltro={provinciasFiltradasFiltro}
          cantonesFiltradosFiltro={cantonesFiltradosForm}
          filtros={filtros}
        />

        {activeTab === 'pais' && <TabPais paises={dataPaginated} paisForm={paisForm} />}
        {activeTab === 'provincia' && <TabProvincia paises={paises} provincias={dataPaginated} provinciaForm={provinciaForm} />}
        {activeTab === 'canton' && (
          <TabCanton paises={paises} provinciasFiltradasForm={provinciasFiltradasForm} cantones={dataPaginated} cantonForm={cantonForm} />
        )}
        {activeTab === 'parroquia' && (
          <TabParroquia
            paises={paises}
            provinciasFiltradasForm={provinciasFiltradasForm}
            cantonesFiltradosForm={cantonesFiltradosForm || []}
            parroquias={dataPaginated}
            parroquiaForm={parroquiaForm}
          />
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showForm && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            {renderForm()}
          </div>
        </div>
      )}
    </div>
  );
};