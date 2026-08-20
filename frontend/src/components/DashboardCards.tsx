import React from "react";

export type CardColor = { bg: string; border: string; text: string };

export const CARD_COLORS: Record<string, CardColor> = {
  info: { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8" },
  warning: { bg: "#fef3c7", border: "#fcd34d", text: "#b45309" },
  success: { bg: "#d1fae5", border: "#34d399", text: "#065f46" },
  danger: { bg: "#fee2e2", border: "#fca5a5", text: "#ba1a1a" },
};

export function DialogCard({
  title,
  subtitle,
  value,
  icon: Icon,
  colorKey,
  right,
  loading,
  children,
}: {
  title: string;
  subtitle: string;
  value: string;
  icon: React.ElementType;
  colorKey: keyof typeof CARD_COLORS;
  right?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}) {
  const c = CARD_COLORS[colorKey];

  return (
    <div
      style={{
        background: "white",
        border: "1px solid var(--outline-variant)",
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: c.bg,
              border: `1px solid ${c.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={20} color={c.text} />
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.4, color: "var(--on-surface-variant)" }}>
              {title}
            </div>
            <div style={{ marginTop: 4, fontSize: 28, fontWeight: 900, color: "var(--on-surface)" }}>
              {loading ? "—" : value}
            </div>
            <div style={{ marginTop: 2, fontSize: 13, color: "var(--on-surface-variant)", fontWeight: 600 }}>
              {subtitle}
            </div>
          </div>
        </div>

        {right}
      </div>

      {children && <div style={{ marginTop: 16 }}>{children}</div>}
    </div>
  );
}

export function GlassInfoCard({
  icon: Icon,
  label,
  value,
  iconBg,
  iconBorder,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface-container-lowest)",
        border: "1px solid var(--outline-variant)",
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: iconBg,
          border: `1px solid ${iconBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={15} color={iconColor} />
      </div>
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: "var(--on-surface-variant)",
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "var(--on-surface)",
            marginTop: 1,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export function percent(n: number) {
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n)}%`;
}
