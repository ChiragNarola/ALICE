import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Laptop2,
  ClipboardCheck
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
    {
      title: "Staff",
      icon: Users,
      href: "/admin/staff",
    },
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
    // {
    //   title: "Timetable",
    //   icon: CalendarClock,
    //   href: "/admin/timetable",
    // },
    // {
    //   title: "Settings",
    //   icon: Settings,
    //   href: "/admin/settings",
    // },
  ];
};
