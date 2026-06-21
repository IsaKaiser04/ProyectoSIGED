// src/app/AdminApp.tsx
import { useState } from 'react';
import { AdminLayout } from '../layouts/AdminLayout';
import { UbicacionDashboard } from '../features/ubicacion/UbicacionDashboard';
import { InstitucionDashboard } from '../features/institucion/InstitucionDashboard';
import ActoresDashboard from '../features/actores-academicos/ActoresDashboard';

const InicioBienvenida = () => (
  <div className="content-heading">
    <h2>Bienvenido al Dashboard de Gobernanza SIGED</h2>
    <p>Seleccione un módulo maestro en el menú lateral para operar.</p>
  </div>
);

const SeguridadFuturaMock = () => (
  <div className="content-heading">
    <h2>Seguridad y Autenticación Centralizada</h2>
    <p style={{ marginTop: '8px', color: 'var(--on-surface-variant)' }}>
      Módulo en desarrollo: Supervisión de sesiones activas, auditoría de logs de PostgreSQL y recuperación masiva de credenciales institucionales.
    </p>
  </div>
);

export function AdminApp() {
  // Estado de navegación unificado
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