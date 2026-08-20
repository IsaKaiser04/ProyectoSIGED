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
  BookOpen,
  Book,
  Layers,
  User,
  GraduationCap,
  Clock,
  Calendar,
  Hourglass,
  Sunrise,
  Folder,
  FileText,
  BarChart3,
  Globe,
  Shield,
  Mail,
  LucideIcon,
} from "lucide-react";

export type NavIconName =
  | "home"
  | "building"
  | "monitor"
  | "clipboard-list"
  | "calendar-check"
  | "layout-list"
  | "file-up"
  | "bell"
  | "users"
  | "book-open"
  | "book"
  | "layers"
  | "user"
  | "graduation-cap"
  | "clock"
  | "calendar"
  | "hourglass"
  | "sunrise"
  | "folder"
  | "file-text"
  | "bar-chart"
  | "globe"
  | "shield"
  | "mail";

interface NavIconProps {
  name: NavIconName;
  size?: number;
  className?: string;
}

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
  "book-open": BookOpen,
  book: Book,
  layers: Layers,
  user: User,
  "graduation-cap": GraduationCap,
  clock: Clock,
  calendar: Calendar,
  hourglass: Hourglass,
  sunrise: Sunrise,
  folder: Folder,
  "file-text": FileText,
  "bar-chart": BarChart3,
  globe: Globe,
  shield: Shield,
  mail: Mail,
};

export const NavIcon: React.FC<NavIconProps> = ({ name, size = 20, className = "" }) => {
  const Icon = iconMap[name];

  if (!Icon) {
    console.warn(`NavIcon: "${name}" no es un icono válido.`);
    return null;
  }

  return <Icon size={size} className={className} />;
};
