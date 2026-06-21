import React from "react";
import { NAVIGATION_DECE } from "../config/navigationDece";

interface DeceLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export const DeceLayout: React.FC<DeceLayoutProps> = ({ currentView, onNavigate, children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
      <aside style={{ width: "280px", background: "var(--surface-container-lowest)", borderRight: "1px solid var(--outline-variant)", display: "flex", flexDirection: "column", padding: "20px 0" }}>
        <div style={{ padding: "0 20px 20px 20px", borderBottom: "1px solid var(--outline-variant)" }}>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--primary)" }}>SIGED</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--on-surface-variant)" }}>Especialista DECE</p>
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
          {NAVIGATION_DECE.map((group) => (
            <div key={group.groupLabel} style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--on-surface-variant)", padding: "0 12px", marginBottom: "8px", letterSpacing: "0.5px" }}>
                {group.groupLabel}
              </div>
              {group.items.map((item) => {
                const active = currentView === item.view;
                return (
                  <button key={item.view} onClick={() => onNavigate(item.view)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", marginBottom: "2px", borderRadius: "8px", border: "none", background: active ? "var(--primary)" : "transparent", color: active ? "var(--on-primary)" : "var(--on-surface)", fontWeight: active ? 600 : 500, fontSize: "14px", textAlign: "left", cursor: "pointer", transition: "background 0.15s ease" }}>
                    <span style={{ width: "24px", fontSize: "12px", fontWeight: 700 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ height: "64px", background: "var(--surface-container-lowest)", borderBottom: "1px solid var(--outline-variant)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
          <span style={{ fontWeight: 600, color: "var(--on-surface-variant)" }}>Panel DECE</span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: "14px" }}>DECE</div>
              <div style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>Soporte estudiantil</div>
            </div>
            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--primary)", color: "var(--on-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>DE</div>
          </div>
        </header>
        <main style={{ flex: 1, overflowY: "auto" }}>{children}</main>
      </div>
    </div>
  );
};
