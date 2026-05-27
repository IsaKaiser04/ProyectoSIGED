import type { ReactNode } from "react";
import { navigationItems } from "../../config/navigation";

type DashboardLayoutProps = {
  activeModule: string;
  children: ReactNode;
};

export function DashboardLayout({ activeModule, children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar" aria-label="Menu principal SIGED">
        <section className="brand" aria-label="Identidad del sistema">
          <span className="brand-mark" aria-hidden="true">
            SG
          </span>
          <div>
            <strong>SIGED</strong>
            <span>Sistema de Gestion Educativa</span>
          </div>
        </section>

        <nav className="sidebar-nav" aria-label="Modulos del sistema">
          <ul>
            {navigationItems.map((item) => (
              <li key={item.module}>
                <a
                  href={item.href}
                  aria-current={item.module === activeModule ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="dashboard-workspace">
        <header className="dashboard-header">
          <section aria-labelledby="page-title">
            <p className="eyebrow">Panel administrativo</p>
            <h1 id="page-title">Dashboard SIGED</h1>
          </section>

          <section className="user-summary" aria-label="Usuario autenticado">
            <div>
              <strong>Usuario SIGED</strong>
              <span>Administrador academico</span>
            </div>
            <button type="button" className="user-avatar" aria-label="Abrir perfil de usuario">
              US
            </button>
          </section>
        </header>

        <main className="dashboard-main" id="contenido-principal">
          {children}
        </main>
      </div>
    </div>
  );
}
