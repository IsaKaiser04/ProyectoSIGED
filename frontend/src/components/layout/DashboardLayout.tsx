import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-shell">
      {/* ← sidebar faltaba aquí */}
      <aside className="dashboard-sidebar">
        <div className="brand">
          <div className="brand-mark">SG</div>
          <div>
            <strong>Dashboard SIGED</strong>
          </div>
        </div>
        {/* nav items aquí */}
      </aside>

      <div className="dashboard-workspace">
        <header className="dashboard-header">
          ...
        </header>
        <main className="dashboard-main" id="contenido-principal">
          {children}
        </main>
      </div>
    </div>
  );
}
