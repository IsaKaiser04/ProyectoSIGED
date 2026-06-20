// src/app/AdminApp.tsx
import { useState } from 'react';
import { AdminLayout } from '../layouts/AdminLayout';
import { UbicacionDashboard } from '../features/ubicacion/UbicacionDashboard';
import { InstitucionDashboard } from '../features/institucion/InstitucionDashboard';
import ActoresDashboard from '../features/actores-academicos/ActoresDashboard';

// Sub-componentes adaptados al sistema de diseño "Professional Trust"
const InicioBienvenida = () => (
  <div className="content-heading">
    <h2 className="page-title">Bienvenido al Dashboard de Gobernanza SIGED</h2>
    <p className="page-subtitle">
      Seleccione un módulo maestro en el menú lateral para operar el control institucional del cantón.
    </p>
  </div>
);

const SeguridadFuturaMock = () => (
  <div className="content-heading">
    <h2 className="page-title">Seguridad y Autenticación Centralizada</h2>
    <p className="page-subtitle">
      Módulo en desarrollo: Supervisión de sesiones activas en tiempo real, auditoría forense de logs de PostgreSQL y recuperación masiva de credenciales institucionales.
    </p>
    
    {/* Tarjeta informativa de estado simulada fiel a la captura */}
    <div className="form-container" style={{ marginTop: '24px', borderLeft: '4px solid var(--secondary)' }}>
      <h3 className="card-title" style={{ marginBottom: '6px' }}>Estado del Subsistema</h3>
      <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>
        Los filtros de seguridad basados en roles (RBAC) se encuentran operativos en la capa de transporte global.
      </p>
    </div>
  </div>
);

export function AdminApp() {
  // Estado de navegación unificado que interactúa con el AdminLayout
  const [currentView, setCurrentView] = useState<string>('inicio');

  const renderView = () => {
    switch (currentView) {
      case 'inicio':
        return <InicioBienvenida />;
      case 'instituciones':
        return <InstitucionDashboard />;
      case 'usuarios':
        return <ActoresDashboard />;
      case 'seguridad':
        return <SeguridadFuturaMock />;
      case 'ubicaciones':
        return <UbicacionDashboard />;
      default:
        return <InicioBienvenida />;
    }
  };

  return (
    <AdminLayout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </AdminLayout>
  );
}