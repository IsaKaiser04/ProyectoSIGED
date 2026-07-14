import React from "react";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<Props> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const btnStyle = (active = false): React.CSSProperties => ({
    minWidth: "36px", height: "36px", borderRadius: "6px",
    border: active ? "none" : "1px solid var(--outline-variant)",
    background: active ? "var(--primary)" : "var(--surface)",
    color: active ? "var(--on-primary)" : "var(--on-surface)",
    fontWeight: 600, cursor: "pointer", fontSize: "13px",
    padding: "0 10px",
  });

  const pages: React.ReactNode[] = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  if (start > 1) pages.push(<span key="start-dots" style={{ padding: "0 4px", color: "var(--on-surface-variant)" }}>...</span>);
  for (let i = start; i <= end; i++) {
    pages.push(
      <button key={i} onClick={() => onPageChange(i)} style={btnStyle(i === page)}>
        {i}
      </button>
    );
  }
  if (end < totalPages) pages.push(<span key="end-dots" style={{ padding: "0 4px", color: "var(--on-surface-variant)" }}>...</span>);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "16px 0" }}>
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
        style={{ ...btnStyle(), opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? "default" : "pointer" }}>
        &lt;
      </button>
      {pages}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
        style={{ ...btnStyle(), opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? "default" : "pointer" }}>
        &gt;
      </button>
    </div>
  );
};