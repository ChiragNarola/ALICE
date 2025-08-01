import { useEffect, useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  LayoutDashboard,
  // CalendarClock,
  // Users,
  // Settings,
  // Building2,
  // GraduationCap,
  // Laptop2,
  // User,
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
      href: "/admin-dashboard",
    },
    // {
    //   title: "Child",
    //   icon: User,
    //   href: "/admin-child",
    // },
    // {
    //   title: "Parent",
    //   icon: Building2,
    //   href: "/admin-parent",
    // },
    // {
    //   title: "Staff",
    //   icon: Users,
    //   href: "/admin-staff",
    // },
    // {
    //   title: "Qualification",
    //   icon: GraduationCap,
    //   href: "/admin-qualification",
    // },
    // {
    //   title: "Developer",
    //   icon: Laptop2,
    //   href: "/admin-developer",
    // },
    // {
    //   title: "Timetable",
    //   icon: CalendarClock,
    //   href: "/admin-timetable",
    // },
    // {
    //   title: "Settings",
    //   icon: Settings,
    //   href: "/admin-settings",
    // },
  ];
};
