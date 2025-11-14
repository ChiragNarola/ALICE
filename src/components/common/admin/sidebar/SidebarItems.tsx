import {
  LayoutDashboard,
  Users,
  Laptop2,
  ClipboardCheck,
  FileText,
  Origami,
  CalendarDays
} from "lucide-react";

export interface SidebarItemBadge {
  count?: number;
  color: {
    bg: string;
    text: string;
  };
}

export interface SidebarSubItem {
  title: string;
  icon: any;
}

export interface SidebarItem {
  title: string;
  icon: any;
  href?: string;
  badge?: SidebarItemBadge;
  expandable?: boolean;
  subItems?: SidebarSubItem[];
}

export const useSidebarItems = (): SidebarItem[] => {
  return [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin/dashboard",
    },
    {
      title: "User",
      icon: Users,
      href: "/admin/user",
    },
    // {
    //   title: "Staff",
    //   icon: Users,
    //   href: "/admin/staff",
    // },
    {
      title: "Concerns",
      icon: ClipboardCheck,
      href: "/admin/concerns",
    },
    {
      title: "Area of Interest",
      icon: Laptop2,
      href: "/admin/area-of-interest",
    },
    {
      title: "Documents",
      icon: FileText,
      href: "/admin/documents",
    },
    {
      title: "Holiday Calendar",
      icon: CalendarDays,
      href: "/admin/holiday-calendar",
    },
    {
      title: "Nursary",
      icon: Origami,
      href: "/admin/nursaries",
    },
    // {
    //   title: "Settings",
    //   icon: Settings,
    //   href: "/admin/settings",
    // },
  ];
};
