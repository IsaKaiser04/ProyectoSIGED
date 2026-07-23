// src/config/NavIcon.tsx
//
// Componente para renderizar iconos de Lucide-react en la navegación.
// Importa los iconos necesarios y los renderiza según el nombre pasado.

import React from "react";
import {
  Home,
  Building2,
  Monitor,
  ClipboardList,
  CalendarCheck,
  LayoutList,
  FileUp,
  Bell,
  Users,
  LucideIcon,
} from "lucide-react";

// Catálogo de nombres de icono disponibles (tipo estricto, evita typos)
export type NavIconName =
  | "home"
  | "building"
  | "monitor"
  | "clipboard-list"
  | "calendar-check"
  | "layout-list"
  | "file-up"
  | "bell"
  | "users";

interface NavIconProps {
  name: NavIconName;
  size?: number;
  className?: string;
}

// Mapeo de nombres a componentes de iconos
const iconMap: Record<NavIconName, LucideIcon> = {
  home: Home,
  building: Building2,
  monitor: Monitor,
  "clipboard-list": ClipboardList,
  "calendar-check": CalendarCheck,
  "layout-list": LayoutList,
  "file-up": FileUp,
  bell: Bell,
  users: Users,
};

export const NavIcon: React.FC<NavIconProps> = ({ name, size = 20, className = "" }) => {
  const Icon = iconMap[name];

  if (!Icon) {
    console.warn(`NavIcon: "${name}" no es un icono válido.`);
    return null;
  }

  return <Icon size={size} className={className} />;
};