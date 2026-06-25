import { navigationItems, type NavigationItem } from "../config/navigation";

type DashboardHomeProps = {
  selectedModule: NavigationItem;
};

export function DashboardHome({ selectedModule }: DashboardHomeProps) {
  return (
    <section className="dashboard-content" aria-labelledby="dashboard-resumen">
      <div className="content-heading">
        <p className="eyebrow">Inicializacion frontend</p>
        <h2 id="dashboard-resumen">Arquitectura modular alineada al backend</h2>
        <p>
          La interfaz queda preparada para consumir los endpoints Django REST por
          modulo y evolucionar cada dominio de forma independiente.
        </p>
      </div>

      <article className="module-detail" aria-labelledby="modulo-activo">
        <div>
          <p className="eyebrow">Modulo seleccionado</p>
          <h3 id="modulo-activo">{selectedModule.label}</h3>
          <p>{selectedModule.summary}</p>
        </div>
        <dl>
          <div>
            <dt>Feature frontend</dt>
            <dd>{selectedModule.module}</dd>
          </div>
          <div>
            <dt>API backend</dt>
            <dd>{selectedModule.apiBase}</dd>
          </div>
          <div>
            <dt>Requisito</dt>
            <dd>{selectedModule.requirement}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>{selectedModule.status}</dd>
          </div>
        </dl>
      </article>

      <section className="module-grid" aria-label="Modulos disponibles">
        {navigationItems.map((item) => (
          <article className="module-card" key={item.module}>
            <span>{item.module}</span>
            <h3>{item.label}</h3>
            <p>{item.summary}</p>
            <a href={item.href}>Abrir modulo</a>
          </article>
        ))}
      </section>
    </section>
  );
}
